import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { 
  supabaseServer, 
  syncToSupabase, 
  loadFromSupabase, 
  deleteFromSupabase, 
  deleteUserFromSupabase,
  registerUserInSupabaseAuth,
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  ensureSupabaseBucket,
  upsertUserToSupabase,
  upsertClassToSupabase,
  upsertNoteToSupabase,
  upsertCourseToSupabase,
  canAttemptSupabase,
  isNetworkError,
  markSupabaseOffline
} from './src/lib/supabaseSync.js';

dotenv.config();

const appDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
const DB_PATH = process.env.VERCEL ? path.join('/tmp', 'db.json') : path.join(appDir, 'db.json');
const PORT = 3000;

// Initialize Database structure
interface DBStructure {
  users: any[];
  classes: any[];
  notes: any[];
  courses?: any[];
  settings?: {
    academyName: string;
    announcement: string;
    heroTitle: string;
    heroSubtitle: string;
    heroSubEnglish: string;
    subjects: string[];
    classLevels?: string[];
    courseDurations?: string[];
    defaultCourseFeatures?: string[];
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    footerDescription: string;
    routine?: {
      id: string;
      day: string;
      subject: string;
      time: string;
    }[];
    academyLogoUrl?: string;
    adminName?: string;
    adminBio?: string;
    adminPhotoUrl?: string;
    adminDesignation?: string;
    adminEducation?: string;
    bkashNumber?: string;
    nagadNumber?: string;
    rocketNumber?: string;
    paymentInstructions?: string;
    heroJoinButtonText?: string;
    heroExploreButtonText?: string;
    orbitSectionBadge?: string;
    orbitSectionTitle?: string;
    orbitSectionSubtitle?: string;
    orbitAutoRotate?: boolean;
    orbitSpeedSeconds?: number;
    insightsTotalStudents?: string;
    insightsActivePercent?: string;
    insightsSuccessRate?: string;
    insightsSuccessRateLabel?: string;
    insightsTotalCourses?: string;
    insightsTotalNotes?: string;
    insightsBullet1?: string;
    insightsBullet2?: string;
    insightsBullet3?: string;
    insightsRegisterButtonText?: string;
    pillarsSectionBadge?: string;
    pillarsSectionTitle?: string;
    pillarsSectionSubtitle?: string;
    pillar1Title?: string;
    pillar1Badge?: string;
    pillar1Description?: string;
    pillar2Title?: string;
    pillar2Badge?: string;
    pillar2Description?: string;
    pillar3Title?: string;
    pillar3Badge?: string;
    pillar3Description?: string;
    mentorExperience?: string;
    mentorGuidance?: string;
    heroBadgeText?: string;
    announcementBadge?: string;
    marqueeNotice2?: string;
    marqueeNotice3?: string;
    marqueeNotice4?: string;
    marqueeNotice5?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    telegramUrl?: string;
    whatsappNumber?: string;
    helplineTime?: string;
    labSectionBadge?: string;
    labSectionTitle?: string;
    labSectionSubtitle?: string;
    heroBanners?: any[];
  };
}

const defaultDB: DBStructure = {
  users: [
    {
      id: "usr_admin",
      name: "Dr. Sayeed Rahman",
      email: "admin@sciencestudio.com",
      password: "admin123", // Stored for development simplicity
      role: "admin",
      isApproved: true,
      token: "tok_admin_init_sec_991823",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_super_admin",
      name: "Super Admin",
      email: "mdshakibhossen2050@gmail.com",
      password: "SHAKIB@2050#",
      role: "admin",
      isApproved: true,
      token: "tok_super_admin_sec_773821",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_student",
      name: "Afridi Hasan",
      email: "student@sciencestudio.com",
      password: "student123",
      role: "student",
      isApproved: true,
      token: "tok_student_init_sec_882910",
      createdAt: new Date().toISOString()
    }
  ],
  classes: [
    {
      id: "cls_1",
      title: "Introduction to Quantum Mechanics",
      subject: "Physics",
      videoUrl: "https://www.youtube.com/embed/Us8M_M3fRmo",
      description: "In this session, we explore the basics of Quantum Mechanics, wave-particle duality, and Heisenberg's Uncertainty Principle.",
      createdAt: new Date().toISOString()
    },
    {
      id: "cls_2",
      title: "Organic Chemistry: Carbon Compounds & Hybridization",
      subject: "Chemistry",
      videoUrl: "https://www.youtube.com/embed/H0f3B_YAn4o",
      description: "Deep dive into carbon structures, SP3/SP2/SP hybridization, and the basic principles of organic reactions.",
      createdAt: new Date().toISOString()
    },
    {
      id: "cls_3",
      title: "Cell Division & Mitotic Phases",
      subject: "Biology",
      videoUrl: "https://www.youtube.com/embed/f-ldPgEfAHI",
      description: "An illustrated lecture of mitosis and meiosis. Perfect for visualizing the lifecycle of eukaryotic cells.",
      createdAt: new Date().toISOString()
    }
  ],
  notes: [
    {
      id: "nte_1",
      title: "Quantum Physics Formula Sheet & Core Concepts",
      subject: "Physics",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      description: "A comprehensive reference sheet containing fundamental quantum equations, Schrödinger operators, and notes.",
      createdAt: new Date().toISOString()
    },
    {
      id: "nte_2",
      title: "Alkanes, Alkenes, and Alkynes Functional Groups Guide",
      subject: "Chemistry",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      description: "Essential reaction pathways and naming conventions (IUPAC rules) for hydrocarbons.",
      createdAt: new Date().toISOString()
    },
    {
      id: "nte_3",
      title: "DNA Replication & Enzyme Functions Study Note",
      subject: "Biology",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      description: "Step-by-step notes covering helicase, DNA polymerase, RNA primase, ligase and okazaki fragments.",
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    academyName: "SCIENCE STUDIO by Sakib",
    announcement: "ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026",
    heroTitle: "Innovate, Educate & Explore with Science Studio by Sakib",
    heroSubtitle: "বিজ্ঞান চর্চাকে সহজ, আনন্দদায়ক এবং প্রযুক্তিনির্ভর করতে সাকিব স্যারের এই বিশেষ উদ্যোগ। Science Studio by Sakib-এ রয়েছে সেরা মানের ভিডিও লেকচার, ইন্টারেক্টিভ সিমুলেটর এবং সার্বক্ষণিক ডাউট সলভ মেন্টরশিপ।",
    heroSubEnglish: "Experience premium science coaching with high-fidelity interactive simulation play desks, curated video masterclasses, and concise PDF materials by Sakib Sir.",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "General Science"],
    classLevels: ["HSC", "HSC 1st Year", "HSC 2nd Year", "Class 9-10 (SSC)", "Class 10", "Class 9", "Class 8", "Admission Test"],
    courseDurations: ["০৬ মাস (২৪টি লাইভ ক্লাস)", "১২ মাস (ফুল একাডেমিক কোর্স)", "০৩ মাস (ক্র্যাশ কোর্স)", "১৫ দিন (স্পেশাল রিভিশন)"],
    defaultCourseFeatures: [
      "রেকর্ডেড ও লাইভ ভিডিও ক্লাস",
      "অধ্যায়ভিত্তিক এইচডি পিডিএফ লেকচার শিট",
      "সাপ্তাহিক অনলাইন প্র্যাকটিস কুইজ ও এক্সাম",
      "২৪/৭ ডাউট সলভিং ও মেন্টর সাপোর্ট"
    ],
    contactPhone: "+৮৮০ ১৭০০-০০০০০০, +৮৮০ ১৯০০-০০০০০০",
    contactEmail: "support@sciencestudio.com",
    contactAddress: "বিজ্ঞান পার্ক রোড, ফার্মগেট, ঢাকা - ১২১৫",
    footerDescription: "সাকিব স্যারের তত্ত্ববধানে পরিচালিত একটি আধুনিক ও প্রযুক্তিনির্ভর বিজ্ঞান শিক্ষা কেন্দ্র। আমরা প্রতিটি স্টুডেন্টের মেধা বিকাশে এবং বিজ্ঞানকে সহজভাবে বোঝার সুব্যবস্থা নিশ্চিত করি।",
    adminName: "সাকিব হাসান (Sakib Hasan)",
    adminBio: "পদার্থবিজ্ঞান ও গণিত শিক্ষায় ৭+ বছরের অভিজ্ঞতা সম্পন্ন একজন নিবেদিতপ্রাণ শিক্ষক। তিনি শিক্ষার্থীদের বিজ্ঞানকে গভীরভাবে উপলব্ধি করতে সাহায্য করেন।",
    adminPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
    adminDesignation: "Founder & Chief Mentor",
    adminEducation: "বি.এস.সি. (ইঞ্জিনিয়ারিং), বুয়েট (BUET)",
    routine: [
      {
        id: "rtn_1",
        day: "শুক্রবার (Friday)",
        subject: "পদার্থবিজ্ঞান স্পেশাল ব্যাচ (Physics 1st Paper)",
        time: "🕒 বিকাল ৩:০০ - ৫:০০"
      },
      {
        id: "rtn_2",
        day: "শনিবার (Saturday)",
        subject: "রসায়ন স্পেশাল ব্যাচ (Chemistry Orbit Lab)",
        time: "🕒 বিকাল ৩:০০ - ৫:০০"
      },
      {
        id: "rtn_3",
        day: "সোমবার (Monday)",
        subject: "জীববিজ্ঞান প্র্যাকটিক্যাল + থিওরি (DNA Module)",
        time: "🕒 বিকাল ৪:০০ - ৫:৩০"
      },
      {
        id: "rtn_4",
        day: "বুধবার (Wednesday)",
        subject: "উচ্চতর গণিত ও প্রবলেম সলভিং সেশন",
        time: "🕒 বিকাল ৩:০০ - ৫:০০"
      }
    ],
    heroBadgeText: "প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO",
    announcementBadge: "নির্দেশনা ও নোটিশ",
    marqueeNotice2: "🔬 ভার্চুয়াল ল্যাবে পদার্থ, রসায়ন, জীব ও গণিতের ৩ডি ইন্টার-অ্যাক্টিভ সিমুলেশন ক্লাস উপলব্ধ।",
    marqueeNotice3: "📅 প্রতি সপ্তাহের রুটিন অনুযায়ী অফলাইন ক্লাসরুম ও অনলাইন লাইভ সেশন অনুষ্ঠিত হয়।",
    marqueeNotice4: "📚 প্রতিটি অধ্যায়ের প্র্যাকটিক্যাল হ্যান্ডনোট ও ফর্মুলা শিট ক্লাসরুম পোর্টাল থেকে ডাউনলোড করা যাবে।",
    marqueeNotice5: "⚡ সার্বক্ষণিক ডাউট ক্লিয়ারিং ডেস্ক ও মেন্টরশিপের সুবিধা পেতে আপনার প্রোফাইল অ্যাক্টিভ রাখুন।",
    facebookUrl: "https://facebook.com",
    youtubeUrl: "https://youtube.com",
    telegramUrl: "https://t.me",
    whatsappNumber: "+৮৮০ ১৭০০-০০০০০০",
    helplineTime: "সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)",
    labSectionBadge: "INTERACTIVE VIRTUAL LAB & PLAYGROUND",
    labSectionTitle: "সাকিব স্যারের ভার্চুয়াল সায়েন্স ল্যাব ও সিমুলেশন",
    labSectionSubtitle: "পড়াশোনা হোক আনন্দের ও গবেষণাধর্মী! পদার্থ, রসায়ন, জীববিজ্ঞান ও গণিতের গুরুত্বপূর্ণ টপিকগুলো নিজে পরিবর্তন করে প্র্যাকটিক্যাল জ্ঞান অর্জন করুন।"
  },
  courses: [
    {
      id: "crs_phys_master",
      title: "HSC Physics 3D Simulation Masterclass",
      subject: "Physics",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80",
      price: 1250,
      originalPrice: 1800,
      duration: "১২ মাস (ফুল একাডেমিক কোর্স)",
      badge: "সেরা সেলার",
      rating: 5,
      enrolledCount: 450,
      description: "ভেক্টর, গতিবিদ্যা ও তরঙ্গ বিজ্ঞানের শতভাগ ভিজ্যুয়াল ল্যাব সিমুলেশনসহ এ টু জেড কোর্স।",
      features: ["৩০+ থ্রিডি ল্যাব ক্লাস", "অধ্যায়ভিত্তিক PDF নোট", "প্রতি সপ্তাহে লাইভ ডাউট সলভ", "২৪/৭ মেন্টর সাপোর্ট"],
      createdAt: "2026-08-16T00:00:00.000Z"
    },
    {
      id: "crs_chem_reactor",
      title: "Chemistry Organic & Inorganic Reactor",
      subject: "Chemistry",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
      price: 1200,
      originalPrice: 1600,
      duration: "১২ মাস (ফুল একাডেমিক কোর্স)",
      badge: "পপুলার",
      rating: 5,
      enrolledCount: 380,
      description: "জৈব রসায়নের মেকানিজম এবং রাসায়নিক বিক্রিয়া মুখস্থ না করে সহজে আয়ত্ত করার স্পেশাল ব্যাচ।",
      features: ["জৈব রাসায়নিক শর্টকাট", "বোর্ড ও মেডিকেল প্রশ্ন সমাধান", "হ্যান্ডরাইটিং ফর্মুলা শিট", "২৪/৭ ডাউট সলভ ডেস্ক"],
      createdAt: "2026-08-16T00:00:00.000Z"
    },
    {
      id: "crs_bio_cellular",
      title: "Biology 3D Anatomy & Cellular Master",
      subject: "Biology",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80",
      price: 1150,
      originalPrice: 1500,
      duration: "১২ মাস (ফুল একাডেমিক কোর্স)",
      badge: "হট কোর্স",
      rating: 5,
      enrolledCount: 310,
      description: "কোষ অঙ্গাণু, ডিএনএ রেপ্লিকেশন ও মানব শারীরতত্ত্বের হাই-ডেফিনিশন এনিমেশন ভিত্তিক প্রিপারেশন।",
      features: ["হাই-রেজুলেশন ডায়াগ্রাম", "মেডিকেল স্পেশাল গাইড", "সাপ্তাহিক ওএমআর মডেল টেস্ট", "২৪/৭ ডাউট সলভ"],
      createdAt: "2026-08-16T00:00:00.000Z"
    },
    {
      id: "crs_math_calculus",
      title: "Higher Math Calculus & Vector 3D",
      subject: "Mathematics",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
      price: 1300,
      originalPrice: 1700,
      duration: "১২ মাস (ফুল একাডেমিক কোর্স)",
      badge: "অ্যাডভান্সড",
      rating: 5,
      enrolledCount: 420,
      description: "ডিফারেন্সিয়েশন ও ইন্টিগ্রেশনের ভয় দূর করে ভিজ্যুয়াল গ্রাফিক্স দিয়ে অংক সমাধানের ম্যাজিক প্রযুক্তি।",
      features: ["২০০+ জটিল সমস্যা সমাধান", "অ্যাডমিশন স্ট্যান্ডার্ড ট্রিকস", "প্র্যাকটিস প্রবলেম ব্যাংক", "২৪/৭ ডাউট সলভ"],
      createdAt: "2026-08-16T00:00:00.000Z"
    },
    {
      id: "crs_med_admission",
      title: "Medical & University Admission Science Pack",
      subject: "General Science",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80",
      price: 1500,
      originalPrice: 2000,
      duration: "০৬ মাস (২৪টি লাইভ ক্লাস)",
      badge: "ফ্ল্যাগশিপ",
      rating: 5,
      enrolledCount: 520,
      description: "বুয়েট, মেডিকেল ও ঢাবি ক-ইউনিটের শীর্ষ স্থান অর্জনের জন্য সাকিব স্যারের পার্সোনাল গাইডলাইন ব্যাচ।",
      features: ["সরাসরি সাকিব স্যারের মেন্টরশিপ", "ডেইলি ওএমআর অ্যাসেসমেন্ট", "স্পেশাল প্রশ্ন ব্যাংক সমাধান", "২৪/৭ ডাউট সলভিং"],
      createdAt: "2026-08-16T00:00:00.000Z"
    },
    {
      id: "crs_ict_hsc",
      title: "ICT & Computational Science HSC",
      subject: "ICT",
      classLevel: "HSC",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      price: 990,
      originalPrice: 1400,
      duration: "০৩ মাস (ক্র্যাশ কোর্স)",
      badge: "ফ্রী রিসোর্স সহ",
      rating: 5,
      enrolledCount: 290,
      description: "C প্রোগ্রামিং, ডাটাবেজ ও লজিক গেট সহজে শেখার জন্য প্র্যাকটিক্যাল কোডিং ও অ্যানিমেশন ক্লাস।",
      features: ["লাইভ প্রোগ্রামিং ল্যাব", "এইচএসসি প্র্যাকটিক্যাল সলভ", "শর্টকাট নোটস", "২৪/৭ ডাউট সলভ"],
      createdAt: "2026-08-16T00:00:00.000Z"
    }
  ]
};

// Database helper functions
function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
      return defaultDB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    let updated = false;

    if (!parsed.courses) {
      parsed.courses = defaultDB.courses;
      updated = true;
    }

    if (!parsed.settings) {
      parsed.settings = defaultDB.settings;
      updated = true;
    } else {
      if (!parsed.settings.routine) {
        parsed.settings.routine = defaultDB.settings?.routine;
        updated = true;
      }
      if (!parsed.settings.adminName) {
        parsed.settings.adminName = defaultDB.settings?.adminName;
        updated = true;
      }
      if (!parsed.settings.adminBio) {
        parsed.settings.adminBio = defaultDB.settings?.adminBio;
        updated = true;
      }
      if (!parsed.settings.adminPhotoUrl) {
        parsed.settings.adminPhotoUrl = defaultDB.settings?.adminPhotoUrl;
        updated = true;
      }
      if (!parsed.settings.adminDesignation) {
        parsed.settings.adminDesignation = defaultDB.settings?.adminDesignation;
        updated = true;
      }
      if (!parsed.settings.adminEducation) {
        parsed.settings.adminEducation = defaultDB.settings?.adminEducation;
        updated = true;
      }
    }

    // Ensure mdshakibhossen2050@gmail.com is present with admin role and valid credentials
    if (parsed.users && Array.isArray(parsed.users)) {
      const shakibUser = parsed.users.find((u: any) => u.email && u.email.toLowerCase() === 'mdshakibhossen2050@gmail.com');
      if (shakibUser) {
        if (shakibUser.role !== 'admin' || !shakibUser.isApproved) {
          shakibUser.role = 'admin';
          shakibUser.isApproved = true;
          updated = true;
        }
        if (!shakibUser.password) {
          shakibUser.password = 'SHAKIB@2050#';
          updated = true;
        }
      } else {
        parsed.users.push({
          id: "usr_super_admin",
          name: "Super Admin",
          email: "mdshakibhossen2050@gmail.com",
          password: "SHAKIB@2050#",
          role: "admin",
          isApproved: true,
          createdAt: new Date().toISOString()
        });
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return defaultDB;
  }
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    // Asynchronously push updates to Supabase
    syncToSupabase(data);
  } catch (err) {
    console.error("Error writing to database:", err);
  }
}

export const app = express();

// Sync database state with Supabase safely without blocking startup
if (!process.env.VERCEL) {
  try {
    const currentLocal = readDB();
    loadFromSupabase(currentLocal).then((supabaseData) => {
      if (supabaseData) {
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(supabaseData, null, 2));
        } catch (e) {}
        // Also push back complete merged state to Supabase so config JSON is fully populated
        syncToSupabase(supabaseData);
      } else {
        syncToSupabase(currentLocal);
      }
    }).catch((err) => {
      console.log("Supabase initialization check:", err);
    });
  } catch (err) {
    console.log("Supabase initialization check:", err);
  }
}

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

const uploadsDir = path.join(appDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Optimized video & media streaming static middleware for /uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Accept-Ranges', 'bytes');

  // Handle video range streaming for direct MP4/WebM/OGG files
  const reqFilePath = path.join(uploadsDir, decodeURIComponent(req.path));
  if (fs.existsSync(reqFilePath) && fs.statSync(reqFilePath).isFile()) {
    const ext = path.extname(reqFilePath).toLowerCase();
    const videoMimes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.m4v': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    };

    if (videoMimes[ext]) {
      res.setHeader('Content-Type', videoMimes[ext]);
    }

    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.webm' || ext === '.ogg' || ext === '.mov' || ext === '.m4v')) {
      const stat = fs.statSync(reqFilePath);
      const fileSize = stat.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(reqFilePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': videoMimes[ext] || 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
      return;
    }
  }
  next();
}, express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// Express JSON body parse & payload error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: "আপলোড করা ফাইল বা ডেটার সাইজ অনেক বড়। অনুগ্রহ করে সরাসরি ভিডিও লিঙ্ক (YouTube/Google Drive) ব্যবহার করুন অথবা কম সাইজের ফাইল আপলোড করুন।" });
  }
  if (err) {
    return res.status(err.status || 500).json({ error: err.message || "সার্ভার প্রসেসিং ত্রুটি ঘটেছে।" });
  }
  next();
});

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API middleware to extract current user from auth token
  app.use((req, res, next) => {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query && typeof req.query.token === 'string') {
      token = req.query.token.trim();
    } else if (req.headers['x-auth-token'] && typeof req.headers['x-auth-token'] === 'string') {
      token = (req.headers['x-auth-token'] as string).trim();
    }

    if (token) {
      const db = readDB();
      // Match user by assigned session token, ID-based token, email-based token, or user ID
      const user = db.users.find(u => {
        if (!u) return false;
        const cleanEmail = u.email ? u.email.toLowerCase().trim() : '';
        const cleanId = u.id ? String(u.id).trim() : '';
        return (
          (u.token && u.token === token) ||
          (cleanId && `token-${cleanId}` === token) ||
          (cleanEmail && `token-${cleanEmail}` === token) ||
          (cleanId && token === cleanId) ||
          (cleanEmail && token === cleanEmail) ||
          (cleanId && token.includes(cleanId))
        );
      });

      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });

  // Helper middleware to check authentication
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: "Unauthorized. Authentication is required." });
    }
    next();
  };

  // Helper middleware to check admin authorization
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user || (req as any).user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    next();
  };

  // --- API ROUTES ---

  // Auth: Signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password, phone, enrolledCourseTitles, courseTitle, transactionId, paymentMethod, senderPhone } = req.body || {};
      if (!name || !name.trim() || !email || !email.trim() || !password) {
        return res.status(400).json({ error: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।" });
      }

      // Mandatory 11-digit Bangladeshi phone validation
      const banglaToEnglishDigits = (str: string) => str.replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
      const cleanPhone = phone ? banglaToEnglishDigits(String(phone).trim()).replace(/\D/g, '') : '';
      const phoneRegex = /^01[3-9]\d{8}$/;

      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ error: "মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের বৈধ বাংলাদেশী নম্বর হতে হবে (যেমন: 01712345678)।" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const db = readDB();
      const existing = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: "এই ইমেইল দিয়ে ইতোমধ্যেই একটি অ্যাকাউন্ট তৈরি করা আছে।" });
      }

      let initialEnrolled: string[] = [];
      if (Array.isArray(enrolledCourseTitles)) {
        initialEnrolled = enrolledCourseTitles;
      } else if (courseTitle) {
        initialEnrolled = [courseTitle];
      }

      const token = 'tok_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

      const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password,
        role: 'student', // default signup is always student
        isApproved: false, // requires admin approval to unlock class resources
        token,
        enrolledCourseTitles: initialEnrolled,
        transactionId: transactionId ? transactionId.trim() : "",
        paymentMethod: paymentMethod ? paymentMethod.trim() : "",
        senderPhone: senderPhone ? senderPhone.trim() : "",
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      writeDB(db);

      // Register user in Supabase Authentication & app_users table asynchronously without blocking signup response
      registerUserInSupabaseAuth(cleanEmail, password, name.trim(), cleanPhone, newUser).catch(e => {
        console.log("Supabase Auth registration notice:", e);
      });

      // Exclude password and internal fields from response
      const { password: _, token: __, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: err?.message || "রেজিস্ট্রেশন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।" });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, expectedRole } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "ইমেইল এবং পাসওয়ার্ড আবশ্যক।" });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password).trim();

      const db = readDB();
      let user = db.users.find(u => u && u.email && u.email.trim().toLowerCase() === cleanEmail);

      // Auto-restore / ensure default accounts if deleted or missing from DB
      if (!user) {
        if (cleanEmail === 'admin@sciencestudio.com') {
          user = {
            id: "usr_admin",
            name: "Dr. Sayeed Rahman",
            email: "admin@sciencestudio.com",
            password: "admin123",
            role: "admin",
            isApproved: true,
            createdAt: new Date().toISOString()
          };
          db.users.push(user);
          writeDB(db);
        } else if (cleanEmail === 'mdshakibhossen2050@gmail.com') {
          user = {
            id: "usr_super_admin",
            name: "Super Admin",
            email: "mdshakibhossen2050@gmail.com",
            password: "SHAKIB@2050#",
            role: "admin",
            isApproved: true,
            createdAt: new Date().toISOString()
          };
          db.users.push(user);
          writeDB(db);
        } else if (cleanEmail === 'student@sciencestudio.com') {
          user = {
            id: "usr_student",
            name: "Afridi Hasan",
            email: "student@sciencestudio.com",
            password: "student123",
            role: "student",
            isApproved: true,
            createdAt: new Date().toISOString()
          };
          db.users.push(user);
          writeDB(db);
        }
      }

      if (!user) {
        return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল অথবা অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
      }

      // Verify Password (case-sensitive or trimmed match, plus fallback for default accounts)
      const isPasswordValid = 
        user.password === cleanPassword || 
        user.password === password ||
        (cleanEmail === 'admin@sciencestudio.com' && (cleanPassword === 'admin123')) ||
        (cleanEmail === 'mdshakibhossen2050@gmail.com' && (cleanPassword === 'SHAKIB@2050#' || cleanPassword === 'admin123')) ||
        (cleanEmail === 'student@sciencestudio.com' && (cleanPassword === 'student123'));

      if (!isPasswordValid) {
        return res.status(401).json({ error: "পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।" });
      }

      // Check role constraints
      if (expectedRole === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ error: "এই অ্যাকাউন্টের এডমিন অ্যাক্সেস নেই। এটি একটি স্টুডেন্ট অ্যাকাউন্ট।" });
      }

      if (expectedRole === 'student' && user.role === 'admin') {
        return res.status(403).json({ error: "স্টুডেন্ট লগইন অপশন থেকে এডমিন অ্যাকাউন্টে লগইন করা যাবে না। অনুগ্রহ করে এডমিন পোর্টাল ব্যবহার করুন।" });
      }

      // Generate fresh session token
      const token = 'tok_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      user.token = token;
      writeDB(db);

      // Async sync with Supabase Auth
      registerUserInSupabaseAuth(cleanEmail, cleanPassword, user.name, user.phone, user).catch(e => {
        console.log("Supabase Auth login sync notice:", e);
      });

      const { password: _, token: __, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (err: any) {
      console.error("Login route error:", err);
      return res.status(500).json({ error: err?.message || "লগইন করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }
  });

  // Auth: Get current user
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const { password: _, ...userWithoutPassword } = (req as any).user;
    res.json({ user: userWithoutPassword });
  });

  // Helper to format video embed URLs on server side
  function serverFormatVideoEmbedUrl(url: string | undefined | null): string {
    if (!url) return '';
    let trimmed = String(url).trim();
    if (!trimmed) return '';

    // If iframe snippet was posted, extract src
    if (trimmed.includes('<iframe') || trimmed.includes('<IFRAME')) {
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        trimmed = srcMatch[1].trim();
      }
    }

    if (trimmed.includes('youtube.com/watch')) {
      const match = trimmed.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (trimmed.includes('youtu.be/')) {
      const parts = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
      if (parts) return `https://www.youtube.com/embed/${parts}`;
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      const parts = trimmed.split('shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
      if (parts) return `https://www.youtube.com/embed/${parts}`;
    }
    if (trimmed.includes('youtube.com/live/')) {
      const parts = trimmed.split('live/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
      if (parts) return `https://www.youtube.com/embed/${parts}`;
    }
    if (trimmed.includes('drive.google.com/file/d/')) {
      const fileId = trimmed.split('file/d/')[1]?.split('/')[0]?.split('?')[0];
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (trimmed.includes('drive.google.com') && trimmed.includes('id=')) {
      const match = trimmed.match(/[?&]id=([^&#]+)/);
      if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    if (trimmed.includes('docs.google.com/file/d/')) {
      const fileId = trimmed.split('file/d/')[1]?.split('/')[0]?.split('?')[0];
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (trimmed.includes('vimeo.com/') && !trimmed.includes('player.vimeo.com')) {
      const match = trimmed.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) return `https://player.vimeo.com/video/${match[1]}`;
    }
    if (trimmed.includes('loom.com/share/')) {
      const loomId = trimmed.split('loom.com/share/')[1]?.split('?')[0];
      if (loomId) return `https://www.loom.com/embed/${loomId}`;
    }
    if (trimmed.includes('dailymotion.com/video/')) {
      const dmId = trimmed.split('video/')[1]?.split('?')[0];
      if (dmId) return `https://www.dailymotion.com/embed/video/${dmId}`;
    }
    return trimmed;
  }

  // Upload File API (Admin only)
  app.post('/api/upload-file', requireAdmin, async (req, res) => {
    try {
      const bucket = (req.headers['x-bucket'] as string) || 'course-videos';
      const fileNameHeader = (req.headers['x-filename'] as string) || `file_${Date.now()}`;
      const contentType = (req.headers['x-content-type'] as string) || (req.headers['content-type'] as string) || 'application/octet-stream';

      let dataUrlOrBase64 = typeof req.body === 'string' ? req.body : (req.body?.data || req.body?.file);
      if (!dataUrlOrBase64) {
        return res.status(400).json({ error: "ফাইল বা ডেটা পাওয়া যায়নি।" });
      }

      await ensureSupabaseBucket(bucket);
      let uploadedUrl = await uploadToSupabaseStorage(bucket, fileNameHeader, dataUrlOrBase64, contentType);

      if (!uploadedUrl) {
        const cleanBase64 = dataUrlOrBase64.includes(';base64,') 
          ? dataUrlOrBase64.split(';base64,')[1] 
          : dataUrlOrBase64;
        const buffer = Buffer.from(cleanBase64, 'base64');
        const localFilePath = path.join(uploadsDir, fileNameHeader);
        fs.writeFileSync(localFilePath, buffer);
        uploadedUrl = `/uploads/${fileNameHeader}`;
      }

      return res.json({ url: uploadedUrl });
    } catch (err: any) {
      console.error("Upload file error:", err);
      return res.status(500).json({ error: err?.message || "ফাইল আপলোড করতে সমস্যা হয়েছে।" });
    }
  });

  // Classes: Get all video classes (accessible to both students and admins)
  app.get('/api/classes', requireAuth, (req, res) => {
    const db = readDB();
    const formattedClasses = (db.classes || []).map(c => ({
      ...c,
      videoUrl: serverFormatVideoEmbedUrl(c.videoUrl)
    }));
    res.json(formattedClasses);
  });

  // Classes: Create a new class (Admin only)
  app.post('/api/classes', requireAdmin, async (req, res) => {
    try {
      const { title, subject, courseId, courseTitle, videoUrl, thumbnailUrl, description } = req.body;
      if (!title || !subject || !videoUrl) {
        return res.status(400).json({ error: "কোর্সের শিরোনাম, বিষয় এবং ভিডিও আবশ্যক।" });
      }

      const classId = 'cls_' + Math.random().toString(36).substring(2, 9);
      let finalVideoUrl = serverFormatVideoEmbedUrl(videoUrl);

      // Automatically store base64 video file into Supabase Storage or local fallback
      if (typeof videoUrl === 'string' && videoUrl.startsWith('data:')) {
        const mimeMatch = videoUrl.match(/^data:(video\/[a-zA-Z0-9]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const fileName = `${classId}_${Date.now()}.${ext}`;
        let uploadedUrl = await uploadToSupabaseStorage('course-videos', fileName, videoUrl, mimeType);
        if (!uploadedUrl) {
          const cleanBase64 = videoUrl.split(';base64,')[1] || videoUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalVideoUrl = uploadedUrl;
        }
      }

      let finalThumbnailUrl = thumbnailUrl;
      if (typeof thumbnailUrl === 'string' && thumbnailUrl.startsWith('data:')) {
        const fileName = `thumb_${classId}_${Date.now()}.jpg`;
        let uploadedUrl = await uploadToSupabaseStorage('course-images', fileName, thumbnailUrl, 'image/jpeg');
        if (!uploadedUrl) {
          const cleanBase64 = thumbnailUrl.split(';base64,')[1] || thumbnailUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalThumbnailUrl = uploadedUrl;
        }
      }

      const db = readDB();
      const newClass = {
        id: classId,
        title: String(title).trim(),
        subject: String(subject).trim(),
        courseId: courseId || undefined,
        courseTitle: courseTitle || undefined,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl || undefined,
        description: description || "",
        createdAt: new Date().toISOString()
      };

      db.classes.unshift(newClass); // Add to the beginning of list
      writeDB(db);
      await upsertClassToSupabase(newClass).catch(e => console.log('Class sync error:', e));

      res.status(201).json(newClass);
    } catch (err: any) {
      console.error("Create class error:", err);
      res.status(500).json({ error: err?.message || "ক্লাস যুক্ত করতে সমস্যা হয়েছে।" });
    }
  });

  // Classes: Delete a class (Admin only)
  app.delete('/api/classes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.classes.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Class not found." });
    }

    db.classes.splice(index, 1);
    writeDB(db);

    // Non-blocking background Supabase deletion and sync
    (async () => {
      try {
        await deleteFromSupabase('app_classes', id);
        await syncToSupabase(readDB());
      } catch (e) {
        console.log('Background delete class notice:', e);
      }
    })();

    res.json({ message: "Class successfully deleted." });
  });

  // Notes: Get all lecture notes (accessible to both students and admins)
  app.get('/api/notes', requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.notes);
  });

  // Notes: Create a new note (Admin only)
  app.post('/api/notes', requireAdmin, async (req, res) => {
    try {
      const { title, subject, courseId, courseTitle, pdfUrl, description } = req.body;
      if (!title || !subject || !pdfUrl) {
        return res.status(400).json({ error: "Title, Subject, and PDF URL are required." });
      }

      const noteId = 'nte_' + Math.random().toString(36).substring(2, 9);
      let finalPdfUrl = pdfUrl;

      if (typeof pdfUrl === 'string' && pdfUrl.startsWith('data:')) {
        const fileName = `${noteId}_${Date.now()}.pdf`;
        let uploadedUrl = await uploadToSupabaseStorage('pdf-materials', fileName, pdfUrl, 'application/pdf');
        if (!uploadedUrl) {
          const cleanBase64 = pdfUrl.split(';base64,')[1] || pdfUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalPdfUrl = uploadedUrl;
        }
      }

      const db = readDB();
      const newNote = {
        id: noteId,
        title,
        subject,
        courseId: courseId || undefined,
        courseTitle: courseTitle || undefined,
        pdfUrl: finalPdfUrl,
        description: description || "",
        createdAt: new Date().toISOString()
      };

      db.notes.unshift(newNote); // Add to the beginning of list
      writeDB(db);
      await upsertNoteToSupabase(newNote).catch(e => console.log('Note sync error:', e));

      res.status(201).json(newNote);
    } catch (err: any) {
      console.error("Create note error:", err);
      res.status(500).json({ error: err?.message || "নোট সেভ করতে সমস্যা হয়েছে।" });
    }
  });

  // Notes: Delete a note (Admin only)
  app.delete('/api/notes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.notes.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Note not found." });
    }

    const noteToDelete = db.notes[index];
    db.notes.splice(index, 1);
    writeDB(db);

    // Non-blocking background Supabase deletion and sync
    (async () => {
      try {
        await deleteFromSupabase('app_notes', id);
        await syncToSupabase(readDB());
        if (noteToDelete.pdfUrl && noteToDelete.pdfUrl.includes('pdf-materials/')) {
          const fileName = noteToDelete.pdfUrl.split('pdf-materials/')[1]?.split('?')[0];
          if (fileName) {
            deleteFromSupabaseStorage('pdf-materials', fileName).catch(e => console.log('Delete PDF storage notice:', e));
          }
        }
      } catch (e) {
        console.log('Background delete note notice:', e);
      }
    })();

    res.json({ message: "Note successfully deleted." });
  });

  // Courses: Get all courses (Public/Authenticated)
  app.get('/api/courses', async (req, res) => {
    try {
      const db = readDB();
      if (!db.courses) db.courses = [];

      // Fetch live courses from Supabase with timeout if available
      if (canAttemptSupabase()) {
        try {
          const sbResponse = await Promise.race([
            supabaseServer.from('app_courses').select('*'),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500))
          ]).catch(err => {
            if (isNetworkError(err)) markSupabaseOffline(err);
            return { data: null, error: err };
          });

          if (Array.isArray(sbResponse?.data) && sbResponse.data.length > 0) {
            let updated = false;
            sbResponse.data.forEach((r: any) => {
              const existingIndex = db.courses!.findIndex(c => c.id === r.id);
              const courseObj = {
                id: r.id,
                title: r.title,
                subject: r.subject,
                price: Number(r.price || 0),
                duration: r.duration || '',
                features: Array.isArray(r.features) ? r.features : [],
                imageUrl: r.image_url || r.imageUrl || '',
                ...(r.data || {})
              };
              if (existingIndex !== -1) {
                db.courses![existingIndex] = { ...db.courses![existingIndex], ...courseObj };
              } else {
                db.courses!.unshift(courseObj);
                updated = true;
              }
            });
            if (updated) {
              writeDB(db);
            }
          }
        } catch (sbErr: any) {
          if (isNetworkError(sbErr)) markSupabaseOffline(sbErr);
        }
      }

      res.json(db.courses);
    } catch (err: any) {
      console.error("Get courses error:", err);
      res.status(500).json({ error: "কোর্স তালিকা পেতে সমস্যা হয়েছে।" });
    }
  });

  // Courses: Create new course (Admin only)
  app.post('/api/courses', requireAdmin, async (req, res) => {
    try {
      const { title, subject, classLevel, imageUrl, price, originalPrice, duration, description, features } = req.body || {};
      if (!title || !subject || price === undefined || price === null || price === '') {
        return res.status(400).json({ error: "কোর্সের নাম, বিষয় এবং কোর্স ফি (Price) প্রদান করা বাধ্যতামূলক।" });
      }

      const courseId = 'crs_' + Math.random().toString(36).substring(2, 9);
      let finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80';

      if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
        const fileName = `${courseId}_${Date.now()}.jpg`;
        let uploadedUrl = await uploadToSupabaseStorage('course-images', fileName, imageUrl, 'image/jpeg');
        if (!uploadedUrl) {
          const cleanBase64 = imageUrl.split(';base64,')[1] || imageUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const db = readDB();
      if (!db.courses) db.courses = [];

      const newCourse = {
        id: courseId,
        title: String(title).trim(),
        subject: String(subject).trim(),
        classLevel: classLevel ? String(classLevel).trim() : '',
        imageUrl: finalImageUrl,
        price: Number(price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        duration: duration ? String(duration).trim() : '',
        description: description ? String(description).trim() : '',
        features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(Boolean) : []),
        createdAt: new Date().toISOString()
      };

      db.courses.unshift(newCourse);
      writeDB(db);
      await upsertCourseToSupabase(newCourse).catch(e => console.log('Course sync error:', e));

      res.status(201).json(newCourse);
    } catch (err: any) {
      console.error("Create course route error:", err);
      res.status(500).json({ error: err?.message || "কোর্স পাবলিশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }
  });

  // Courses: Update course (Admin only)
  app.put('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, subject, classLevel, imageUrl, price, originalPrice, duration, description, features } = req.body || {};
      
      const db = readDB();
      if (!db.courses) db.courses = [];
      const index = db.courses.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Course not found." });
      }

      const updatedCourse = {
        ...db.courses[index],
        title: title ?? db.courses[index].title,
        subject: subject ?? db.courses[index].subject,
        classLevel: classLevel ?? db.courses[index].classLevel,
        imageUrl: imageUrl ?? db.courses[index].imageUrl,
        price: price !== undefined ? Number(price) : db.courses[index].price,
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : db.courses[index].originalPrice,
        duration: duration ?? db.courses[index].duration,
        description: description ?? db.courses[index].description,
        features: features !== undefined 
          ? (Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(Boolean) : []))
          : db.courses[index].features
      };

      db.courses[index] = updatedCourse;
      writeDB(db);
      await upsertCourseToSupabase(updatedCourse).catch(e => console.log('Course sync error:', e));

      res.json(updatedCourse);
    } catch (err: any) {
      console.error("Update course error:", err);
      res.status(500).json({ error: err?.message || "কোর্স আপডেট করতে সমস্যা হয়েছে।" });
    }
  });

  // Courses: Delete course (Admin only)
  app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      if (!db.courses) db.courses = [];
      const index = db.courses.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Course not found." });
      }

      const courseToDelete = db.courses[index];
      db.courses.splice(index, 1);

      // Collect IDs of classes and notes to remove
      const deletedClassIds: string[] = [];
      if (db.classes && Array.isArray(db.classes)) {
        const remainingClasses: any[] = [];
        db.classes.forEach(c => {
          if (c.courseId === id || (courseToDelete.title && c.courseTitle === courseToDelete.title)) {
            deletedClassIds.push(c.id);
          } else {
            remainingClasses.push(c);
          }
        });
        db.classes = remainingClasses;
      }

      const deletedNoteIds: string[] = [];
      if (db.notes && Array.isArray(db.notes)) {
        const remainingNotes: any[] = [];
        db.notes.forEach(n => {
          if (n.courseId === id || (courseToDelete.title && n.courseTitle === courseToDelete.title)) {
            deletedNoteIds.push(n.id);
          } else {
            remainingNotes.push(n);
          }
        });
        db.notes = remainingNotes;
      }

      if (db.users && Array.isArray(db.users)) {
        db.users.forEach(u => {
          if (u.enrolledCourseTitles && Array.isArray(u.enrolledCourseTitles) && courseToDelete.title) {
            u.enrolledCourseTitles = u.enrolledCourseTitles.filter(t => t !== courseToDelete.title);
          }
        });
      }

      writeDB(db);

      // Non-blocking background Supabase deletion and sync
      (async () => {
        try {
          await Promise.all([
            deleteFromSupabase('app_courses', id),
            ...deletedClassIds.map(clsId => deleteFromSupabase('app_classes', clsId)),
            ...deletedNoteIds.map(nteId => deleteFromSupabase('app_notes', nteId))
          ]);
          await syncToSupabase(readDB());
          if (courseToDelete.imageUrl && courseToDelete.imageUrl.includes('course-images/')) {
            const fileName = courseToDelete.imageUrl.split('course-images/')[1]?.split('?')[0];
            if (fileName) {
              deleteFromSupabaseStorage('course-images', fileName).catch(e => console.log('Delete image storage notice:', e));
            }
          }
        } catch (e) {
          console.log('Background course delete notice:', e);
        }
      })();

      res.json({ message: "Course successfully deleted." });
    } catch (err: any) {
      console.error("Delete course error:", err);
      res.status(500).json({ error: err?.message || "কোর্স ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  // Admin Dashboard Statistics
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const db = readDB();

      // Ensure users are synced from Supabase for accurate student count if online
      if (canAttemptSupabase()) {
        try {
          const sbResponse = await Promise.race([
            supabaseServer.from('app_users').select('*'),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500))
          ]).catch(err => {
            if (isNetworkError(err)) markSupabaseOffline(err);
            return { data: null, error: err };
          });

          if (Array.isArray(sbResponse?.data) && sbResponse.data.length > 0) {
            let updated = false;
            sbResponse.data.forEach((r: any) => {
              const existing = db.users.find(u => (u.id && r.id && u.id === r.id) || (u.email && r.email && u.email.toLowerCase() === r.email.toLowerCase()));
              if (!existing) {
                db.users.push({
                  id: r.id || 'usr_' + Math.random().toString(36).substring(2, 9),
                  name: r.name || 'User',
                  email: r.email ? r.email.toLowerCase() : '',
                  role: r.role || 'student',
                  isApproved: r.is_approved ?? r.isApproved ?? true,
                  phone: r.phone || '',
                  enrolledCourseTitles: Array.isArray(r.enrolled_courses) ? r.enrolled_courses : (r.enrolledCourseTitles || []),
                  transactionId: r.transaction_id || r.transactionId || '',
                  paymentMethod: r.payment_method || r.paymentMethod || '',
                  senderPhone: r.sender_phone || r.senderPhone || '',
                  createdAt: r.created_at || new Date().toISOString(),
                  ...(r.data || {})
                });
                updated = true;
              }
            });
            if (updated) {
              writeDB(db);
            }
          }
        } catch (e: any) {
          if (isNetworkError(e)) markSupabaseOffline(e);
        }
      }

      const students = db.users.filter(u => u.role === 'student');
      
      // Calculate subject distributions
      const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Science'];
      const subjectDistribution = subjects.map(subject => {
        const classesCount = db.classes.filter(c => c.subject && c.subject.toLowerCase() === subject.toLowerCase()).length;
        const notesCount = db.notes.filter(n => n.subject && n.subject.toLowerCase() === subject.toLowerCase()).length;
        return {
          subject,
          classes: classesCount,
          notes: notesCount
        };
      });

      res.json({
        totalStudents: students.length,
        totalClasses: db.classes.length,
        totalNotes: db.notes.length,
        subjectDistribution
      });
    } catch (err: any) {
      console.error("Admin stats route error:", err);
      res.status(500).json({ error: "ড্যাশবোর্ড তথ্য পেতে সমস্যা হয়েছে।" });
    }
  });

  // Admin: Get list of all registered users
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const db = readDB();

      // Query Supabase app_users table with timeout fallback to get live registered students if online
      if (canAttemptSupabase()) {
        try {
          const sbResponse = await Promise.race([
            supabaseServer.from('app_users').select('*'),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 3000))
          ]).catch(err => {
            if (isNetworkError(err)) markSupabaseOffline(err);
            return { data: null, error: err };
          });

          const sbUsers = sbResponse?.data;
          if (Array.isArray(sbUsers) && sbUsers.length > 0) {
            let updated = false;
            sbUsers.forEach((r: any) => {
              const cleanSupabaseEmail = r.email ? r.email.toLowerCase().trim() : '';
              const existingIndex = db.users.findIndex(u => 
                (u.id && r.id && u.id === r.id) || 
                (u.email && cleanSupabaseEmail && u.email.toLowerCase().trim() === cleanSupabaseEmail)
              );

              // Extract nested or column data
              const nested = (r.data && typeof r.data === 'object') ? r.data : {};
              const sbCourses = Array.isArray(r.enrolled_courses) && r.enrolled_courses.length > 0
                ? r.enrolled_courses
                : (Array.isArray(r.enrolledCourseTitles) ? r.enrolledCourseTitles : (Array.isArray(nested.enrolledCourseTitles) ? nested.enrolledCourseTitles : []));
              const sbTrx = r.transaction_id || r.transactionId || nested.transactionId || '';
              const sbPayment = r.payment_method || r.paymentMethod || nested.paymentMethod || '';
              const sbSender = r.sender_phone || r.senderPhone || nested.senderPhone || '';
              const sbPhone = r.phone || nested.phone || '';
              const sbApproved = r.is_approved !== undefined && r.is_approved !== null
                ? Boolean(r.is_approved)
                : (r.isApproved !== undefined && r.isApproved !== null ? Boolean(r.isApproved) : (nested.isApproved !== undefined ? Boolean(nested.isApproved) : false));

              if (existingIndex !== -1) {
                const localUser = db.users[existingIndex];
                // Union of enrolled courses so no courses are lost
                const mergedCourses = Array.from(new Set([
                  ...(Array.isArray(localUser.enrolledCourseTitles) ? localUser.enrolledCourseTitles : []),
                  ...(Array.isArray(sbCourses) ? sbCourses : [])
                ]));

                db.users[existingIndex] = {
                  ...nested,
                  ...localUser,
                  name: localUser.name || r.name || nested.name || 'User',
                  email: localUser.email || cleanSupabaseEmail || nested.email || '',
                  role: localUser.role || r.role || nested.role || 'student',
                  phone: localUser.phone || sbPhone || '',
                  studentClass: localUser.studentClass || r.student_class || nested.studentClass || '',
                  photoUrl: localUser.photoUrl || r.photo_url || nested.photoUrl || '',
                  avatarUrl: localUser.avatarUrl || localUser.photoUrl || r.photo_url || nested.avatarUrl || '',
                  enrolledCourseTitles: mergedCourses,
                  transactionId: localUser.transactionId || sbTrx || '',
                  paymentMethod: localUser.paymentMethod || sbPayment || '',
                  senderPhone: localUser.senderPhone || sbSender || '',
                  isApproved: localUser.isApproved !== undefined ? localUser.isApproved : sbApproved,
                  createdAt: localUser.createdAt || r.created_at || nested.createdAt || new Date().toISOString(),
                  token: localUser.token || nested.token
                };
              } else {
                const newUser = {
                  ...nested,
                  id: r.id || 'usr_' + Math.random().toString(36).substring(2, 9),
                  name: r.name || nested.name || 'User',
                  email: cleanSupabaseEmail || nested.email || '',
                  role: r.role || nested.role || 'student',
                  isApproved: sbApproved,
                  phone: sbPhone,
                  studentClass: r.student_class || r.studentClass || nested.studentClass || '',
                  photoUrl: r.photo_url || r.photoUrl || nested.photoUrl || '',
                  avatarUrl: r.photo_url || r.avatarUrl || nested.avatarUrl || '',
                  enrolledCourseTitles: sbCourses,
                  transactionId: sbTrx,
                  paymentMethod: sbPayment,
                  senderPhone: sbSender,
                  createdAt: r.created_at || nested.createdAt || new Date().toISOString()
                };
                db.users.push(newUser);
                updated = true;
              }
            });

            if (updated) {
              writeDB(db);
            }
          }
        } catch (sbErr: any) {
          if (isNetworkError(sbErr)) markSupabaseOffline(sbErr);
        }
      }

      const cleanUsers = db.users.map(({ password: _, ...u }) => u);
      res.json(cleanUsers);
    } catch (err: any) {
      console.error("Fetch admin users error:", err);
      res.status(500).json({ error: "ইউজারদের তালিকা পেতে সমস্যা হয়েছে।" });
    }
  });

  // Admin: Update user role
  app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'student' && role !== 'admin') {
      return res.status(400).json({ error: "ইনভ্যালিড রোল টাইপ।" });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === id || (u.email && u.email.toLowerCase() === id.toLowerCase()));
    if (!user) {
      return res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
    }

    user.role = role;
    writeDB(db);
    await upsertUserToSupabase(user).catch(() => {});

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: Toggle user approval status & update enrolled courses
  app.put('/api/admin/users/:id/approve', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { isApproved, enrolledCourseTitles } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === id || (u.email && u.email.toLowerCase() === id.toLowerCase()));
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.isApproved = Boolean(isApproved);
    if (Array.isArray(enrolledCourseTitles) && enrolledCourseTitles.length > 0) {
      user.enrolledCourseTitles = enrolledCourseTitles;
    }
    writeDB(db);

    // Sync to Supabase using safe helper
    await upsertUserToSupabase(user).catch(() => {});

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: Update user enrolled courses
  app.put('/api/admin/users/:id/courses', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { enrolledCourseTitles } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === id || (u.email && u.email.toLowerCase() === id.toLowerCase()));
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.enrolledCourseTitles = Array.isArray(enrolledCourseTitles) ? enrolledCourseTitles : [];
    writeDB(db);

    await upsertUserToSupabase(user).catch(() => {});

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Student: Enroll in a course & submit payment details
  app.post('/api/user/enroll', requireAuth, async (req, res) => {
    const { courseTitle, transactionId, paymentMethod, senderPhone } = req.body;
    if (!courseTitle) {
      return res.status(400).json({ error: "courseTitle is required." });
    }

    const db = readDB();
    const currentUser = (req as any).user;
    const user = db.users.find(u => u.id === currentUser.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!Array.isArray(user.enrolledCourseTitles)) {
      user.enrolledCourseTitles = [];
    }

    if (!user.enrolledCourseTitles.includes(courseTitle)) {
      user.enrolledCourseTitles.push(courseTitle);
    }

    if (transactionId !== undefined && transactionId !== null) user.transactionId = String(transactionId).trim();
    if (paymentMethod !== undefined && paymentMethod !== null) user.paymentMethod = String(paymentMethod).trim();
    if (senderPhone !== undefined && senderPhone !== null) user.senderPhone = String(senderPhone).trim();

    writeDB(db);

    await upsertUserToSupabase(user).catch(() => {});

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Student / User: Update Profile (Name, studentClass, photoUrl / avatarUrl, phone)
  app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
      const { name, studentClass, photoUrl, phone } = req.body || {};
      const currentUser = (req as any).user;

      const db = readDB();
      const user = db.users.find(u => u.id === currentUser.id);
      if (!user) {
        return res.status(404).json({ error: "ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" });
      }

      if (name && typeof name === 'string' && name.trim()) {
        user.name = name.trim();
      }

      if (studentClass !== undefined) {
        user.studentClass = String(studentClass).trim();
      }

      if (photoUrl !== undefined && photoUrl !== null) {
        let finalPhotoUrl = photoUrl;
        if (typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
          const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
          const uploadedUrl = await uploadToSupabaseStorage('course-images', fileName, photoUrl, 'image/jpeg');
          if (uploadedUrl) {
            finalPhotoUrl = uploadedUrl;
          } else {
            const cleanBase64 = photoUrl.split(';base64,')[1] || photoUrl;
            const buffer = Buffer.from(cleanBase64, 'base64');
            const localPath = path.join(uploadsDir, fileName);
            fs.writeFileSync(localPath, buffer);
            finalPhotoUrl = `/uploads/${fileName}`;
          }
        }
        user.photoUrl = finalPhotoUrl;
        user.avatarUrl = finalPhotoUrl;
      }

      if (phone !== undefined && typeof phone === 'string') {
        user.phone = phone.trim();
      }

      writeDB(db);
      await upsertUserToSupabase(user).catch(e => console.log('User profile sync error:', e));

      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword, message: "প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।" });
    } catch (err: any) {
      console.error("Update profile route error:", err);
      return res.status(500).json({ error: err?.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
    }
  });

  // Admin: Update user transaction details
  app.put('/api/admin/users/:id/transaction', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { transactionId, paymentMethod, senderPhone } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (transactionId !== undefined) user.transactionId = transactionId;
    if (paymentMethod !== undefined) user.paymentMethod = paymentMethod;
    if (senderPhone !== undefined) user.senderPhone = senderPhone;

    writeDB(db);
    await upsertUserToSupabase(user).catch(e => console.log('User transaction sync error:', e));

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    if (id === 'usr_admin') {
      return res.status(400).json({ error: "Cannot delete the primary administrator." });
    }

    const deletedUser = db.users[index];
    db.users.splice(index, 1);
    writeDB(db);

    // Non-blocking background Supabase deletion and sync
    (async () => {
      try {
        await deleteUserFromSupabase(id, deletedUser?.email);
        await syncToSupabase(readDB());
      } catch (e) {
        console.log('Delete user Supabase notice:', e);
      }
    })();

    res.json({ message: "User successfully deleted." });
  });

  // Settings: Get static website settings
  app.get('/api/settings', (req, res) => {
    try {
      const db = readDB();
      return res.json(db.settings || defaultDB.settings);
    } catch (err) {
      console.warn("Error reading settings in /api/settings:", err);
      return res.json(defaultDB.settings);
    }
  });

  // Settings: Update website settings (Admin only)
  app.put('/api/settings', requireAdmin, async (req, res) => {
    try {
      const { 
        academyName, 
        announcement, 
        heroTitle, 
        heroSubtitle, 
        heroSubEnglish, 
        subjects, 
        classLevels,
        courseDurations,
        defaultCourseFeatures,
        contactPhone, 
        contactEmail, 
        contactAddress, 
        footerDescription,
        routine,
        academyLogoUrl,
        adminName,
        adminBio,
        adminPhotoUrl,
        adminDesignation,
        adminEducation,
        bkashNumber,
        nagadNumber,
        rocketNumber,
        paymentInstructions,
        heroJoinButtonText,
        heroExploreButtonText,
        orbitSectionBadge,
        orbitSectionTitle,
        orbitSectionSubtitle,
        orbitAutoRotate,
        orbitSpeedSeconds,
        insightsTotalStudents,
        insightsActivePercent,
        insightsSuccessRate,
        insightsSuccessRateLabel,
        insightsTotalCourses,
        insightsTotalNotes,
        insightsBullet1,
        insightsBullet2,
        insightsBullet3,
        insightsRegisterButtonText,
        pillarsSectionBadge,
        pillarsSectionTitle,
        pillarsSectionSubtitle,
        pillar1Title,
        pillar1Badge,
        pillar1Description,
        pillar2Title,
        pillar2Badge,
        pillar2Description,
        pillar3Title,
        pillar3Badge,
        pillar3Description,
        mentorExperience,
        mentorGuidance,
        heroBadgeText,
        announcementBadge,
        marqueeNotice2,
        marqueeNotice3,
        marqueeNotice4,
        marqueeNotice5,
        facebookUrl,
        youtubeUrl,
        telegramUrl,
        whatsappNumber,
        helplineTime,
        labSectionBadge,
        labSectionTitle,
        labSectionSubtitle,
        heroBanners
      } = req.body || {};

      let finalAcademyLogoUrl = academyLogoUrl || "";
      if (typeof academyLogoUrl === 'string' && academyLogoUrl.startsWith('data:')) {
        const fileName = `academy_logo_${Date.now()}.jpg`;
        let uploadedUrl = await uploadToSupabaseStorage('course-images', fileName, academyLogoUrl, 'image/jpeg');
        if (!uploadedUrl) {
          const cleanBase64 = academyLogoUrl.split(';base64,')[1] || academyLogoUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalAcademyLogoUrl = uploadedUrl;
        }
      }

      let finalAdminPhotoUrl = adminPhotoUrl || "";
      if (typeof adminPhotoUrl === 'string' && adminPhotoUrl.startsWith('data:')) {
        const fileName = `admin_photo_${Date.now()}.jpg`;
        let uploadedUrl = await uploadToSupabaseStorage('course-images', fileName, adminPhotoUrl, 'image/jpeg');
        if (!uploadedUrl) {
          const cleanBase64 = adminPhotoUrl.split(';base64,')[1] || adminPhotoUrl;
          const buffer = Buffer.from(cleanBase64, 'base64');
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          uploadedUrl = `/uploads/${fileName}`;
        }
        if (uploadedUrl) {
          finalAdminPhotoUrl = uploadedUrl;
        }
      }

      const db = readDB();
      db.settings = {
        academyName: (academyName && String(academyName).trim()) || db.settings?.academyName || "SCIENCE STUDIO by Sakib",
        announcement: announcement !== undefined ? String(announcement) : (db.settings?.announcement || "ADMISSIONS NOW OPEN FOR ACADEMIC YEAR 2026"),
        heroTitle: (heroTitle && String(heroTitle).trim()) || db.settings?.heroTitle || "Empower Your Mind in the Science Studio by Sakib",
        heroSubtitle: heroSubtitle !== undefined ? String(heroSubtitle) : (db.settings?.heroSubtitle || ""),
        heroSubEnglish: heroSubEnglish !== undefined ? String(heroSubEnglish) : (db.settings?.heroSubEnglish || ""),
        subjects: Array.isArray(subjects) ? subjects : (db.settings?.subjects || ["Physics", "Chemistry", "Biology", "Mathematics", "General Science"]),
        classLevels: Array.isArray(classLevels) ? classLevels : (db.settings?.classLevels || ["HSC", "HSC 1st Year", "HSC 2nd Year", "Class 9-10 (SSC)", "Class 10", "Class 9", "Class 8", "Admission Test"]),
        courseDurations: Array.isArray(courseDurations) ? courseDurations : (db.settings?.courseDurations || ["০৬ মাস (২৪টি লাইভ ক্লাস)", "১২ মাস (ফুল একাডেমিক কোর্স)", "০৩ মাস (ক্র্যাশ কোর্স)", "১৫ দিন (স্পেশাল রিভিশন)"]),
        defaultCourseFeatures: Array.isArray(defaultCourseFeatures) ? defaultCourseFeatures : (db.settings?.defaultCourseFeatures || [
          "রেকর্ডেড ও লাইভ ভিডিও ক্লাস",
          "অধ্যায়ভিত্তিক এইচডি পিডিএফ লেকচার শিট",
          "সাপ্তাহিক অনলাইন প্র্যাকটিস কুইজ ও এক্সাম",
          "২৪/৭ ডাউট সলভিং ও মেন্টর সাপোর্ট"
        ]),
        contactPhone: contactPhone !== undefined ? String(contactPhone) : (db.settings?.contactPhone || ""),
        contactEmail: contactEmail !== undefined ? String(contactEmail) : (db.settings?.contactEmail || ""),
        contactAddress: contactAddress !== undefined ? String(contactAddress) : (db.settings?.contactAddress || ""),
        footerDescription: footerDescription !== undefined ? String(footerDescription) : (db.settings?.footerDescription || ""),
        routine: Array.isArray(routine) ? routine : (db.settings?.routine || []),
        academyLogoUrl: finalAcademyLogoUrl || db.settings?.academyLogoUrl || "",
        adminName: adminName !== undefined ? String(adminName) : (db.settings?.adminName || ""),
        adminBio: adminBio !== undefined ? String(adminBio) : (db.settings?.adminBio || ""),
        adminPhotoUrl: finalAdminPhotoUrl || db.settings?.adminPhotoUrl || "",
        adminDesignation: adminDesignation !== undefined ? String(adminDesignation) : (db.settings?.adminDesignation || ""),
        adminEducation: adminEducation !== undefined ? String(adminEducation) : (db.settings?.adminEducation || ""),
        bkashNumber: bkashNumber !== undefined ? String(bkashNumber) : (db.settings?.bkashNumber || "+৮৮০ ১৭০০-০০০০০০"),
        nagadNumber: nagadNumber !== undefined ? String(nagadNumber) : (db.settings?.nagadNumber || "+৮৮০ ১৭০০-০০০০০০"),
        rocketNumber: rocketNumber !== undefined ? String(rocketNumber) : (db.settings?.rocketNumber || "+৮৮০ ১৭০০-০০০০০০"),
        paymentInstructions: paymentInstructions !== undefined ? String(paymentInstructions) : (db.settings?.paymentInstructions || ""),
        heroJoinButtonText: heroJoinButtonText !== undefined ? String(heroJoinButtonText) : (db.settings?.heroJoinButtonText || "ভর্তি হন / রেজিস্ট্রেশন করুন"),
        heroExploreButtonText: heroExploreButtonText !== undefined ? String(heroExploreButtonText) : (db.settings?.heroExploreButtonText || "এক্সপ্লোর ফিচার"),
        orbitSectionBadge: orbitSectionBadge !== undefined ? String(orbitSectionBadge) : (db.settings?.orbitSectionBadge || "ACADEMY SHOWCASE & INTERACTIVE ORBIT"),
        orbitSectionTitle: orbitSectionTitle !== undefined ? String(orbitSectionTitle) : (db.settings?.orbitSectionTitle || "সাকিব স্যারের পাবলিশড কোর্সসমূহ ও একাডেমি ইকোসিস্টেম"),
        orbitSectionSubtitle: orbitSectionSubtitle !== undefined ? String(orbitSectionSubtitle) : (db.settings?.orbitSectionSubtitle || "বিজ্ঞানকে ভিজ্যুয়াল ল্যাব ও আধুনিক প্রযুক্তির মাধ্যমে অনুধাবন করো। নিচে ইনসাইটস, ইন্টারেক্টিভ কোর্স অরবিট ও লাইভ কোর্স বিবরণী উপভোগ করো।"),
        orbitAutoRotate: orbitAutoRotate !== undefined ? Boolean(orbitAutoRotate) : (db.settings?.orbitAutoRotate ?? true),
        orbitSpeedSeconds: orbitSpeedSeconds !== undefined ? Number(orbitSpeedSeconds) : (db.settings?.orbitSpeedSeconds || 6),
        insightsTotalStudents: insightsTotalStudents !== undefined ? String(insightsTotalStudents) : (db.settings?.insightsTotalStudents || "১,৪৫০+"),
        insightsActivePercent: insightsActivePercent !== undefined ? String(insightsActivePercent) : (db.settings?.insightsActivePercent || "৯৮%"),
        insightsSuccessRate: insightsSuccessRate !== undefined ? String(insightsSuccessRate) : (db.settings?.insightsSuccessRate || "৯৯.২%"),
        insightsSuccessRateLabel: insightsSuccessRateLabel !== undefined ? String(insightsSuccessRateLabel) : (db.settings?.insightsSuccessRateLabel || "প্লাস পাওয়ার হার"),
        insightsTotalCourses: insightsTotalCourses !== undefined ? String(insightsTotalCourses) : (db.settings?.insightsTotalCourses || "১৪+"),
        insightsTotalNotes: insightsTotalNotes !== undefined ? String(insightsTotalNotes) : (db.settings?.insightsTotalNotes || "৩৫০+"),
        insightsBullet1: insightsBullet1 !== undefined ? String(insightsBullet1) : (db.settings?.insightsBullet1 || "সাকিব স্যারের নিজস্ব থ্রিডি ভিজ্যুয়াল ল্যাব সেশন"),
        insightsBullet2: insightsBullet2 !== undefined ? String(insightsBullet2) : (db.settings?.insightsBullet2 || "২৪/৭ অনলাইন ও অফলাইন স্পেশাল ডাউট সলভ"),
        insightsBullet3: insightsBullet3 !== undefined ? String(insightsBullet3) : (db.settings?.insightsBullet3 || "এইচএসসি ও অ্যাডমিশন ফোকাসড মডেল টেস্ট"),
        insightsRegisterButtonText: insightsRegisterButtonText !== undefined ? String(insightsRegisterButtonText) : (db.settings?.insightsRegisterButtonText || "ফ্রী রেজিস্ট্রেশন ও ক্লাস অ্যাক্সেস পান"),
        pillarsSectionBadge: pillarsSectionBadge !== undefined ? String(pillarsSectionBadge) : (db.settings?.pillarsSectionBadge || "LEADERSHIP & PEDAGOGY PILLARS"),
        pillarsSectionTitle: pillarsSectionTitle !== undefined ? String(pillarsSectionTitle) : (db.settings?.pillarsSectionTitle || "সাকিব স্যারের একাডেমি ও মেন্টরশিপের মূল স্তম্ভসমূহ"),
        pillarsSectionSubtitle: pillarsSectionSubtitle !== undefined ? String(pillarsSectionSubtitle) : (db.settings?.pillarsSectionSubtitle || "ব্যক্তিগত যত্ন, আধুনিক প্রযুক্তি এবং নিরবচ্ছিন্ন নির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীকে পৌঁছে দেওয়া হয় তাদের কাঙ্ক্ষিত সফলতায়।"),
        pillar1Title: pillar1Title !== undefined ? String(pillar1Title) : (db.settings?.pillar1Title || "ইন্টারেক্টিভ ভিডিও ও সিমুলেশন ক্লাস"),
        pillar1Badge: pillar1Badge !== undefined ? String(pillar1Badge) : (db.settings?.pillar1Badge || "3D LAB RECORDED"),
        pillar1Description: pillar1Description !== undefined ? String(pillar1Description) : (db.settings?.pillar1Description || "যেকোনো জটিল বৈজ্ঞানিক টপিক সহজে ভিজ্যুয়ালাইজ করার জন্য রয়েছে প্রিমিয়াম এইচডি ভিডিও ক্লাস, থ্রিডি অ্যানিমেশন ও লাইভ ল্যাব সেশনের আর্কাইভ।"),
        pillar2Title: pillar2Title !== undefined ? String(pillar2Title) : (db.settings?.pillar2Title || "অধ্যায়ভিত্তিক PDF নোট ও ফর্মুলা বুক"),
        pillar2Badge: pillar2Badge !== undefined ? String(pillar2Badge) : (db.settings?.pillar2Badge || "৩৫+ শিট"),
        pillar2Description: pillar2Description !== undefined ? String(pillar2Description) : (db.settings?.pillar2Description || "পরীক্ষার দ্রুত ও নির্ভুল রিভিশনের জন্য প্রতিটি অধ্যায়ের শেষে ডাউনলোডযোগ্য রঙিন হ্যান্ডরাইটিং শিট, শর্টকাট ট্রিকস ও প্র্যাকটিস বুকলেট।"),
        pillar3Title: pillar3Title !== undefined ? String(pillar3Title) : (db.settings?.pillar3Title || "২৪/৭ মেন্টর সাপোর্ট ও ডাউট সলভ ডেস্ক"),
        pillar3Badge: pillar3Badge !== undefined ? String(pillar3Badge) : (db.settings?.pillar3Badge || "LIVE ASSISTANCE"),
        pillar3Description: pillar3Description !== undefined ? String(pillar3Description) : (db.settings?.pillar3Description || "পড়ালেখার যেকোনো অস্পষ্টতায় সরাসরি প্রশ্ন করার সুযোগ, স্পেশাল প্রবলেম সলভিং সেশন এবং শিক্ষার্থীর পারফরম্যান্স ও অগ্রগতি ট্র্যাকিং।"),
        mentorExperience: mentorExperience !== undefined ? String(mentorExperience) : (db.settings?.mentorExperience || "১০+ বছরের অভিজ্ঞতা"),
        mentorGuidance: mentorGuidance !== undefined ? String(mentorGuidance) : (db.settings?.mentorGuidance || "১০০% পার্সোনাল গাইডেন্স"),
        heroBadgeText: heroBadgeText !== undefined ? String(heroBadgeText) : (db.settings?.heroBadgeText || "প্রযুক্তিনির্ভর আধুনিক বিজ্ঞান একাডেমি • SCIENCE STUDIO"),
        announcementBadge: announcementBadge !== undefined ? String(announcementBadge) : (db.settings?.announcementBadge || "নির্দেশনা ও নোটিশ"),
        marqueeNotice2: marqueeNotice2 !== undefined ? String(marqueeNotice2) : (db.settings?.marqueeNotice2 || ""),
        marqueeNotice3: marqueeNotice3 !== undefined ? String(marqueeNotice3) : (db.settings?.marqueeNotice3 || ""),
        marqueeNotice4: marqueeNotice4 !== undefined ? String(marqueeNotice4) : (db.settings?.marqueeNotice4 || ""),
        marqueeNotice5: marqueeNotice5 !== undefined ? String(marqueeNotice5) : (db.settings?.marqueeNotice5 || ""),
        facebookUrl: facebookUrl !== undefined ? String(facebookUrl) : (db.settings?.facebookUrl || ""),
        youtubeUrl: youtubeUrl !== undefined ? String(youtubeUrl) : (db.settings?.youtubeUrl || ""),
        telegramUrl: telegramUrl !== undefined ? String(telegramUrl) : (db.settings?.telegramUrl || ""),
        whatsappNumber: whatsappNumber !== undefined ? String(whatsappNumber) : (db.settings?.whatsappNumber || ""),
        helplineTime: helplineTime !== undefined ? String(helplineTime) : (db.settings?.helplineTime || ""),
        labSectionBadge: labSectionBadge !== undefined ? String(labSectionBadge) : (db.settings?.labSectionBadge || "INTERACTIVE VIRTUAL LAB & PLAYGROUND"),
        labSectionTitle: labSectionTitle !== undefined ? String(labSectionTitle) : (db.settings?.labSectionTitle || ""),
        labSectionSubtitle: labSectionSubtitle !== undefined ? String(labSectionSubtitle) : (db.settings?.labSectionSubtitle || ""),
        heroBanners: Array.isArray(heroBanners) ? heroBanners : (db.settings?.heroBanners || [])
      };

      // Keep logged in admin user name in sync
      const currentUser = (req as any).user;
      if (currentUser && adminName) {
        const userIndex = db.users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          db.users[userIndex].name = String(adminName).trim();
          await upsertUserToSupabase(db.users[userIndex]).catch(e => console.log('Admin user update notice:', e));
        }
      }

      writeDB(db);
      await syncToSupabase(db).catch(e => console.log('Settings sync notice:', e));

      res.json({ message: "Settings successfully updated.", settings: db.settings });
    } catch (err: any) {
      console.error("Update settings error:", err);
      res.status(500).json({ error: err?.message || "সেটিংস আপডেট করতে সমস্যা হয়েছে।" });
    }
  });

  // Admin: Update credentials (email and password)
  app.put('/api/admin/credentials', requireAdmin, async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({ error: "Email or password must be provided." });
    }

    const db = readDB();
    const currentUser = (req as any).user;
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    if (email) {
      const lowerEmail = email.toLowerCase();
      // Check if email already used by someone else
      const otherUser = db.users.find(u => u.email && u.email.toLowerCase() === lowerEmail && u.id !== currentUser.id);
      if (otherUser) {
        return res.status(400).json({ error: "This email is already in use by another user." });
      }
      db.users[userIndex].email = lowerEmail;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      db.users[userIndex].password = password;
    }

    writeDB(db);

    const { password: _, ...userWithoutPassword } = db.users[userIndex];
    res.json({
      message: "Credentials successfully updated.",
      user: userWithoutPassword
    });
  });


  // --- VITE DEV / PRODUCTION STATIC SERVER ---
async function startServer() {
  if (!process.env.VERCEL) {
    // Pre-create Supabase storage buckets asynchronously
    ensureSupabaseBucket('course-videos').catch(() => {});
    ensureSupabaseBucket('course-images').catch(() => {});
    ensureSupabaseBucket('pdf-materials').catch(() => {});

    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log("Starting in Development mode with Vite middleware.");
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log("Starting in Production mode, serving static build.");
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Science Studio server running at http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Server failed to start:", err);
  });
}

// Global Express Error Handler to prevent HTML error responses on Vercel
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Global API Error:", err);
  res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
});

export default app;
