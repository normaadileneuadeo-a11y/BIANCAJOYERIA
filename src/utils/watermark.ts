/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Applies the official Bianca Atondo Joyería watermark onto an image File or DataURL.
 * Scales proportionally and bakes the emblem and typography directly into the pixels.
 */
export async function applyWatermarkToImage(fileOrUrl: File | string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Max size normalization to keep storage efficient in localStorage
      let width = img.width;
      let height = img.height;
      const MAX_DIM = 1000;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw base image
      ctx.drawImage(img, 0, 0, width, height);

      // Watermark scale
      const scale = Math.max(0.65, Math.min(1.4, width / 650));

      // Watermark badge dimensions
      const badgeW = Math.round(230 * scale);
      const badgeH = Math.round(48 * scale);
      const padding = Math.round(16 * scale);
      const x = width - badgeW - padding;
      const y = height - badgeH - padding;

      ctx.save();
      // Translucent luxury dark capsule
      ctx.fillStyle = 'rgba(38, 22, 35, 0.78)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 8 * scale;

      // Rounded rectangle
      const radius = badgeH / 2;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.arc(x + badgeW - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      // Gold border
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = 'rgba(215, 182, 111, 0.85)';
      ctx.stroke();

      // Circular white badge with gold B monogram
      const iconX = x + radius;
      const iconY = y + radius;
      ctx.beginPath();
      ctx.arc(iconX, iconY, 15 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1 * scale;
      ctx.strokeStyle = '#c49a50';
      ctx.stroke();

      ctx.fillStyle = '#b58a42';
      ctx.font = `bold ${Math.round(16 * scale)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('B', iconX, iconY + 0.5 * scale);

      // Text block
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(10.5 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText('BIANCA ATONDO', iconX + 22 * scale, y + 20 * scale);

      // Subtitle
      ctx.fillStyle = '#f4b8d7';
      ctx.font = `600 ${Math.round(8 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText('JOYERÍA · PIEZA OFICIAL', iconX + 22 * scale, y + 34 * scale);

      ctx.restore();

      // Return high-quality compressed JPEG
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrUrl);
    }
  });
}
