import { PartialType } from '@nestjs/swagger';
import { CreateEstrategiaDto } from './CreateEstrategiaDto';
import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstrategiaDto extends PartialType(CreateEstrategiaDto) {
  @ApiProperty({ description: 'Resultado del cálculo', enum: ['satisfacible', 'insatisfacible', 'parcial', null], required: false })
  @IsString()
  @IsIn(['satisfacible', 'insatisfacible', 'parcial', null])
  @IsOptional()
  resultadoCalculo?: string;
}