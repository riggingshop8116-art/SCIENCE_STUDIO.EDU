export function downloadPdfFile(pdfUrl: string, title: string) {
  if (!pdfUrl) return;

  const safeFileName = (title || 'Science_Studio_Lecture_Note')
    .replace(/[^a-zA-Z0-9\u0980-\u09FF\s_-]/g, '')
    .trim() + '.pdf';

  // 1. Google Drive URLs
  if (pdfUrl.includes('drive.google.com')) {
    let directUrl = pdfUrl;
    if (pdfUrl.includes('/file/d/')) {
      const fileId = pdfUrl.split('/file/d/')[1]?.split('/')[0];
      if (fileId) {
        directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    window.open(directUrl, '_blank');
    return;
  }

  // 2. Base64 Data URL (data:application/pdf;base64,...)
  if (pdfUrl.startsWith('data:')) {
    try {
      const parts = pdfUrl.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/pdf';
      const raw = window.atob(parts[1] || parts[0]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    } catch (e) {
      console.error('Error downloading base64 PDF:', e);
    }
  }

  // 3. Blob URLs
  if (pdfUrl.startsWith('blob:')) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 4. Regular HTTP/HTTPS URLs -> try fetch blob download first, fallback to window.open or link
  fetch(pdfUrl)
    .then((res) => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    })
    .catch(() => {
      // Fallback: direct download link / open in new tab
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.download = safeFileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

export function openPdfInBrowser(pdfUrl: string) {
  if (!pdfUrl) return;

  // 1. Google Drive URLs
  if (pdfUrl.includes('drive.google.com')) {
    let viewUrl = pdfUrl;
    if (pdfUrl.includes('/file/d/')) {
      const fileId = pdfUrl.split('/file/d/')[1]?.split('/')[0];
      if (fileId) {
        viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    window.open(viewUrl, '_blank');
    return;
  }

  // 2. Base64 Data URL -> create object URL blob so Chrome/Firefox allows opening in new window
  if (pdfUrl.startsWith('data:')) {
    try {
      const parts = pdfUrl.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/pdf';
      const raw = window.atob(parts[1] || parts[0]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return;
    } catch (e) {
      console.error('Error opening base64 PDF:', e);
    }
  }

  // Regular URL or Blob URL
  window.open(pdfUrl, '_blank');
}
