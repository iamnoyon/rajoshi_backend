import { UploadService } from './upload.service';
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
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
