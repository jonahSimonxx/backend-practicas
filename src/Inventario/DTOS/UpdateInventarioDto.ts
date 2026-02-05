import { PartialType } from '@nestjs/swagger';
import { CreateInventarioDto } from './CreateInventarioDto';
import { IsString, IsIn, IsOptional, IsNumber, Min, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateInventarioDto extends PartialType(CreateInventarioDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'INV-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo estado', 
    enum: ['disponible', 'resarvado'],
    required: false
  })
  @IsString()
  @IsIn(['disponible', 'resarvado'])
  @IsOptional()
  estado?: string;

  @ApiProperty({ 
    description: 'Nueva cantidad disponible', 
    example: 800.25,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadDisponible?: number;

  @ApiProperty({ 
    description: 'Nueva fecha de caducidad', 
    example: '2025-06-15T10:30:00Z',
    required: false
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fechaCaducidad?: Date;
}