import { PartialType } from '@nestjs/swagger';
import { CreateDemandaDto } from './CreateDemandaDto';
import { IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDemandaDto extends PartialType(CreateDemandaDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'DEM-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo tipo de demanda', 
    enum: ['estática', 'dinámica'],
    required: false
  })
  @IsString()
  @IsIn(['estática', 'dinámica'])
  @IsOptional()
  tipoDemanda?: string;

  @ApiProperty({ 
    description: 'Nuevo periodo', 
    enum: ['mensual', 'trimestral', 'anual'],
    required: false
  })
  @IsString()
  @IsIn(['mensual', 'trimestral', 'anual'])
  @IsOptional()
  periodo?: string;

  @ApiProperty({ 
    description: 'Nueva cantidad requerida', 
    example: 1500.75,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadRequerida?: number;
}