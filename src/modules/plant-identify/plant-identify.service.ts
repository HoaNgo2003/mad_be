import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class PlantIdentifyService {
  async identify(file: Express.Multer.File): Promise<any> {
    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await axios.post('http://localhost:5000/predict', form, {
        headers: form.getHeaders(),
      });

      return response.data; // Kết quả từ AI
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('AI service unavailable');
    }
  }
}
