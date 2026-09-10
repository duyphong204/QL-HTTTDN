import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';

export interface UploadedImageFile {
  buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
  private hasCloudinaryConfig(): boolean {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
    );
  }

  private async toDataUrl(file: Express.Multer.File): Promise<string> {
    if (file.buffer) {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    if (file.path) {
      const data = await readFile(file.path);
      return `data:${file.mimetype};base64,${data.toString('base64')}`;
    }

    throw new BadRequestException('Không đọc được dữ liệu ảnh upload');
  }

  private extractPublicIdFromUrl(imageUrl: string): string | null {
    try {
      const parts = imageUrl.split('/');
      const uploadIndex = parts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1) return null;

      const remainingParts = parts.slice(uploadIndex + 1);
      if (remainingParts[0].startsWith('v')) {
        remainingParts.shift();
      }

      const publicIdWithExtension = remainingParts.join('/');
      return publicIdWithExtension.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Chỉ hỗ trợ upload file hình ảnh');
    }

    // Fallback mode when Cloudinary env vars are missing.
    if (!this.hasCloudinaryConfig()) {
      return this.toDataUrl(file);
    }

    if (file.path) {
      try {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: 'products',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        });
        return uploaded.secure_url;
      } catch {
        return this.toDataUrl(file);
      }
    }

    if (!file.buffer) {
      throw new BadRequestException('Không đọc được dữ liệu ảnh upload');
    }

    const uploadPromise: Promise<string> = new Promise((resolve, reject) => {
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

    return uploadPromise.catch(async () => this.toDataUrl(file));
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      return;
    }

    const publicId = this.extractPublicIdFromUrl(imageUrl);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  }
}
