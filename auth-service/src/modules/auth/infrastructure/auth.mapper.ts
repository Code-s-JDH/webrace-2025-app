import { User } from '../domain/user.entity';
import { User as PrismaUser } from '@prisma/client';

export class AuthMapper {
  static fromPrisma(data: PrismaUser): User {
    return new User(
      data.id,
      data.email,
      data.password_hash,
    );
  }

  static fromPrismaMany(data: PrismaUser[]): User[] {
    return data.map(AuthMapper.fromPrisma);
  }

  static toPrisma(entity: User): PrismaUser {
    return {
      id: entity.id,
      email: entity.email,
      password_hash: entity.password,
    };
  }
}
