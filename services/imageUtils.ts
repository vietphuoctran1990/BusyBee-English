
// Resize/compress a base64 image to reduce IndexedDB and network usage.
// Returns the new base64 string WITHOUT the "data:image/...;base64," prefix.
export async function compressBase64Image(
  base64: string,
  maxSize = 384,
  quality = 0.82,
): Promise<string> {
  if (!base64) return base64;
  const dataUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  try {
    const img = await loadImage(dataUrl);
    const w0 = img.naturalWidth || img.width;
    const h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) return base64;

    const scale = Math.min(1, maxSize / Math.max(w0, h0));
    const w = Math.round(w0 * scale);
    const h = Math.round(h0 * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return base64;
    ctx.drawImage(img, 0, 0, w, h);

    // WebP is much smaller; fall back to JPEG if not supported
    const outUrl = canvas.toDataURL('image/webp', quality);
    const usable = outUrl.startsWith('data:image/webp') ? outUrl : canvas.toDataURL('image/jpeg', quality);
    const comma = usable.indexOf(',');
    return comma >= 0 ? usable.slice(comma + 1) : base64;
  } catch {
    return base64;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Detect MIME type from base64 data URL or raw base64
export function detectImageMime(base64: string): string {
  if (base64.startsWith('data:')) {
    const m = base64.match(/^data:([^;]+)/);
    return m ? m[1] : 'image/png';
  }
  // Sniff first bytes of the binary header
  if (base64.startsWith('iVBORw')) return 'image/png';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/png';
}
