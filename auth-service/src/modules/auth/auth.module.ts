import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './app/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './infrastructure/auth.repository';
import { PrismaModule } from '@/common/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: 'IAuthRepository', useClass: AuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
