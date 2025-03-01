import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadFolder = './uploads';
  private readonly BASE_URL = `http://localhost:${process.env.PORT}`;
  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new Error('No file provided');
    }
    const fileUrl = `${this.BASE_URL}/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }
    const fileUrls = files.map(
      (file) => `${this.BASE_URL}/uploads/${file.filename}`,
    );
    return { urls: fileUrls };
  }
}
