import { User } from './user.entity';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(data: { email: string; password: string }): Promise<User>;
}