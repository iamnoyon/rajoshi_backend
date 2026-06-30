import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly port: number;

  constructor(private configService: ConfigService) {
    this.port = this.configService.get<number>('port') || 5000;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadSingle(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `http://127.0.0.1:${this.port}/uploads/${filename}`,
      publicId: filename,
    };
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<{ url: string; publicId: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return Promise.all(files.map((file) => this.uploadSingle(file)));
  }

  async deleteImage(publicId: string): Promise<{ message: string }> {
    if (!publicId) {
      throw new BadRequestException('No public ID provided');
    }

    const filePath = path.join(this.uploadDir, publicId);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { message: 'Image deleted successfully' };
    } catch {
      throw new BadRequestException('Failed to delete image');
    }
  }
}
