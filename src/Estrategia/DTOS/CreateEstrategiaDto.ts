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
    enum: ['activo', 'inactivo'], 
    default: 'activo',
    required: true
  })
  @IsString()
  @IsIn(['activo', 'inactivo']) 
  @IsOptional()
  estado?: string;

  @ApiProperty({ 
    description: 'Resultado del cálculo inicial', 
    enum: ['posible', 'imposible'], 
    required: true
  })
  @IsString()
  @IsIn(['posible', 'imposible'])
  @IsOptional()
  resultadoCalculo?: string | null;
}