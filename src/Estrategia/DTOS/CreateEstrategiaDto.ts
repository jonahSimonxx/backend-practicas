import { IsString, IsNumber, IsOptional, IsIn, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstrategiaDto {
  @ApiProperty({ 
    description: 'ID único de la estrategia', 
    example: 'EST-001',
    required: true
  })
  @IsString() 
  @Length(1, 20)
  id: string; 

  @ApiProperty({ description: 'Nombre de la estrategia', example: 'Estrategia Navidad 2024', required: true })
  @IsString()
  @Length(1, 50)
  nombre: string;

  @ApiProperty({ description: 'Descripción de la estrategia', required: false })
  @IsString()
  @Length(1, 180)
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Presupuesto máximo disponible', example: 50000, required: true })
  @IsNumber()
  @Min(0)
  presupuestoMaximo: number;

  @ApiProperty({ 
    description: 'Estado de la estrategia', 
    enum: ['activa', 'inactiva'], 
    default: 'activa',
    required: true
  })
  @IsString()
  @IsIn(['activa', 'inactiva']) 
  @IsOptional()
  estado?: string;

  @ApiProperty({ 
    description: 'Resultado del cálculo inicial', 
    enum: ['posible', 'imposible', 'sin calcular'], 
    required: true
  })
  @IsString()
  @IsIn(['posible', 'imposible', 'sin calcular'])
  @IsOptional()
  resultadoCalculo?: string | null;
}