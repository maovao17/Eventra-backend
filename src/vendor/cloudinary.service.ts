import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class CloudinaryService {
  private readonly configured: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.configured = Boolean(cloudName && apiKey && apiSecret &&
      cloudName !== 'your_cloud_name');

    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      console.log('✅ Cloudinary configured — uploads go to cloud storage');
    } else {
      console.warn('⚠️  Cloudinary not configured — falling back to local disk storage');
    }
  }

  async uploadBuffer(buffer: Buffer, folder = 'eventra', filename?: string): Promise<string> {
    if (this.configured) {
      return this.uploadToCloudinary(buffer, folder, filename);
    }
    return this.saveToDisk(buffer, filename);
  }

  private uploadToCloudinary(buffer: Buffer, folder: string, filename?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: filename, resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerErrorException(error?.message || 'Cloudinary upload failed'));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  }

  private saveToDisk(buffer: Buffer, filename?: string): string {
    const dir = join(process.cwd(), 'uploads');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const name = `${filename || randomUUID()}.jpg`;
    writeFileSync(join(dir, name), buffer);
    return `/uploads/${name}`;
  }
}
