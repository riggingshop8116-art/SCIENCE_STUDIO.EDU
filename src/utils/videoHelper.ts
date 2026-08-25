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

