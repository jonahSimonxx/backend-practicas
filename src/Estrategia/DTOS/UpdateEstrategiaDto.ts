import { PartialType } from '@nestjs/swagger';
import { CreateEstrategiaDto } from './CreateEstrategiaDto';
import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstrategiaDto extends PartialType(CreateEstrategiaDto) {
  @ApiProperty({ 
    description: 'Resultado del cálculo', 
    enum: ['posible', 'imposible', 'sin calcular'],
    required: false
  })
  @IsString()
  @IsIn(['posible', 'imposible', 'sin calcular'])
  @IsOptional()
  resultadoCalculo?: string | null;

  @ApiProperty({ 
    description: 'Nuevo presupuesto máximo', 
    example: 60000,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  presupuestoMaximo?: number;

  @ApiProperty({ 
    description: 'Nuevo estado', 
    enum: ['activa', 'inactiva'],
    required: false
  })
  @IsString()
  @IsIn(['activa', 'inactiva'])
  @IsOptional()
  estado?: string;
}