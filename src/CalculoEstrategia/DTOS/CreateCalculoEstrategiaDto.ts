import { IsString, IsNumber, IsIn, IsOptional, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalculoEstrategiaDto {
  @ApiProperty({ 
    description: 'ID único del cálculo', 
    example: 'CALC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'ID de la estrategia relacionada', 
    example: 'EST-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  estrategiaId: string;

  @ApiProperty({ 
    description: 'Fecha del cálculo', 
    example: '2024-01-15T10:30:00Z',
    required: true
  })
  fechaCalculo: Date;

  @ApiProperty({ 
    description: 'Resultado general del cálculo', 
    enum: ['satisfactorio', 'parcial'],
    example: 'satisfactorio',
    required: true
  })
  @IsString()
  @IsIn(['satisfactorio', 'parcial']) 
  resultadoGeneral: string;

  @ApiProperty({ 
    description: 'Presupuesto utilizado', 
    example: 35000.00,
    required: true
  })
  @IsNumber()
  @Min(0)
  presupuestoUtilizado: number;

  @ApiProperty({ 
    description: 'Presupuesto disponible', 
    example: 15000.00,
    required: true
  })
  @IsNumber()
  @Min(0)
  presupuestoDisponible: number;

  @ApiProperty({ 
    description: 'Observaciones del cálculo', 
    required: false
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}