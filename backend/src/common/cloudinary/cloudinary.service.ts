import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private extractPublicIdFromUrl(imageUrl: string): string | null {
    try {
      const parts = imageUrl.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;

      const remainingParts = parts.slice(uploadIndex + 1);
      if (remainingParts[0].startsWith('v')) {
        remainingParts.shift();
      }

      const publicIdWithExtension = remainingParts.join('/');
      return publicIdWithExtension.replace(/\.[^/.]+$/, "");
    } catch {
      return null;
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new Error(error.message));
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(imageUrl);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  }
}