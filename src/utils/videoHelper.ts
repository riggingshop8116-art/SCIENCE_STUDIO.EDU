import physicsBanner from '../assets/images/hero_physics_quantum_lab_1787477039417.jpg';
import chemistryBanner from '../assets/images/hero_chemistry_molecular_hub_1787477057681.jpg';
import biologyBanner from '../assets/images/hero_biology_genetics_lab_1787477092542.jpg';
import mathBanner from '../assets/images/hero_mathematics_calculus_studio_1787477075299.jpg';
import generalScienceBanner from '../assets/images/science_3d_banner_1787479248876.jpg';

/**
 * Subject default banners mapping
 */
export const SUBJECT_FALLBACK_BANNERS: Record<string, string> = {
  Physics: physicsBanner,
  Chemistry: chemistryBanner,
  Biology: biologyBanner,
  Mathematics: mathBanner,
  'General Science': generalScienceBanner,
  'Higher Math': mathBanner,
  'পদার্থবিজ্ঞান': physicsBanner,
  'রসায়ন': chemistryBanner,
  'রসায়ন': chemistryBanner,
  'জীববিজ্ঞান': biologyBanner,
  'উচ্চতর গণিত': mathBanner,
  'গণিত': mathBanner,
  'সাধারণ বিজ্ঞান': generalScienceBanner
};

/**
 * Get default subject banner
 */
export function getDefaultSubjectBanner(subject?: string): string {
  if (!subject) return generalScienceBanner;
  const match = Object.keys(SUBJECT_FALLBACK_BANNERS).find(k => k.toLowerCase() === subject.trim().toLowerCase());
  return match ? SUBJECT_FALLBACK_BANNERS[match] : generalScienceBanner;
}

/**
 * Extract YouTube Video ID from any YouTube URL format
 */
export function extractYouTubeId(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  if (trimmed.includes('youtube.com/watch')) {
    const match = trimmed.match(/[?&]v=([^&#]+)/);
    if (match && match[1]) return match[1];
  }
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (id) return id;
  }
  if (trimmed.includes('youtube.com/embed/')) {
    const id = trimmed.split('embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (id) return id;
  }
  if (trimmed.includes('youtube-nocookie.com/embed/')) {
    const id = trimmed.split('embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (id) return id;
  }
  if (trimmed.includes('youtube.com/shorts/')) {
    const id = trimmed.split('shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (id) return id;
  }
  if (trimmed.includes('youtube.com/live/')) {
    const id = trimmed.split('live/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (id) return id;
  }
  return '';
}

/**
 * Get the best high-definition video banner URL for any class item
 */
export function getVideoBannerUrl(
  cls?: {
    thumbnailUrl?: string;
    videoUrl?: string;
    subject?: string;
    courseTitle?: string;
    courseId?: string;
  } | null,
  coursesList: Array<{ id: string; title: string; imageUrl?: string }> = []
): string {
  if (!cls) return generalScienceBanner;

  // 1. Explicit custom banner/thumbnail provided by admin or creator
  if (cls.thumbnailUrl && cls.thumbnailUrl.trim()) {
    return cls.thumbnailUrl.trim();
  }

  // 2. YouTube HD thumbnail
  if (cls.videoUrl) {
    const ytId = extractYouTubeId(cls.videoUrl);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  // 3. Parent Course Image
  if (cls.courseTitle || cls.courseId) {
    const parentCourse = coursesList.find(c => 
      (cls.courseId && c.id === cls.courseId) ||
      (cls.courseTitle && c.title.trim().toLowerCase() === cls.courseTitle.trim().toLowerCase())
    );
    if (parentCourse?.imageUrl && parentCourse.imageUrl.trim()) {
      return parentCourse.imageUrl.trim();
    }
  }

  // 4. Subject Fallback Banner
  return getDefaultSubjectBanner(cls.subject);
}

/**
 * Get the best high-definition banner URL for any note/PDF item
 */
export function getNoteBannerUrl(
  note?: {
    subject?: string;
    courseTitle?: string;
    courseId?: string;
    thumbnailUrl?: string;
  } | null,
  coursesList: Array<{ id: string; title: string; imageUrl?: string }> = []
): string {
  if (!note) return generalScienceBanner;

  // 1. Explicit thumbnail
  if (note.thumbnailUrl && note.thumbnailUrl.trim()) {
    return note.thumbnailUrl.trim();
  }

  // 2. Parent Course Image
  if (note.courseTitle || note.courseId) {
    const parentCourse = coursesList.find(c => 
      (note.courseId && c.id === note.courseId) ||
      (note.courseTitle && c.title.trim().toLowerCase() === note.courseTitle.trim().toLowerCase())
    );
    if (parentCourse?.imageUrl && parentCourse.imageUrl.trim()) {
      return parentCourse.imageUrl.trim();
    }
  }

  // 3. Subject Fallback Banner
  return getDefaultSubjectBanner(note.subject);
}

/**
 * Utility functions for video URL formatting and embed detection
 */

export function formatVideoEmbedUrl(url: string | undefined | null): string {
  if (!url) return '';
  let trimmed = String(url).trim();

  if (!trimmed) return '';

  // 1. If the user pasted a raw <iframe> embed snippet, extract the src attribute
  if (trimmed.includes('<iframe') || trimmed.includes('<IFRAME')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  // 2. YouTube URLs:
  // watch?v=ID or &v=ID
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const match = trimmed.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // youtu.be/ID
  if (trimmed.includes('youtu.be/')) {
    const videoId = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // youtube.com/shorts/ID
  if (trimmed.includes('youtube.com/shorts/')) {
    const videoId = trimmed.split('shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // youtube.com/live/ID
  if (trimmed.includes('youtube.com/live/')) {
    const videoId = trimmed.split('live/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // youtube.com/embed/ID or youtube-nocookie.com/embed/ID
  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
    return trimmed;
  }

  // 3. Google Drive URLs:
  // drive.google.com/file/d/FILE_ID/view or /preview
  if (trimmed.includes('drive.google.com/file/d/')) {
    const fileId = trimmed.split('file/d/')[1]?.split('/')[0]?.split('?')[0];
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // drive.google.com/open?id=FILE_ID or drive.google.com/uc?id=FILE_ID
  if (trimmed.includes('drive.google.com') && trimmed.includes('id=')) {
    const match = trimmed.match(/[?&]id=([^&#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  // docs.google.com/file/d/FILE_ID
  if (trimmed.includes('docs.google.com/file/d/')) {
    const fileId = trimmed.split('file/d/')[1]?.split('/')[0]?.split('?')[0];
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // 4. Vimeo video link: https://vimeo.com/123456
  if (trimmed.includes('vimeo.com/') && !trimmed.includes('player.vimeo.com')) {
    const match = trimmed.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) return `https://player.vimeo.com/video/${match[1]}`;
  }

  // 5. Loom embed
  if (trimmed.includes('loom.com/share/')) {
    const loomId = trimmed.split('loom.com/share/')[1]?.split('?')[0];
    if (loomId) return `https://www.loom.com/embed/${loomId}`;
  }

  // 6. Dailymotion embed
  if (trimmed.includes('dailymotion.com/video/')) {
    const dmId = trimmed.split('video/')[1]?.split('?')[0];
    if (dmId) return `https://www.dailymotion.com/embed/video/${dmId}`;
  }

  return trimmed;
}

export function isIframeVideoUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const formatted = formatVideoEmbedUrl(url);
  return (
    formatted.includes('youtube.com/embed/') ||
    formatted.includes('youtube-nocookie.com/embed/') ||
    formatted.includes('drive.google.com/file/d/') ||
    formatted.includes('player.vimeo.com/') ||
    formatted.includes('loom.com/embed/') ||
    formatted.includes('dailymotion.com/embed/') ||
    formatted.includes('facebook.com/plugins/video') ||
    formatted.includes('/embed/') ||
    formatted.includes('/preview')
  );
}

