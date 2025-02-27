import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(__dirname, '..', '..', 'uploads');

  async saveFile(file: Express.Multer.File) {
    const filePath = path.join(this.uploadPath, file.filename);

    // Ensure the uploads folder exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    // Move the file instead of writing from buffer
    fs.renameSync(file.path, filePath);

    return {
      message: 'File uploaded successfully',
      fileUrl: `http://localhost:3000/uploads/${file.filename}`,
    };
  }

  async deleteFile(filename: string) {
    const filePath = path.join(this.uploadPath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { message: 'File deleted successfully' };
    }

    return { message: 'File not found', error: true };
  }
}
