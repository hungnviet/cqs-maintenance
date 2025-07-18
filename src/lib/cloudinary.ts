import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File | Blob, fileName: string): Promise<string> {
  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString('base64');
  const mimeType = (file as File).type || 'image/jpeg';

  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64Image}`,
    {
      public_id: fileName,
      resource_type: 'auto',
    }
  );
  return result.secure_url;
}