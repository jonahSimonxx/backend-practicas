import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstrategiaDto {
  @ApiProperty({ description: 'Nombre de la estrategia', example: 'Estrategia Navidad 2024' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Descripción de la estrategia', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Presupuesto máximo disponible', example: 50000 })
  @IsNumber()
  @Min(0)
  presupuestoMaximo: number;

  @ApiProperty({ 
    description: 'Estado de la estrategia', 
    enum: ['activa', 'inactiva', 'pendiente'],
    default: 'activa'
  })
  @IsString()
  @IsIn(['activa', 'inactiva', 'pendiente'])
  @IsOptional()
  estado?: string;
}