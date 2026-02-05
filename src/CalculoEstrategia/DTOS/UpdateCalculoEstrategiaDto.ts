import { PartialType } from '@nestjs/swagger';
import { CreateCalculoEstrategiaDto } from './CreateCalculoEstrategiaDto';
import { IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCalculoEstrategiaDto extends PartialType(CreateCalculoEstrategiaDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'CALC-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo resultado general', 
    enum: ['satisfactorio', 'parcial'],
    required: false
  })
  @IsString()
  @IsIn(['satisfactorio', 'parcial'])
  @IsOptional()
  resultadoGeneral?: string;

  @ApiProperty({ 
    description: 'Nuevo presupuesto utilizado', 
    example: 38000.00,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  presupuestoUtilizado?: number;

  @ApiProperty({ 
    description: 'Nuevo presupuesto disponible', 
    example: 12000.00,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  presupuestoDisponible?: number;

  @ApiProperty({ 
    description: 'Nuevas observaciones', 
    example: 'Cálculo revisado y ajustado',
    required: false
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}