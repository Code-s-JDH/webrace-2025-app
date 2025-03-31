import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Uživatelské jméno je povinné' })
  @IsString({ message: 'Uživatelské jméno musí být text' })
  username: string;

  @IsNotEmpty({ message: 'Email je povinný' })
  @IsEmail({}, { message: 'Email musí být platný' })
  email: string;

  @IsNotEmpty({ message: 'Heslo je povinné' })
  @IsString({ message: 'Heslo musí být text' })
  @MinLength(6, { message: 'Heslo musí mít alespoň 6 znaků' })
  password: string;
}
