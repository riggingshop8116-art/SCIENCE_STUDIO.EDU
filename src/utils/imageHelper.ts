export function compressImageFile(
  file: File, 
  maxWidth = 500, 
  maxHeight = 500, 
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      // If file doesn't have standard image type, still attempt to read as data URL
      const fallbackReader = new FileReader();
      fallbackReader.onload = () => resolve(fallbackReader.result as string);
      fallbackReader.onerror = () => reject(new Error('ফাইলটি সঠিক ইমেজ ফরম্যাটে নেই।'));
      fallbackReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width || 500;
          let height = img.height || 500;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to JPEG Data URL with quality compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        } catch (err) {
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        // Fallback directly to original data url if Image decoder fails
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('ছবি লোড করতে সমস্যা হয়েছে।'));
        }
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
