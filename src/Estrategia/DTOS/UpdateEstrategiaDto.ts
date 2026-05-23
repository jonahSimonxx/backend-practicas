import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateEstrategiaDto } from './CreateEstrategiaDto';
import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class UpdateEstrategiaDto extends PartialType(
  OmitType(CreateEstrategiaDto, ['id'] as const),
) {
  @ApiProperty({
    description: 'Resultado del cálculo',
    enum: ['posible', 'imposible', 'sin calcular'],
    required: false,
  })
  @IsString()
  @IsIn(['posible', 'imposible', 'sin calcular'])
  @IsOptional()
  resultadoCalculo?: string | null;

  @ApiProperty({
    description: 'Nuevo presupuesto máximo',
    example: 60000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  presupuestoMaximo?: number;

  @ApiProperty({
    description: 'Nuevo estado',
    enum: ['activa', 'inactiva'],
    required: false,
  })
  @IsString()
  @IsIn(['activa', 'inactiva'])
  @IsOptional()
  estado?: string;
}
