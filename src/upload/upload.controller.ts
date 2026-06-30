import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@Roles(UserRole.ADMIN)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('single')
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload single image (Admin)' })
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    console.log(`[Upload Controller] POST /upload/single - file: ${file?.originalname}`);
    return this.uploadService.uploadSingle(file);
  }

  @Post('multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple images (Admin)' })
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(`[Upload Controller] POST /upload/multiple - files: ${files?.length}`);
    return this.uploadService.uploadMultiple(files);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete image by public ID (Admin)' })
  deleteImage(@Body('publicId') publicId: string) {
    return this.uploadService.deleteImage(publicId);
  }
}
