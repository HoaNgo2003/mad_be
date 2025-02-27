import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('upload') // Swagger Tag
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Ensure this folder exists
        filename: (req, file, cb) => {
          const uniqueFilename = `${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueFilename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return this.uploadService.saveFile(file);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a file' })
  @ApiQuery({
    name: 'filename',
    required: true,
    description: 'Name of the file to delete',
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Query('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required.');
    }
    return this.uploadService.deleteFile(filename);
  }
}
