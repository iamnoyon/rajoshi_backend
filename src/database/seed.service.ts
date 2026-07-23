import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';
    const adminName = this.configService.get<string>('ADMIN_NAME') || 'Admin';

    const existing = await this.userRepository.findOne({
      where: { email: adminEmail.toLowerCase() },
    });
    if (existing) {
      this.logger.log('Admin user already exists, skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = this.userRepository.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    await this.userRepository.save(admin);
    this.logger.log(`Admin user created: ${adminEmail}`);
  }
}
