import { PartialType } from '@nestjs/swagger';
import { CreateRecursoDto } from './CreateRecursoDto';
import { IsString, IsIn, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecursoDto extends PartialType(CreateRecursoDto) {
  @ApiProperty({ 
    description: 'ID único (no modificable)', 
    example: 'REC-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'Nuevo tipo de recurso', 
    enum: ['materia prima', 'insumo'],
    required: false
  })
  @IsString()
  @IsIn(['materia prima', 'insumo'])
  @IsOptional()
  tipoRecurso?: string;

  @ApiProperty({ 
    description: 'Nuevo código', 
    example: 'MP-002',
    required: false
  })
  @IsString()
  @Length(1, 20)
  @IsOptional()
  codigo?: string;
}