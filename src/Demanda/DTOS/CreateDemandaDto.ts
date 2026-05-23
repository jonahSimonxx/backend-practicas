import { IsString, IsNumber, IsIn, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PeriodoEnum } from '../../common/enums/periodo.enum';

export class CreateDemandaDto {
  @ApiProperty({
    description: 'ID único de la demanda',
    example: 'DEM-001',
    required: true,
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({
    description: 'ID del producto relacionado',
    example: 'PROD-001',
    required: true,
  })
  @IsString()
  @Length(1, 20)
  productoId: string;

  @ApiProperty({
    description: 'ID de la estrategia relacionada',
    example: 'EST-001',
    required: true,
  })
  @IsString()
  @Length(1, 20)
  estrategiaId: string;

  @ApiProperty({
    description: 'Tipo de demanda',
    enum: ['estática', 'dinámica'],
    example: 'estática',
    required: true,
  })
  @IsString()
  @IsIn(['estática', 'dinámica'])
  tipoDemanda: string;

  @ApiProperty({
    description: 'Cantidad requerida',
    example: 1000,
    required: true,
  })
  @IsNumber()
  @Min(0)
  cantidadRequerida: number;

  @ApiProperty({
    description: 'Periodo de la demanda',
    enum: PeriodoEnum,
    example: PeriodoEnum.MENSUAL,
    required: true,
  })
  @IsString()
  @IsIn(Object.values(PeriodoEnum))
  periodo: PeriodoEnum;
}
