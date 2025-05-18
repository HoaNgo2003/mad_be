import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { PlantIdentifyService } from './plant-identify.service';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiConsumes,
    ApiBody,
  } from '@nestjs/swagger';
  
  @Controller('plant-identify')
  export class PlantIdentifyController {
    constructor(private readonly plantIdentifyService: PlantIdentifyService) {}
  
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Identify plant from image' })
    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    async identifyPlant(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
      }
  
      return this.plantIdentifyService.identify(file);
    }
  }
  