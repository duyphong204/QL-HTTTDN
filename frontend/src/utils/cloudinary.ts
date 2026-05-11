export const getCloudinaryThumbnailUrl = (
  imageUrl: string | null | undefined,
  width = 300,
  height = 300,
): string => {
  if (!imageUrl) {
    return "";
  }

  // Only transform Cloudinary URLs. Other CDN URLs may break if we inject /upload transforms.
  const isCloudinaryUrl = imageUrl.includes("res.cloudinary.com");
  if (!isCloudinaryUrl) {
    return imageUrl;
  }

  const marker = "/upload/";
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return imageUrl;
  }

  const transform = `w_${width},h_${height},c_fill`;
  return `${imageUrl.slice(0, index + marker.length)}${transform}/${imageUrl.slice(index + marker.length)}`;
};
