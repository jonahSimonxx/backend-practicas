import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Email del usuario', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: ['admin', 'user'],
    default: 'user',
    required: false,
  })
  @IsString()
  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: string;
}
