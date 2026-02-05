import { PartialType } from '@nestjs/swagger';
import { CreateRelacionProductoRecursoDto } from './CreateRelacionProductoRecursoDto';
import { IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRelacionProductoRecursoDto extends PartialType(CreateRelacionProductoRecursoDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'REL-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo tipo de relación', 
    enum: ['consumo', 'producción'],
    required: false
  })
  @IsString()
  @IsIn(['consumo', 'producción'])
  @IsOptional()
  tipoRelacion?: string;

  @ApiProperty({ 
    description: 'Nueva cantidad requerida', 
    example: 3.0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadRequerida?: number;
}