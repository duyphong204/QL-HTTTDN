import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private extractPublicIdFromUrl(imageUrl: string): string | null {
    try {
      const parsed = new URL(imageUrl);
      // Typical shape: /.../upload/v1234567890/products/filename.ext
      const match = parsed.pathname.match(
        /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/,
      );
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Chỉ hỗ trợ upload file hình ảnh');
    }

    if (file.path) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: 'products',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return uploaded.secure_url;
    }

    if (!file.buffer) {
      throw new BadRequestException('Không đọc được dữ liệu ảnh upload');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            return reject(new Error(error.message));
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  }
}
