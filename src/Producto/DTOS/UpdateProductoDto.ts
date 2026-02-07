import { PartialType } from '@nestjs/swagger';
import { CreateProductoDto } from './CreateProductoDto';
import { IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'PROD-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo tipo de envase', 
    enum: ['primario', 'secundario', 'terciario'],
    required: true
  })
  @IsString()
  @IsIn(['primario', 'secundario', 'terciario'])
  @IsOptional()
  tipoEnvase?: string;

  @ApiProperty({ 
    description: 'Nuevo tipo de producto', 
    enum: ['directo', 'indirecto'],
    required: false
  })
  @IsString()
  @IsIn(['directo', 'indirecto'])
  @IsOptional()
  tipoProducto?: string;
}