import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly uploadDir;
    private readonly port;
    constructor(configService: ConfigService);
    uploadSingle(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadMultiple(files: Express.Multer.File[]): Promise<{
        url: string;
        publicId: string;
    }[]>;
    deleteImage(publicId: string): Promise<{
        message: string;
    }>;
}
