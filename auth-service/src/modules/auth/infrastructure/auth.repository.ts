import { Injectable, Inject } from '@nestjs/common';
import { IAuthRepository } from '../domain/auth.repository';
import { User } from '../domain/user.entity';
import { IPrismaClient } from '@/common/interfaces/prisma-client.interface';
import { AuthMapper } from './auth.mapper';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @Inject('IPrismaClient') private readonly prisma: IPrismaClient,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!rawUser) {
      return null;
    }
    return AuthMapper.fromPrisma(rawUser);
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const rawUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password,
      },
    });
    return AuthMapper.fromPrisma(rawUser);
  }
}
