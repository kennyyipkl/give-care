/**
 * Get the image source URL for a photo.
 * If the photo has `image_data` (base64), use it directly.
 * Otherwise fall back to the API file path.
 */
export function getImageSrc(filename: string, imageData?: string | null): string {
  if (imageData) {
    // If it already has the data: prefix, use as-is
    if (imageData.startsWith("data:")) {
      return imageData;
    }
    return `data:image/jpeg;base64,${imageData}`;
  }
  return `/api/uploads/${filename}`;
}