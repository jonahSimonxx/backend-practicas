import { PartialType } from '@nestjs/swagger';
import { CreateDetalleCalculoRecursoDto } from './CreateDetalleCalculoRecursoDto';
import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDetalleCalculoRecursoDto extends PartialType(CreateDetalleCalculoRecursoDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'DET-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nueva cantidad requerida total', 
    example: 550.50,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadRequeridaTotal?: number;

  @ApiProperty({ 
    description: 'Nueva cantidad disponible total', 
    example: 500.00,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadDisponibleTotal?: number;

  @ApiProperty({ 
    description: 'Nuevo estado de satisfacción', 
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  esSatisfacible?: boolean;
}