import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract public_id from URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const publicId = `products/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  }
}
