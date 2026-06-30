import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../../entities/user.entity';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private userRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>);
    validate(req: Request, payload: {
        sub: string;
    }): Promise<{
        id: string;
        email: string;
        role: import("../../entities/user.entity").UserRole;
    }>;
}
export {};
