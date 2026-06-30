import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
export declare class SeedService implements OnApplicationBootstrap {
    private userRepository;
    private configService;
    private readonly logger;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    onApplicationBootstrap(): Promise<void>;
    private seedAdmin;
}
