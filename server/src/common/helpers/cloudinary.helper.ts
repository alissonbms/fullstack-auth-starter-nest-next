const extractPublicId = (imageUrl: string): string | null => {
  const parts = imageUrl.split("/upload/");
  if (parts.length < 2) return null;

  let publicId = parts[1].split(".")[0];
  publicId = publicId.replace(/v\d+\//, "");

  return publicId;
};

export default extractPublicId;
