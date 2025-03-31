import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email je povinný' })
  @IsEmail({}, { message: 'Email musí být platný' })
  email: string;

  @IsNotEmpty({ message: 'Heslo je povinné' })
  @IsString({ message: 'Heslo musí být text' })
  password: string;
}
