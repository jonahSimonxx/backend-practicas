import { IsString, IsNumber, IsBoolean, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetalleCalculoRecursoDto {
  @ApiProperty({ 
    description: 'ID único del detalle', 
    example: 'DET-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'ID del cálculo relacionado', 
    example: 'CALC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  calculoId: string;

  @ApiProperty({ 
    description: 'ID del recurso relacionado', 
    example: 'REC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  recursoId: string;

  @ApiProperty({ 
    description: 'Cantidad total requerida', 
    example: 500.75,
    required: true
  })
  @IsNumber()
  @Min(0)
  cantidadRequeridaTotal: number;

  @ApiProperty({ 
    description: 'Cantidad total disponible', 
    example: 450.25,
    required: true
  })
  @IsNumber()
  @Min(0)
  cantidadDisponibleTotal: number;

  @ApiProperty({ 
    description: 'Indica si se puede satisfacer', 
    example: true,
    required: true
  })
  @IsBoolean()
  satisfacer: boolean;
}