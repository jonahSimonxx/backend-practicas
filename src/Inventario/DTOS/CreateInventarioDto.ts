import { IsString, IsNumber, IsIn, IsOptional, Min, Length, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventarioDto {
  @ApiProperty({ 
    description: 'ID único del inventario', 
    example: 'INV-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'ID del recurso relacionado', 
    example: 'REC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  recursoId: string;

  @ApiProperty({ 
    description: 'ID del almacén relacionado', 
    example: 'ALM-001',
    required:true
  })
  @IsString()
  @Length(1, 20)
  almacenId: string;

  @ApiProperty({ 
    description: 'Número de lote', 
    example: 1001,
    required: true
  })
  @IsNumber()
  @Min(0)
  lote: number;

  @ApiProperty({ 
    description: 'Nombre del fabricante', 
    example: 'Fabricante XYZ',
    required: true
  })
  @IsString()
  @Length(1, 50)
  fabricante: string;

  @ApiProperty({ 
    description: 'Fecha de fabricación', 
    example: '2024-01-15T10:30:00Z',
    required: true
  })
  @Type(() => Date)
  @IsDate()
  fechaFabricacion: Date;

  @ApiProperty({ 
    description: 'Fecha de caducidad (opcional)', 
    example: '2025-01-15T10:30:00Z',
    required: true
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fechaCaducidad?: Date;

  @ApiProperty({ 
    description: 'Cantidad disponible', 
    example: 1000.50,
    required: true
  })
  @IsNumber()
  @Min(0)
  cantidadDisponible: number;

  @ApiProperty({ 
    description: 'Estado del inventario', 
    enum: ['disponible', 'resarvado'],
    default: 'disponible',
    required: true
  })
  @IsString()
  @IsIn(['disponible', 'resarvado']) 
  @IsOptional()
  estado?: string = 'disponible';
}