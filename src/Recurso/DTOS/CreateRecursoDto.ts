import { IsString, IsIn, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecursoDto {
  @ApiProperty({ 
    description: 'ID único del recurso', 
    example: 'REC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'Código del recurso', 
    example: 'MP-001'
  })
  @IsString()
  @Length(1, 20)
  codigo: string;

  @ApiProperty({ 
    description: 'Nombre del recurso', 
    example: 'Ácido acético',
    required: true
  })
  @IsString()
  @Length(1, 50)
  nombre: string;

  @ApiProperty({ 
    description: 'Tipo de recurso', 
    enum: ['materia prima', 'insumo'],
    required: true,
    example: 'materia prima'
  })
  @IsString()
  @IsIn(['materia prima', 'insumo']) 
  tipoRecurso: string;

  @ApiProperty({ 
    description: 'Unidad de medida', 
    example: 'kilogramos',
    required: true
  })
  @IsString()
  @Length(1, 20)
  unidadMedida: string;

  @ApiProperty({ 
    description: 'Descripción del recurso', 
    required: false
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}