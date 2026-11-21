import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 100)
  displayName!: string;

  @IsString()
  @Length(12, 128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'password must include uppercase, lowercase, and a number' })
  password!: string;
}
