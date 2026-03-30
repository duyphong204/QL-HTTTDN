export const getCloudinaryThumbnailUrl = (
  imageUrl: string | null | undefined,
  width = 300,
  height = 300,
): string => {
  if (!imageUrl) {
    return '';
  }

  const marker = '/upload/';
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return imageUrl;
  }

  const transform = `w_${width},h_${height},c_fill`;
  return `${imageUrl.slice(0, index + marker.length)}${transform}/${imageUrl.slice(index + marker.length)}`;
};
