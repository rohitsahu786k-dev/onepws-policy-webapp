import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
});

export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string,
  resourceType: 'image' | 'auto' = 'image'
): Promise<{ secure_url: string; public_id: string }> {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `onepws/${folder}`,
          resource_type: resourceType,
          public_id: filename.replace(/\.[^/.]+$/, ''),
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            secure_url: result?.secure_url || '',
            public_id: result?.public_id || '',
          });
        }
      );
      stream.end(file);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}

export function getCloudinaryUrl(publicId: string, options?: Record<string, string | number>): string {
  const url = cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
  return url;
}
