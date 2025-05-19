import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { PlantService } from '../plant/plant.service';

@Injectable()
export class PlantIdentifyService {
  constructor(private readonly plantService: PlantService) {}

  async identify(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      // Gửi ảnh đến Flask AI Service
      const response = await axios.post('http://localhost:5000/predict', form, {
        headers: form.getHeaders(),
      });

      const aiResult = response.data;

      // Nếu AI không nhận diện được thì trả lại kết quả đơn giản
      if (aiResult.class_name === 'unknown') {
        return aiResult;
      }

      // Tìm cây trong DB theo class_name (tên tiếng Việt)
      const plantInfo = await this.plantService.getPlantByName(aiResult.class_name);

      // Nếu không tìm thấy cây trong hệ thống
      if (!plantInfo) {
        return {
          ...aiResult,
          plant_info: null,
          message: 'Thông tin cây chưa được cập nhật trong hệ thống',
        };
      }

      return {
        ...aiResult,
        plant_info: plantInfo,
      };
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('AI service unavailable');
    }
  }
}
