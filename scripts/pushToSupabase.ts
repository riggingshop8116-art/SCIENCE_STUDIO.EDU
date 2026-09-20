import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://tcsblgpiufflkitislpz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc2JsZ3BpdWZmbGtpdGlzbHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTYzNjAsImV4cCI6MjEwMzYzMjM2MH0.E8BphiNRyLHSC58SXPmU6CaWDMScn9HllLZw2V8DPO8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('--- SCIENCE STUDIO: SYNCING DATA TO SUPABASE ---');
  console.log('Target Supabase URL:', SUPABASE_URL);

  const dbPath = './db.json';
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found!');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Courses
  if (Array.isArray(db.courses) && db.courses.length > 0) {
    const coursesPayload = db.courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      price: Number(c.price || 0),
      originalPrice: c.originalPrice !== undefined && c.originalPrice !== null ? Number(c.originalPrice) : null,
      imageUrl: c.imageUrl || '',
      batch: c.classLevel || c.batch || '',
      duration: c.duration || '',
      description: c.description || '',
      updated_at: new Date().toISOString()
    }));
    const { error: cErr } = await supabase.from('app_courses').upsert(coursesPayload, { onConflict: 'id' });
    if (cErr) console.error('Courses Sync Error:', cErr.message);
    else console.log(`[OK] ${coursesPayload.length} Courses synced.`);
  }

  // 2. Classes
  if (Array.isArray(db.classes) && db.classes.length > 0) {
    const classesPayload = db.classes.map((c: any) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      videoUrl: c.videoUrl || '',
      thumbnailUrl: c.thumbnailUrl || '',
      courseId: c.courseId || '',
      courseTitle: c.courseTitle || '',
      description: c.description || '',
      updated_at: new Date().toISOString()
    }));
    const { error: clErr } = await supabase.from('app_classes').upsert(classesPayload, { onConflict: 'id' });
    if (clErr) console.error('Classes Sync Error:', clErr.message);
    else console.log(`[OK] ${classesPayload.length} Classes synced.`);
  }

  // 3. Notes
  if (Array.isArray(db.notes) && db.notes.length > 0) {
    const notesPayload = db.notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      subject: n.subject,
      pdfUrl: n.pdfUrl || '',
      courseId: n.courseId || '',
      courseTitle: n.courseTitle || '',
      description: n.description || '',
      updated_at: new Date().toISOString()
    }));
    const { error: nErr } = await supabase.from('app_notes').upsert(notesPayload, { onConflict: 'id' });
    if (nErr) console.error('Notes Sync Error:', nErr.message);
    else console.log(`[OK] ${notesPayload.length} Notes synced.`);
  }

  // 4. Users
  if (Array.isArray(db.users) && db.users.length > 0) {
    const tombstoneSet = new Set((db.deletedUserIds || []).map((x: any) => String(x).toLowerCase().trim()));
    const activeUsers = db.users.filter((u: any) => {
      const uId = String(u.id || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      return (!uId || !tombstoneSet.has(uId)) && (!uEmail || !tombstoneSet.has(uEmail));
    });

    const usersPayload = activeUsers.map((u: any) => {
      const enrolled = Array.isArray(u.enrolledCourseTitles) ? u.enrolledCourseTitles : (u.course ? [u.course] : []);
      return {
        id: u.id,
        name: u.name || '',
        email: u.email ? u.email.toLowerCase().trim() : '',
        phone: u.phone || '',
        password: u.password || '',
        role: u.role || 'student',
        isApproved: Boolean(u.isApproved),
        course: enrolled.length > 0 ? enrolled[0] : '',
        batch: u.studentClass || u.batch || '',
        enrolledCourseTitles: enrolled,
        enrolledCourseIds: Array.isArray(u.enrolledCourseIds) ? u.enrolledCourseIds : [],
        transactionId: u.transactionId || '',
        avatar: u.photoUrl || u.avatarUrl || '',
        joinedAt: u.createdAt || u.joinedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    const { error: uErr } = await supabase.from('app_users').upsert(usersPayload, { onConflict: 'id' });
    if (uErr) console.error('Users Sync Error:', uErr.message);
    else console.log(`[OK] ${usersPayload.length} Users synced.`);
  }

  // 5. Settings
  if (db.settings) {
    const st = db.settings;
    const settingsPayload: any = {
      id: 'default',
      academyName: st.academyName || 'SCIENCE STUDIO by Sakib',
      announcement: st.announcement ?? '',
      showAnnouncement: Boolean(st.showAnnouncement ?? true),
      contactPhone: st.contactPhone ?? '',
      contactEmail: st.contactEmail ?? '',
      whatsappNumber: st.whatsappNumber || '',
      facebookPage: st.facebookPage || '',
      youtubeChannel: st.youtubeChannel || '',
      bkashNumber: st.bkashNumber || '',
      nagadNumber: st.nagadNumber || '',
      rocketNumber: st.rocketNumber || '',
      routineText: st.routineText || '',
      routineImageUrl: st.routineImageUrl || '',
      heroTitle: st.heroTitle || '',
      heroSubtitle: st.heroSubtitle || '',
      heroSubEnglish: st.heroSubEnglish || '',
      heroJoinButtonText: st.heroJoinButtonText || '',
      heroExploreButtonText: st.heroExploreButtonText || '',
      heroClassroomBgUrl: st.heroClassroomBgUrl || '',
      adminName: st.adminName || '',
      adminBio: st.adminBio || '',
      adminPhotoUrl: st.adminPhotoUrl || '',
      adminDesignation: st.adminDesignation || '',
      adminEducation: st.adminEducation || '',
      contactAddress: st.contactAddress || '',
      footerDescription: st.footerDescription || '',
      paymentInstructions: st.paymentInstructions || '',
      subjects: Array.isArray(st.subjects) ? st.subjects : [],
      updatedAt: new Date().toISOString()
    };
    const { error: stErr } = await supabase.from('app_settings').upsert(settingsPayload, { onConflict: 'id' });
    if (stErr) console.error('Settings Sync Error:', stErr.message);
    else console.log('[OK] Settings synced successfully.');
  }

  // Verify counts in Supabase
  const { count: cCount } = await supabase.from('app_courses').select('*', { count: 'exact', head: true });
  const { count: clCount } = await supabase.from('app_classes').select('*', { count: 'exact', head: true });
  const { count: nCount } = await supabase.from('app_notes').select('*', { count: 'exact', head: true });
  const { count: uCount } = await supabase.from('app_users').select('*', { count: 'exact', head: true });
  const { count: sCount } = await supabase.from('app_settings').select('*', { count: 'exact', head: true });

  console.log('--- SUPABASE VERIFIED TOTALS ---');
  console.log({
    courses: cCount,
    classes: clCount,
    notes: nCount,
    users: uCount,
    settings: sCount
  });
  console.log('All data is safely persistent in Supabase!');
}

main().catch(err => {
  console.error('Fatal Sync Error:', err);
  process.exit(1);
});
