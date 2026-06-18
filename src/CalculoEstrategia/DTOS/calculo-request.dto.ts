import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CalculoRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  usarAlmacenesNoTocar?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorizarAlmacenes?: string[];

  @ApiProperty({
    required: false,
    enum: ['basico', 'avanzado'],
    description: 'Algoritmo de cálculo de viabilidad a usar (patrón Strategy). Por defecto: basico.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['basico', 'avanzado'])
  algoritmo?: 'basico' | 'avanzado';
}
