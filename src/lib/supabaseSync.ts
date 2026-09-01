import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL : undefined) || 
  'https://tcsblgpiufflkitislpz.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY : undefined) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc2JsZ3BpdWZmbGtpdGlzbHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTYzNjAsImV4cCI6MjEwMzYzMjM2MH0.E8BphiNRyLHSC58SXPmU6CaWDMScn9HllLZw2V8DPO8';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Circuit breaker for handling Supabase network reachability gracefully
let supabaseOfflineUntil = 0;
const COOLDOWN_PERIOD_MS = 60000; // 1-minute backoff when network is unreachable

export function isNetworkError(err: any): boolean {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err.message || err.error_description || String(err)).toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('undici') ||
    err.name === 'TypeError'
  );
}

export function canAttemptSupabase(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (Date.now() < supabaseOfflineUntil) return false;
  return true;
}

export function markSupabaseOffline(err?: any) {
  supabaseOfflineUntil = Date.now() + COOLDOWN_PERIOD_MS;
}

/**
 * Registers user in Supabase Authentication (auth.users)
 */
export async function registerUserInSupabaseAuth(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  userObject?: any
) {
  if (!canAttemptSupabase()) return null;
  try {
    let authData = null;

    // 1. Try standard signUp first
    try {
      const { data, error } = await supabaseServer.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, role: userObject?.role || 'student' }
        }
      });
      if (error) {
        if (isNetworkError(error)) {
          markSupabaseOffline(error);
          return null;
        }
      } else if (data && data.user) {
        authData = data;
      }
    } catch (e: any) {
      if (isNetworkError(e)) {
        markSupabaseOffline(e);
        return null;
      }
    }

    // 2. Try admin.createUser if available and signUp didn't succeed
    if (!authData && supabaseServer.auth && (supabaseServer.auth as any).admin?.createUser) {
      try {
        const { data, error } = await (supabaseServer.auth as any).admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, phone, role: userObject?.role || 'student' }
        });
        if (error) {
          if (isNetworkError(error)) {
            markSupabaseOffline(error);
            return null;
          }
        } else {
          authData = data;
        }
      } catch (e: any) {
        if (isNetworkError(e)) {
          markSupabaseOffline(e);
          return null;
        }
      }
    }

    // 3. Always sync user profile & login data into Supabase app_users database table
    const targetEmail = userObject?.email || email;
    if (targetEmail && canAttemptSupabase()) {
      try {
        const userId = userObject?.id || 'usr_' + Math.random().toString(36).substring(2, 9);
        const enrolledList = Array.isArray(userObject?.enrolledCourseTitles) 
          ? userObject.enrolledCourseTitles 
          : (userObject?.course ? [userObject.course] : []);

        const payload: any = {
          id: userId,
          name: userObject?.name || name || '',
          email: targetEmail.toLowerCase().trim(),
          phone: userObject?.phone || phone || '',
          password: password || userObject?.password || '',
          role: userObject?.role || 'student',
          isApproved: userObject?.isApproved !== undefined ? Boolean(userObject.isApproved) : false,
          course: enrolledList.length > 0 ? enrolledList[0] : (userObject?.course || ''),
          batch: userObject?.studentClass || userObject?.batch || '',
          enrolledCourseTitles: enrolledList,
          enrolledCourseIds: Array.isArray(userObject?.enrolledCourseIds) ? userObject.enrolledCourseIds : [],
          transactionId: userObject?.transactionId || '',
          avatar: userObject?.photoUrl || userObject?.avatarUrl || userObject?.avatar || '',
          joinedAt: userObject?.joinedAt || userObject?.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: upsertErr } = await supabaseServer.from('app_users').upsert(payload, { onConflict: 'id' });

        if (upsertErr && isNetworkError(upsertErr)) {
          markSupabaseOffline(upsertErr);
        }
      } catch (dbErr: any) {
        if (isNetworkError(dbErr)) {
          markSupabaseOffline(dbErr);
        }
      }
    }

    return authData;
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
    return null;
  }
}

/**
 * Ensures a Supabase Storage bucket exists
 */
export async function ensureSupabaseBucket(bucket: string) {
  if (!canAttemptSupabase()) return;
  try {
    const { error } = await supabaseServer.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 524288000 // 500MB
    });
    if (error) {
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
      }
    }
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

/**
 * Uploads base64 or file buffer to Supabase Storage bucket and returns public URL with strict timeout
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  filePath: string,
  base64OrBuffer: string | Buffer,
  contentType: string = 'application/octet-stream'
): Promise<string | null> {
  if (!canAttemptSupabase()) return null;
  try {
    let buffer: Buffer;
    if (Buffer.isBuffer(base64OrBuffer)) {
      buffer = base64OrBuffer;
    } else if (typeof base64OrBuffer === 'string') {
      const cleanBase64 = base64OrBuffer.includes(';base64,') 
        ? base64OrBuffer.split(';base64,')[1] 
        : base64OrBuffer;
      buffer = Buffer.from(cleanBase64, 'base64');
    } else {
      return null;
    }

    // 6-second timeout for Supabase Storage uploads to avoid blocking user workflows
    const uploadPromise = (async () => {
      let { data, error } = await supabaseServer.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType,
          upsert: true
        });

      if (error) {
        if (isNetworkError(error)) {
          markSupabaseOffline(error);
          return null;
        }
        if (error.message?.toLowerCase().includes('bucket not found') || (error as any).statusCode === '404' || (error as any).status === 404) {
          await ensureSupabaseBucket(bucket);
          if (canAttemptSupabase()) {
            const retryResult = await supabaseServer.storage
              .from(bucket)
              .upload(filePath, buffer, {
                contentType,
                upsert: true
              });
            data = retryResult.data;
            error = retryResult.error;
          }
        }
      }

      if (error || !data) {
        return null;
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrlData?.publicUrl || null;
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
    return null;
  }
}

/**
 * Deletes file from Supabase Storage bucket
 */
export async function deleteFromSupabaseStorage(bucket: string, filePath: string) {
  if (!canAttemptSupabase()) return;
  try {
    await supabaseServer.storage.from(bucket).remove([filePath]);
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

/**
 * Removes a record from Supabase table by ID
 */
export async function deleteFromSupabase(table: string, id: string) {
  if (!canAttemptSupabase() || !id) return;
  try {
    const { error } = await supabaseServer.from(table).delete().eq('id', id);
    if (error && isNetworkError(error)) {
      markSupabaseOffline(error);
    }
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

/**
 * Targeted real-time upsert for a single user in Supabase
 */
export async function upsertUserToSupabase(u: any) {
  if (!canAttemptSupabase() || !u || !u.id) return;
  try {
    const enrolledList = Array.isArray(u.enrolledCourseTitles) 
      ? u.enrolledCourseTitles 
      : (u.course ? [u.course] : (Array.isArray(u.enrolled_courses) ? u.enrolled_courses : []));

    const payload: any = {
      id: u.id,
      name: u.name || '',
      email: u.email ? u.email.toLowerCase().trim() : '',
      phone: u.phone || '',
      password: u.password || '',
      role: u.role || 'student',
      isApproved: u.isApproved !== undefined ? Boolean(u.isApproved) : (u.is_approved !== undefined ? Boolean(u.is_approved) : false),
      course: enrolledList.length > 0 ? enrolledList[0] : (u.course || ''),
      batch: u.studentClass || u.batch || '',
      enrolledCourseTitles: enrolledList,
      enrolledCourseIds: Array.isArray(u.enrolledCourseIds) ? u.enrolledCourseIds : [],
      transactionId: u.transactionId || u.transaction_id || '',
      avatar: u.photoUrl || u.avatarUrl || u.avatar || '',
      joinedAt: u.joinedAt || u.createdAt || u.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let maxRetries = 8;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      const { error } = await supabaseServer.from('app_users').upsert(payload, { onConflict: 'id' });
      if (!error) return;
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
        return;
      }
      const missingCol = extractMissingColumn(error.message || '');
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else {
        break;
      }
    }
  } catch (e: any) {
    if (isNetworkError(e)) {
      markSupabaseOffline(e);
    }
  }
}

/**
 * Targeted real-time upsert for a single class in Supabase
 */
export async function upsertClassToSupabase(c: any) {
  if (!canAttemptSupabase() || !c || !c.id) return;
  try {
    const payload: any = {
      id: c.id,
      title: c.title,
      subject: c.subject,
      videoUrl: c.videoUrl || '',
      thumbnailUrl: c.thumbnailUrl || '',
      courseId: c.courseId || '',
      courseTitle: c.courseTitle || '',
      description: c.description || '',
      updated_at: new Date().toISOString()
    };

    let maxRetries = 10;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      const { error } = await supabaseServer.from('app_classes').upsert(payload, { onConflict: 'id' });
      if (!error) return;
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
        return;
      }
      const missingCol = extractMissingColumn(error.message || '');
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else {
        break;
      }
    }
  } catch (e: any) {
    if (isNetworkError(e)) {
      markSupabaseOffline(e);
    }
  }
}

/**
 * Targeted real-time upsert for a single note in Supabase
 */
export async function upsertNoteToSupabase(n: any) {
  if (!canAttemptSupabase() || !n || !n.id) return;
  try {
    const payload: any = {
      id: n.id,
      title: n.title,
      subject: n.subject,
      pdfUrl: n.pdfUrl || '',
      courseId: n.courseId || '',
      courseTitle: n.courseTitle || '',
      description: n.description || '',
      updated_at: new Date().toISOString()
    };

    let maxRetries = 10;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      const { error } = await supabaseServer.from('app_notes').upsert(payload, { onConflict: 'id' });
      if (!error) return;
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
        return;
      }
      const missingCol = extractMissingColumn(error.message || '');
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else {
        break;
      }
    }
  } catch (e: any) {
    if (isNetworkError(e)) {
      markSupabaseOffline(e);
    }
  }
}

/**
 * Targeted real-time upsert for a single course in Supabase
 */
export async function upsertCourseToSupabase(cr: any) {
  if (!canAttemptSupabase() || !cr || !cr.id) return;
  try {
    const payload: any = {
      id: cr.id,
      title: cr.title,
      subject: cr.subject,
      price: Number(cr.price || 0),
      originalPrice: cr.originalPrice !== undefined && cr.originalPrice !== null ? Number(cr.originalPrice) : null,
      imageUrl: cr.imageUrl || '',
      batch: cr.classLevel || cr.batch || '',
      duration: cr.duration || '',
      description: cr.description || '',
      updated_at: new Date().toISOString()
    };

    let maxRetries = 10;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      const { error } = await supabaseServer.from('app_courses').upsert(payload, { onConflict: 'id' });
      if (!error) return;
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
        return;
      }
      const missingCol = extractMissingColumn(error.message || '');
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else {
        break;
      }
    }
  } catch (e: any) {
    if (isNetworkError(e)) {
      markSupabaseOffline(e);
    }
  }
}

/**
 * Removes a user record from Supabase table AND Supabase Authentication (auth.users)
 */
export async function deleteUserFromSupabase(id: string, email?: string) {
  if (!canAttemptSupabase()) return;
  try {
    if (id) {
      await supabaseServer.from('app_users').delete().eq('id', id);
    }
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      await supabaseServer.from('app_users').delete().ilike('email', cleanEmail);
      try {
        await supabaseServer.rpc('delete_auth_user', { target_email: cleanEmail });
      } catch (e: any) {}
    }
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

function extractMissingColumn(errorMsg: string): string | null {
  if (!errorMsg) return null;
  let m = errorMsg.match(/Could not find the ['"]?([^'"]+)['"]? column/i);
  if (m && m[1]) return m[1].trim();
  m = errorMsg.match(/column ['"]?([^'"]+)['"]? of relation/i);
  if (m && m[1]) return m[1].trim();
  m = errorMsg.match(/column ['"]?([^'"]+)['"]? does not exist/i);
  if (m && m[1]) return m[1].trim();
  m = errorMsg.match(/['"]?([^'"]+)['"]? column does not exist/i);
  if (m && m[1]) return m[1].trim();
  m = errorMsg.match(/relation "[^"]+" does not have a column ["']?([^"']+)["']?/i);
  if (m && m[1]) return m[1].trim();
  m = errorMsg.match(/schema cache.*['"]([^'"]+)['"]/i);
  if (m && m[1]) return m[1].trim();
  return null;
}

function getValueForSettingColumn(col: string, s: any, targetRow: any, now: string) {
  const c = col.toLowerCase().replace(/_/g, '');
  if (col === 'id') return targetRow?.id !== undefined ? targetRow.id : 1;
  if (col === 'created_at' || col === 'createdAt') return targetRow?.created_at || targetRow?.createdAt || now;
  if (col === 'updated_at' || col === 'updatedAt') return now;

  const fullConfig = {
    ...s,
    academy_name: s.academyName || '',
    hero_title: s.heroTitle || '',
    hero_subtitle: s.heroSubtitle ?? '',
    hero_sub_english: s.heroSubEnglish ?? '',
    contact_phone: s.contactPhone ?? '',
    contact_email: s.contactEmail ?? '',
    contact_address: s.contactAddress ?? '',
    footer_description: s.footerDescription ?? '',
    admin_name: s.adminName || '',
    admin_bio: s.adminBio || '',
    admin_photo_url: s.adminPhotoUrl || '',
    admin_designation: s.adminDesignation || '',
    admin_education: s.adminEducation || '',
    bkash_number: s.bkashNumber || '',
    nagad_number: s.nagadNumber || '',
    rocket_number: s.rocketNumber || '',
    payment_instructions: s.paymentInstructions || '',
    class_levels: s.classLevels || [],
    course_durations: s.courseDurations || [],
    default_course_features: s.defaultCourseFeatures || []
  };

  if (['config', 'data', 'settings', 'value', 'content', 'payload'].includes(c)) return fullConfig;

  if (['academyname', 'academytitle', 'sitename', 'sitetitle', 'title', 'academy'].includes(c)) return s.academyName ?? '';
  if (['announcement', 'announcementtext', 'notice', 'banner'].includes(c)) return s.announcement ?? '';
  if (['herotitle', 'heroheading', 'maintitle', 'heading'].includes(c)) return s.heroTitle ?? '';
  if (['herosubtitle', 'herosub', 'subtitle', 'subheading'].includes(c)) return s.heroSubtitle ?? '';
  if (['herosubenglish', 'herosubeng', 'subeng', 'englishsubtitle'].includes(c)) return s.heroSubEnglish ?? '';
  if (['contactphone', 'phone', 'mobile', 'phonenumber', 'mobilenumber', 'contactno', 'contactnum'].includes(c)) return s.contactPhone ?? '';
  if (['contactemail', 'email', 'mail', 'contactmail'].includes(c)) return s.contactEmail ?? '';
  if (['contactaddress', 'address', 'location', 'officeaddress'].includes(c)) return s.contactAddress ?? '';
  if (['footerdescription', 'footer', 'footertext', 'aboutfooter', 'aboutus'].includes(c)) return s.footerDescription ?? '';
  if (['adminname', 'teachername', 'authorname', 'ownername', 'instructorname'].includes(c)) return s.adminName ?? '';
  if (['adminbio', 'teacherbio', 'biography', 'authorbio', 'bio'].includes(c)) return s.adminBio ?? '';
  if (['adminphotourl', 'adminphoto', 'teacherphoto', 'photo', 'photourl', 'avatar', 'image', 'imageurl', 'profilephoto'].includes(c)) return s.adminPhotoUrl ?? '';
  if (['admindesignation', 'teacherdesignation', 'designation', 'role', 'jobtitle'].includes(c)) return s.adminDesignation ?? '';
  if (['admineducation', 'teachereducation', 'education', 'qualification', 'degree'].includes(c)) return s.adminEducation ?? '';
  if (['bkashnumber', 'bkash', 'bkashno', 'bkashmobile', 'bkashnum', 'bkashphone'].includes(c)) return s.bkashNumber ?? '';
  if (['nagadnumber', 'nagad', 'nagadno', 'nagadmobile', 'nagadnum', 'nagadphone'].includes(c)) return s.nagadNumber ?? '';
  if (['rocketnumber', 'rocket', 'rocketno', 'rocketmobile', 'rocketnum', 'rocketphone'].includes(c)) return s.rocketNumber ?? '';
  if (['paymentinstructions', 'paymentinstruction', 'paymentinfo', 'paymentdetails', 'instructions'].includes(c)) return s.paymentInstructions ?? '';
  if (['subjects', 'subjectlist', 'categories'].includes(c)) return s.subjects ?? [];
  if (['classlevels', 'classes', 'levels'].includes(c)) return s.classLevels ?? [];
  if (['coursedurations', 'durations'].includes(c)) return s.courseDurations ?? [];
  if (['defaultcoursefeatures', 'coursefeatures', 'features'].includes(c)) return s.defaultCourseFeatures ?? [];
  if (['routine', 'classroutine', 'schedule'].includes(c)) return s.routine ?? [];

  if (s[col] !== undefined) return s[col];
  return targetRow ? targetRow[col] : null;
}

/**
 * Targeted real-time upsert for settings in Supabase app_settings table
 */
export async function upsertSettingsToSupabase(st: any) {
  if (!canAttemptSupabase() || !st) return;
  try {
    const payload: any = {
      id: 'default',
      academyName: st.academyName || 'SCIENCE STUDIO by Sakib',
      announcement: st.announcement ?? 'ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026',
      showAnnouncement: Boolean(st.showAnnouncement ?? true),
      contactPhone: st.contactPhone ?? '',
      contactEmail: st.contactEmail ?? '',
      whatsappNumber: st.whatsappNumber ?? '',
      facebookPage: st.facebookUrl || st.facebookPage || '',
      youtubeChannel: st.youtubeUrl || st.youtubeChannel || '',
      bkashNumber: st.bkashNumber ?? '',
      nagadNumber: st.nagadNumber ?? '',
      rocketNumber: st.rocketNumber ?? '',
      routineText: st.routineText ?? null,
      routineImageUrl: st.routineImageUrl ?? null,
      heroTitle: st.heroTitle || 'Innovate, Educate & Explore with Science Studio by Sakib',
      heroSubtitle: st.heroSubtitle ?? '',
      heroSubEnglish: st.heroSubEnglish ?? '',
      heroJoinButtonText: st.heroJoinButtonText || 'ভর্তি হন / রেজিস্ট্রেশন করুন',
      heroExploreButtonText: st.heroExploreButtonText || 'কোর্সসমূহ দেখুন',
      heroClassroomBgUrl: st.heroClassroomBgUrl || '',
      adminName: st.adminName || '',
      adminBio: st.adminBio || '',
      adminPhotoUrl: st.adminPhotoUrl || '',
      adminDesignation: st.adminDesignation || '',
      adminEducation: st.adminEducation || '',
      contactAddress: st.contactAddress || '',
      footerDescription: st.footerDescription || '',
      paymentInstructions: st.paymentInstructions || '',
      subjects: Array.isArray(st.subjects) ? st.subjects : ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Science'],
      updatedAt: new Date().toISOString()
    };

    let maxRetries = 10;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      const { error } = await supabaseServer.from('app_settings').upsert(payload, { onConflict: 'id' });
      if (!error) break;
      if (isNetworkError(error)) {
        markSupabaseOffline(error);
        return;
      }
      const missingCol = extractMissingColumn(error.message || '');
      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else {
        break;
      }
    }

    // Also sync to settings table if configured as fallback
    await syncSettingsToTable('settings', st).catch(() => {});
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

async function syncSettingsToTable(table: string, s: any) {
  if (!canAttemptSupabase()) return;
  try {
    const now = new Date().toISOString();

    // Try fetching existing rows to determine table structure
    const { data: existingRows, error: selectErr } = await supabaseServer.from(table).select('*').limit(5);
    if (selectErr) {
      if (isNetworkError(selectErr)) {
        markSupabaseOffline(selectErr);
        return;
      }
      if (selectErr.code === '42P01' || selectErr.message?.includes('does not exist')) {
        return;
      }
    }

    const targetRow = (Array.isArray(existingRows) && existingRows.length > 0) ? existingRows[0] : null;

    let payload: Record<string, any> = {
      id: targetRow?.id !== undefined ? targetRow.id : (table === 'app_settings' ? 'default' : 1),
      config: s,
      data: s,
      settings: s,
      value: s,
      payload: s,

      academy_name: s.academyName || '',
      announcement: s.announcement ?? '',
      hero_title: s.heroTitle || '',
      hero_subtitle: s.heroSubtitle ?? '',
      hero_sub_english: s.heroSubEnglish ?? '',
      contact_phone: s.contactPhone ?? '',
      contact_email: s.contactEmail ?? '',
      contact_address: s.contactAddress ?? '',
      footer_description: s.footerDescription ?? '',
      admin_name: s.adminName || '',
      admin_bio: s.adminBio || '',
      admin_photo_url: s.adminPhotoUrl || '',
      admin_designation: s.adminDesignation || '',
      admin_education: s.adminEducation || '',
      bkash_number: s.bkashNumber || '',
      nagad_number: s.nagadNumber || '',
      rocket_number: s.rocketNumber || '',
      payment_instructions: s.paymentInstructions || '',
      subjects: s.subjects || [],
      class_levels: s.classLevels || [],
      course_durations: s.courseDurations || [],
      default_course_features: s.defaultCourseFeatures || [],
      routine: s.routine || [],

      created_at: targetRow?.created_at || now,
      updated_at: now
    };

    if (targetRow) {
      for (const k of Object.keys(targetRow)) {
        payload[k] = getValueForSettingColumn(k, s, targetRow, now);
      }
    }

    let maxRetries = 20;
    while (maxRetries > 0 && canAttemptSupabase()) {
      maxRetries--;
      let res;

      if (targetRow) {
        if (payload.id !== undefined && targetRow.id !== undefined) {
          res = await supabaseServer.from(table).update(payload).eq('id', targetRow.id);
        } else {
          res = await supabaseServer.from(table).update(payload).limit(1);
        }
      } else {
        res = await supabaseServer.from(table).upsert([payload]);
      }

      if (!res.error) {
        return;
      }

      if (isNetworkError(res.error)) {
        markSupabaseOffline(res.error);
        return;
      }

      const errorMsg = res.error.message || '';
      const missingCol = extractMissingColumn(errorMsg);

      if (missingCol && missingCol in payload) {
        delete payload[missingCol];
      } else if (errorMsg.includes('invalid input syntax') || errorMsg.includes('id') || errorMsg.includes('uuid') || errorMsg.includes('type integer')) {
        if ('id' in payload) {
          delete payload.id;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

/**
 * Synchronizes local dataset to Supabase Database
 */
export async function syncToSupabase(data: any) {
  if (!canAttemptSupabase() || !data) return;
  try {
    const promises: Promise<any>[] = [];

    // 1. Sync Settings (target: app_settings table, fallback: settings)
    if (data.settings) {
      promises.push(
        (async () => {
          try {
            await upsertSettingsToSupabase(data.settings);
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    // 2. Sync Users
    if (Array.isArray(data.users) && data.users.length > 0) {
      promises.push(
        (async () => {
          if (!canAttemptSupabase()) return;
          try {
            const usersPayload = data.users.map((u: any) => {
              const enrolledList = Array.isArray(u.enrolledCourseTitles) 
                ? u.enrolledCourseTitles 
                : (u.course ? [u.course] : (Array.isArray(u.enrolled_courses) ? u.enrolled_courses : []));
              return {
                id: u.id,
                name: u.name || '',
                email: u.email ? u.email.toLowerCase().trim() : '',
                phone: u.phone || '',
                password: u.password || '',
                role: u.role || 'student',
                isApproved: u.isApproved !== undefined ? Boolean(u.isApproved) : (u.is_approved !== undefined ? Boolean(u.is_approved) : false),
                course: enrolledList.length > 0 ? enrolledList[0] : (u.course || ''),
                batch: u.studentClass || u.batch || '',
                enrolledCourseTitles: enrolledList,
                enrolledCourseIds: Array.isArray(u.enrolledCourseIds) ? u.enrolledCourseIds : [],
                transactionId: u.transactionId || u.transaction_id || '',
                avatar: u.photoUrl || u.avatarUrl || u.avatar || '',
                joinedAt: u.joinedAt || u.createdAt || u.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            });

            const { error: upsertErr } = await supabaseServer
              .from('app_users')
              .upsert(usersPayload, { onConflict: 'id' });

            if (upsertErr && isNetworkError(upsertErr)) {
              markSupabaseOffline(upsertErr);
              return;
            }

            const currentIds = data.users.map((u: any) => u.id).filter(Boolean);
            if (currentIds.length > 0 && canAttemptSupabase()) {
              const filterStr = `(${currentIds.map((i: string) => `"${i}"`).join(',')})`;
              await supabaseServer.from('app_users').delete().not('id', 'in', filterStr);
            }
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    // 3. Sync Classes
    if (Array.isArray(data.classes)) {
      promises.push(
        (async () => {
          if (!canAttemptSupabase()) return;
          try {
            if (data.classes.length > 0) {
              const { error: upsertErr } = await supabaseServer
                .from('app_classes')
                .upsert(data.classes.map((c: any) => ({
                  id: c.id,
                  title: c.title,
                  subject: c.subject,
                  videoUrl: c.videoUrl || '',
                  thumbnailUrl: c.thumbnailUrl || '',
                  courseId: c.courseId || '',
                  courseTitle: c.courseTitle || '',
                  description: c.description || '',
                  updated_at: new Date().toISOString()
                })), { onConflict: 'id' });

              if (upsertErr && isNetworkError(upsertErr)) {
                markSupabaseOffline(upsertErr);
                return;
              }

              const currentIds = data.classes.map((c: any) => c.id).filter(Boolean);
              if (currentIds.length > 0 && canAttemptSupabase()) {
                const filterStr = `(${currentIds.map((i: string) => `"${i}"`).join(',')})`;
                await supabaseServer.from('app_classes').delete().not('id', 'in', filterStr);
              }
            } else {
              await supabaseServer.from('app_classes').delete().neq('id', '___empty___');
            }
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    // 4. Sync Notes
    if (Array.isArray(data.notes)) {
      promises.push(
        (async () => {
          if (!canAttemptSupabase()) return;
          try {
            if (data.notes.length > 0) {
              const { error: upsertErr } = await supabaseServer
                .from('app_notes')
                .upsert(data.notes.map((n: any) => ({
                  id: n.id,
                  title: n.title,
                  subject: n.subject,
                  pdfUrl: n.pdfUrl || '',
                  courseId: n.courseId || '',
                  courseTitle: n.courseTitle || '',
                  description: n.description || '',
                  updated_at: new Date().toISOString()
                })), { onConflict: 'id' });

              if (upsertErr && isNetworkError(upsertErr)) {
                markSupabaseOffline(upsertErr);
                return;
              }

              const currentIds = data.notes.map((n: any) => n.id).filter(Boolean);
              if (currentIds.length > 0 && canAttemptSupabase()) {
                const filterStr = `(${currentIds.map((i: string) => `"${i}"`).join(',')})`;
                await supabaseServer.from('app_notes').delete().not('id', 'in', filterStr);
              }
            } else {
              await supabaseServer.from('app_notes').delete().neq('id', '___empty___');
            }
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    // 5. Sync Courses
    if (Array.isArray(data.courses)) {
      promises.push(
        (async () => {
          if (!canAttemptSupabase()) return;
          try {
            if (data.courses.length > 0) {
              const { error: upsertErr } = await supabaseServer
                .from('app_courses')
                .upsert(data.courses.map((cr: any) => ({
                  id: cr.id,
                  title: cr.title,
                  subject: cr.subject,
                  price: Number(cr.price || 0),
                  originalPrice: cr.originalPrice !== undefined && cr.originalPrice !== null ? Number(cr.originalPrice) : null,
                  imageUrl: cr.imageUrl || '',
                  batch: cr.classLevel || cr.batch || '',
                  duration: cr.duration || '',
                  description: cr.description || '',
                  updated_at: new Date().toISOString()
                })), { onConflict: 'id' });

              if (upsertErr && isNetworkError(upsertErr)) {
                markSupabaseOffline(upsertErr);
                return;
              }

              const currentIds = data.courses.map((cr: any) => cr.id).filter(Boolean);
              if (currentIds.length > 0 && canAttemptSupabase()) {
                const filterStr = `(${currentIds.map((i: string) => `"${i}"`).join(',')})`;
                await supabaseServer.from('app_courses').delete().not('id', 'in', filterStr);
              }
            } else {
              await supabaseServer.from('app_courses').delete().neq('id', '___empty___');
            }
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    // 6. Sync Routine
    if (data.settings?.routine && Array.isArray(data.settings.routine) && data.settings.routine.length > 0) {
      promises.push(
        (async () => {
          if (!canAttemptSupabase()) return;
          try {
            const { error: upsertErr } = await supabaseServer
              .from('routine')
              .upsert(data.settings.routine.map((rt: any) => ({
                id: rt.id,
                day: rt.day,
                subject: rt.subject,
                time: rt.time
              })), { onConflict: 'id' });

            if (upsertErr && isNetworkError(upsertErr)) {
              markSupabaseOffline(upsertErr);
              return;
            }

            const currentIds = data.settings.routine.map((rt: any) => rt.id);
            if (currentIds.length > 0 && canAttemptSupabase()) {
              const filterStr = `(${currentIds.map(i => `"${i}"`).join(',')})`;
              await supabaseServer.from('routine').delete().not('id', 'in', filterStr);
            }
          } catch (e: any) {
            if (isNetworkError(e)) markSupabaseOffline(e);
          }
        })()
      );
    }

    await Promise.allSettled(promises);
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
}

/**
 * Loads data from Supabase on server startup if present
 */
export async function loadFromSupabase(defaultData: any) {
  if (!canAttemptSupabase()) return null;
  try {
    const loadedData = { ...defaultData };
    let hasLoadedAny = false;

    // Load Settings
    let settingsRow: any = null;
    for (const table of ['app_settings', 'settings']) {
      try {
        const { data: rows, error: selectErr } = await supabaseServer.from(table).select('*').limit(1);
        if (selectErr && isNetworkError(selectErr)) {
          markSupabaseOffline(selectErr);
          return null;
        }
        if (Array.isArray(rows) && rows.length > 0) {
          settingsRow = rows[0];
          break;
        }
      } catch (e: any) {
        if (isNetworkError(e)) {
          markSupabaseOffline(e);
          return null;
        }
      }
    }

    if (settingsRow) {
      const configObj = (typeof settingsRow.config === 'object' && settingsRow.config !== null)
        ? settingsRow.config
        : ((typeof settingsRow.data === 'object' && settingsRow.data !== null) ? settingsRow.data : ((typeof settingsRow.settings === 'object' && settingsRow.settings !== null) ? settingsRow.settings : {}));
      
      const getVal = (aliases: string[], fallback: any) => {
        if (configObj && typeof configObj === 'object') {
          for (const k of aliases) {
            if (configObj[k] !== undefined && configObj[k] !== null && configObj[k] !== '') return configObj[k];
          }
        }
        if (settingsRow && typeof settingsRow === 'object') {
          for (const k of aliases) {
            if (settingsRow[k] !== undefined && settingsRow[k] !== null && settingsRow[k] !== '') return settingsRow[k];
          }
        }
        return fallback;
      };

      const getArray = (aliases: string[], fallback: any[]) => {
        if (configObj && typeof configObj === 'object') {
          for (const k of aliases) {
            if (Array.isArray(configObj[k]) && configObj[k].length > 0) return configObj[k];
          }
        }
        if (settingsRow && typeof settingsRow === 'object') {
          for (const k of aliases) {
            if (Array.isArray(settingsRow[k]) && settingsRow[k].length > 0) return settingsRow[k];
          }
        }
        return fallback;
      };

      loadedData.settings = {
        ...defaultData.settings,
        ...configObj,
        academyName: getVal(['academyName', 'academy_name', 'academyTitle', 'academy_title', 'siteName', 'site_name', 'title', 'academy'], defaultData.settings?.academyName || 'Science Studio'),
        announcement: getVal(['announcement', 'announcement_text', 'notice', 'banner'], defaultData.settings?.announcement || ''),
        heroTitle: getVal(['heroTitle', 'hero_title', 'heroHeading', 'hero_heading', 'maintitle', 'main_title'], defaultData.settings?.heroTitle || ''),
        heroSubtitle: getVal(['heroSubtitle', 'hero_subtitle', 'heroSub', 'hero_sub', 'subtitle'], defaultData.settings?.heroSubtitle || ''),
        heroSubEnglish: getVal(['heroSubEnglish', 'hero_sub_english', 'heroSubEng', 'hero_sub_eng', 'englishSubtitle', 'english_subtitle'], defaultData.settings?.heroSubEnglish || ''),
        heroJoinButtonText: getVal(['heroJoinButtonText', 'hero_join_button_text', 'joinButtonText'], defaultData.settings?.heroJoinButtonText || "ভর্তি হন / রেজিস্ট্রেশন করুন"),
        heroExploreButtonText: getVal(['heroExploreButtonText', 'hero_explore_button_text', 'exploreButtonText'], defaultData.settings?.heroExploreButtonText || "এক্সপ্লোর ফিচার"),
        orbitSectionBadge: getVal(['orbitSectionBadge', 'orbit_section_badge'], defaultData.settings?.orbitSectionBadge || "ACADEMY SHOWCASE & INTERACTIVE ORBIT"),
        orbitSectionTitle: getVal(['orbitSectionTitle', 'orbit_section_title'], defaultData.settings?.orbitSectionTitle || "সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম"),
        orbitSectionSubtitle: getVal(['orbitSectionSubtitle', 'orbit_section_subtitle'], defaultData.settings?.orbitSectionSubtitle || "বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো।"),
        orbitAutoRotate: configObj?.orbitAutoRotate !== undefined ? Boolean(configObj.orbitAutoRotate) : (defaultData.settings?.orbitAutoRotate ?? true),
        orbitSpeedSeconds: configObj?.orbitSpeedSeconds !== undefined ? Number(configObj.orbitSpeedSeconds) : (defaultData.settings?.orbitSpeedSeconds || 6),
        insightsTotalStudents: getVal(['insightsTotalStudents', 'insights_total_students'], defaultData.settings?.insightsTotalStudents || "১,৪৫০+"),
        insightsActivePercent: getVal(['insightsActivePercent', 'insights_active_percent'], defaultData.settings?.insightsActivePercent || "৯৮%"),
        insightsSuccessRate: getVal(['insightsSuccessRate', 'insights_success_rate'], defaultData.settings?.insightsSuccessRate || "৯৯.২%"),
        insightsSuccessRateLabel: getVal(['insightsSuccessRateLabel', 'insights_success_rate_label'], defaultData.settings?.insightsSuccessRateLabel || "প্লাস পাওয়ার হার"),
        insightsTotalCourses: getVal(['insightsTotalCourses', 'insights_total_courses'], defaultData.settings?.insightsTotalCourses || "১৪+"),
        insightsTotalNotes: getVal(['insightsTotalNotes', 'insights_total_notes'], defaultData.settings?.insightsTotalNotes || "৩৫০+"),
        insightsBullet1: getVal(['insightsBullet1', 'insights_bullet_1'], defaultData.settings?.insightsBullet1 || "সাকিব স্যারের নিজস্ব থ্রিডি ভিজ্যুয়াল ল্যাব সেশন"),
        insightsBullet2: getVal(['insightsBullet2', 'insights_bullet_2'], defaultData.settings?.insightsBullet2 || "২৪/৭ অনলাইন ও অফলাইন স্পেশাল ডাউট সলভ"),
        insightsBullet3: getVal(['insightsBullet3', 'insights_bullet_3'], defaultData.settings?.insightsBullet3 || "এইচএসসি ও অ্যাডমিশন ফোকাসড মডেল টেস্ট"),
        insightsRegisterButtonText: getVal(['insightsRegisterButtonText', 'insights_register_button_text'], defaultData.settings?.insightsRegisterButtonText || "ফ্রী রেজিস্ট্রেশন ও ক্লাস অ্যাক্সেস পান"),
        pillarsSectionBadge: getVal(['pillarsSectionBadge', 'pillars_section_badge'], defaultData.settings?.pillarsSectionBadge || "LEADERSHIP & PEDAGOGY PILLARS"),
        pillarsSectionTitle: getVal(['pillarsSectionTitle', 'pillars_section_title'], defaultData.settings?.pillarsSectionTitle || "সাকিব স্যারের একাডেমি ও মেন্টরশিপের মূল স্তম্ভসমূহ"),
        pillarsSectionSubtitle: getVal(['pillarsSectionSubtitle', 'pillars_section_subtitle'], defaultData.settings?.pillarsSectionSubtitle || "ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে পৌঁছে দেওয়া হয় তাদের কাঙ্ক্ষিত সফলতায়।"),
        pillar1Title: getVal(['pillar1Title', 'pillar_1_title'], defaultData.settings?.pillar1Title || "ইন্টারেক্টিভ ভিডিও ও সিমুলেশন ক্লাস"),
        pillar1Badge: getVal(['pillar1Badge', 'pillar_1_badge'], defaultData.settings?.pillar1Badge || "3D LAB RECORDED"),
        pillar1Description: getVal(['pillar1Description', 'pillar_1_description'], defaultData.settings?.pillar1Description || "যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য রয়েছে প্রিমিয়াম এইচডি ভিডিও ক্লাস।"),
        pillar2Title: getVal(['pillar2Title', 'pillar_2_title'], defaultData.settings?.pillar2Title || "অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক"),
        pillar2Badge: getVal(['pillar2Badge', 'pillar_2_badge'], defaultData.settings?.pillar2Badge || "৩৫+ শিট"),
        pillar2Description: getVal(['pillar2Description', 'pillar_2_description'], defaultData.settings?.pillar2Description || "পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে ডাউনলোডযোগ্য রঙিন হ্যান্ডরাইটিং শিট।"),
        pillar3Title: getVal(['pillar3Title', 'pillar_3_title'], defaultData.settings?.pillar3Title || "২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক"),
        pillar3Badge: getVal(['pillar3Badge', 'pillar_3_badge'], defaultData.settings?.pillar3Badge || "LIVE ASSISTANCE"),
        pillar3Description: getVal(['pillar3Description', 'pillar_3_description'], defaultData.settings?.pillar3Description || "পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ এবং শিক্ষার্থীর অগ্রগতি ট্র্যাকিং।"),
        mentorExperience: getVal(['mentorExperience', 'mentor_experience'], defaultData.settings?.mentorExperience || "১০+ বছরের অভিজ্ঞতা"),
        mentorGuidance: getVal(['mentorGuidance', 'mentor_guidance'], defaultData.settings?.mentorGuidance || "১০০% পার্সোনাল গাইডেন্স"),
        heroBadgeText: getVal(['heroBadgeText', 'hero_badge_text'], defaultData.settings?.heroBadgeText || "প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO"),
        announcementBadge: getVal(['announcementBadge', 'announcement_badge'], defaultData.settings?.announcementBadge || "নির্দেশনা ও নোটিশ"),
        marqueeNotice2: getVal(['marqueeNotice2', 'marquee_notice_2'], defaultData.settings?.marqueeNotice2 || ""),
        marqueeNotice3: getVal(['marqueeNotice3', 'marquee_notice_3'], defaultData.settings?.marqueeNotice3 || ""),
        marqueeNotice4: getVal(['marqueeNotice4', 'marquee_notice_4'], defaultData.settings?.marqueeNotice4 || ""),
        marqueeNotice5: getVal(['marqueeNotice5', 'marquee_notice_5'], defaultData.settings?.marqueeNotice5 || ""),
        facebookUrl: getVal(['facebookUrl', 'facebook_url'], defaultData.settings?.facebookUrl || ""),
        youtubeUrl: getVal(['youtubeUrl', 'youtube_url'], defaultData.settings?.youtubeUrl || ""),
        telegramUrl: getVal(['telegramUrl', 'telegram_url'], defaultData.settings?.telegramUrl || ""),
        whatsappNumber: getVal(['whatsappNumber', 'whatsapp_number'], defaultData.settings?.whatsappNumber || ""),
        helplineTime: getVal(['helplineTime', 'helpline_time'], defaultData.settings?.helplineTime || "সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)"),
        labSectionBadge: getVal(['labSectionBadge', 'lab_section_badge'], defaultData.settings?.labSectionBadge || "INTERACTIVE VIRTUAL LAB & PLAYGROUND"),
        labSectionTitle: getVal(['labSectionTitle', 'lab_section_title'], defaultData.settings?.labSectionTitle || ""),
        labSectionSubtitle: getVal(['labSectionSubtitle', 'lab_section_subtitle'], defaultData.settings?.labSectionSubtitle || "পড়াশোনা হোক আনন্দের ও গবেষণাধর্মী! পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিতের গুরুত্বপূর্ণ টপিকগুলো নিজে পরিবর্তন করে প্র্যাকটিক্যাল জ্ঞান অর্জন করুন।"),
        subjects: getArray(['subjects', 'subjectList', 'subject_list', 'categories'], defaultData.settings?.subjects || []),
        classLevels: getArray(['classLevels', 'class_levels', 'classes', 'levels'], defaultData.settings?.classLevels || []),
        courseDurations: getArray(['courseDurations', 'course_durations', 'durations'], defaultData.settings?.courseDurations || []),
        defaultCourseFeatures: getArray(['defaultCourseFeatures', 'default_course_features', 'courseFeatures', 'course_features', 'features'], defaultData.settings?.defaultCourseFeatures || []),
        contactPhone: getVal(['contactPhone', 'contact_phone', 'phone', 'mobile', 'phoneNumber', 'phone_number', 'contactNo', 'contact_no'], defaultData.settings?.contactPhone || ''),
        contactEmail: getVal(['contactEmail', 'contact_email', 'email', 'mail'], defaultData.settings?.contactEmail || ''),
        contactAddress: getVal(['contactAddress', 'contact_address', 'address', 'location'], defaultData.settings?.contactAddress || ''),
        footerDescription: getVal(['footerDescription', 'footer_description', 'footer', 'footerText', 'footer_text', 'about'], defaultData.settings?.footerDescription || ''),
        adminName: getVal(['adminName', 'admin_name', 'teacherName', 'teacher_name', 'authorName', 'author_name', 'ownerName', 'owner_name'], defaultData.settings?.adminName || ''),
        adminBio: getVal(['adminBio', 'admin_bio', 'teacherBio', 'teacher_bio', 'biography', 'bio'], defaultData.settings?.adminBio || ''),
        adminPhotoUrl: getVal(['adminPhotoUrl', 'admin_photo_url', 'adminPhoto', 'admin_photo', 'teacherPhoto', 'teacher_photo', 'photo', 'photoUrl', 'photo_url', 'avatar', 'image'], defaultData.settings?.adminPhotoUrl || ''),
        adminDesignation: getVal(['adminDesignation', 'admin_designation', 'teacherDesignation', 'teacher_designation', 'designation', 'role'], defaultData.settings?.adminDesignation || ''),
        adminEducation: getVal(['adminEducation', 'admin_education', 'teacherEducation', 'teacher_education', 'education', 'qualification', 'degree'], defaultData.settings?.adminEducation || ''),
        bkashNumber: getVal(['bkashNumber', 'bkash_number', 'bkash', 'bkashNo', 'bkash_no', 'bkashNum', 'bkash_num'], defaultData.settings?.bkashNumber || ''),
        nagadNumber: getVal(['nagadNumber', 'nagad_number', 'nagad', 'nagadNo', 'nagad_no', 'nagadNum', 'nagad_num'], defaultData.settings?.nagadNumber || ''),
        rocketNumber: getVal(['rocketNumber', 'rocket_number', 'rocket', 'rocketNo', 'rocket_no', 'rocketNum', 'rocket_num'], defaultData.settings?.rocketNumber || ''),
        paymentInstructions: getVal(['paymentInstructions', 'payment_instructions', 'paymentInstruction', 'payment_instruction', 'paymentInfo', 'payment_info', 'instructions'], defaultData.settings?.paymentInstructions || ''),
        routine: getArray(['routine', 'classRoutine', 'class_routine', 'schedule'], defaultData.settings?.routine || [])
      };
      hasLoadedAny = true;
    }

    if (!canAttemptSupabase()) return hasLoadedAny ? loadedData : null;

    // Load Users
    try {
      const { data: usersRows, error: userErr } = await supabaseServer.from('app_users').select('*');
      if (userErr && isNetworkError(userErr)) {
        markSupabaseOffline(userErr);
      } else if (Array.isArray(usersRows) && usersRows.length > 0) {
        loadedData.users = usersRows.map(r => {
          const nested = (r.data && typeof r.data === 'object') ? r.data : {};
          const enrolledCourses = Array.isArray(r.enrolled_courses) && r.enrolled_courses.length > 0
            ? r.enrolled_courses
            : (Array.isArray(nested.enrolledCourseTitles) ? nested.enrolledCourseTitles : (Array.isArray(r.enrolledCourseTitles) ? r.enrolledCourseTitles : []));

          const isApproved = r.is_approved !== undefined && r.is_approved !== null
            ? Boolean(r.is_approved)
            : (nested.isApproved !== undefined && nested.isApproved !== null ? Boolean(nested.isApproved) : (r.isApproved !== undefined ? Boolean(r.isApproved) : false));

          return {
            ...nested,
            id: r.id,
            name: r.name || nested.name || 'User',
            email: r.email ? r.email.toLowerCase().trim() : (nested.email || ''),
            role: r.role || nested.role || 'student',
            isApproved,
            phone: r.phone || nested.phone || '',
            studentClass: r.student_class || r.studentClass || nested.studentClass || '',
            photoUrl: r.photo_url || r.photoUrl || nested.photoUrl || nested.avatarUrl || '',
            avatarUrl: r.photo_url || r.photoUrl || nested.avatarUrl || nested.photoUrl || '',
            enrolledCourseTitles: enrolledCourses,
            transactionId: r.transaction_id || r.transactionId || nested.transactionId || '',
            paymentMethod: r.payment_method || r.paymentMethod || nested.paymentMethod || '',
            senderPhone: r.sender_phone || r.senderPhone || nested.senderPhone || '',
            createdAt: r.created_at || nested.createdAt || new Date().toISOString()
          };
        });
        hasLoadedAny = true;
      }
    } catch (e: any) {
      if (isNetworkError(e)) markSupabaseOffline(e);
    }

    if (!canAttemptSupabase()) return hasLoadedAny ? loadedData : null;

    // Load Classes
    try {
      const { data: classRows, error: classErr } = await supabaseServer.from('app_classes').select('*');
      if (classErr && isNetworkError(classErr)) {
        markSupabaseOffline(classErr);
      } else if (Array.isArray(classRows) && classRows.length > 0) {
        loadedData.classes = classRows.map(r => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          videoUrl: r.video_url || r.videoUrl,
          thumbnailUrl: r.thumbnail_url || r.thumbnailUrl || '',
          courseId: r.course_id || r.courseId || '',
          courseTitle: r.course_title || r.courseTitle || '',
          description: r.description || '',
          ...(r.data || {})
        }));
        hasLoadedAny = true;
      }
    } catch (e: any) {
      if (isNetworkError(e)) markSupabaseOffline(e);
    }

    if (!canAttemptSupabase()) return hasLoadedAny ? loadedData : null;

    // Load Notes
    try {
      const { data: noteRows, error: noteErr } = await supabaseServer.from('app_notes').select('*');
      if (noteErr && isNetworkError(noteErr)) {
        markSupabaseOffline(noteErr);
      } else if (Array.isArray(noteRows) && noteRows.length > 0) {
        loadedData.notes = noteRows.map(r => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          pdfUrl: r.pdf_url || r.pdfUrl,
          description: r.description || '',
          courseId: r.course_id || r.courseId || '',
          courseTitle: r.course_title || r.courseTitle || '',
          ...(r.data || {})
        }));
        hasLoadedAny = true;
      }
    } catch (e: any) {
      if (isNetworkError(e)) markSupabaseOffline(e);
    }

    if (!canAttemptSupabase()) return hasLoadedAny ? loadedData : null;

    // Load Courses
    try {
      const { data: courseRows, error: courseErr } = await supabaseServer.from('app_courses').select('*');
      if (courseErr && isNetworkError(courseErr)) {
        markSupabaseOffline(courseErr);
      } else if (Array.isArray(courseRows) && courseRows.length > 0) {
        loadedData.courses = courseRows.map(r => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          classLevel: r.batch || r.classLevel || r.class_level || '',
          price: Number(r.price || 0),
          originalPrice: Number(r.originalPrice || r.original_price || 0),
          duration: r.duration || '',
          description: r.description || '',
          badge: r.badge || '',
          rating: Number(r.rating || 5.0),
          enrolledCount: Number(r.enrolledCount || r.enrolled_count || 0),
          features: Array.isArray(r.features) ? r.features : [],
          imageUrl: r.imageUrl || r.image_url || '',
          ...(r.data || {})
        }));
        hasLoadedAny = true;
      }
    } catch (e: any) {
      if (isNetworkError(e)) markSupabaseOffline(e);
    }

    if (!canAttemptSupabase()) return hasLoadedAny ? loadedData : null;

    // Load Routine
    try {
      const { data: routineRows, error: routineErr } = await supabaseServer.from('routine').select('*');
      if (routineErr && isNetworkError(routineErr)) {
        markSupabaseOffline(routineErr);
      } else if (Array.isArray(routineRows) && routineRows.length > 0) {
        if (!loadedData.settings) loadedData.settings = {};
        loadedData.settings.routine = routineRows.map(r => ({
          id: r.id,
          day: r.day,
          subject: r.subject,
          time: r.time
        }));
        hasLoadedAny = true;
      }
    } catch (e: any) {
      if (isNetworkError(e)) markSupabaseOffline(e);
    }

    if (hasLoadedAny) {
      return loadedData;
    }
  } catch (err: any) {
    if (isNetworkError(err)) {
      markSupabaseOffline(err);
    }
  }
  return null;
}
