import { PartialType } from '@nestjs/swagger';
import { CreateDemandaDto } from './CreateDemandaDto';
import { IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PeriodoEnum } from '../../common/enums/periodo.enum';

export class UpdateDemandaDto extends PartialType(CreateDemandaDto) {
  @ApiProperty({
    description: 'ID único (no modificable)',
    example: 'DEM-001',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Nuevo tipo de demanda',
    enum: ['estática', 'dinámica'],
    required: false,
  })
  @IsString()
  @IsIn(['estática', 'dinámica'])
  @IsOptional()
  tipoDemanda?: string;

  @ApiProperty({
    description: 'Nuevo periodo',
    enum: PeriodoEnum,
    required: false,
  })
  @IsString()
  @IsIn(Object.values(PeriodoEnum))
  @IsOptional()
  periodo?: PeriodoEnum;

  @ApiProperty({
    description: 'Nueva cantidad requerida',
    example: 1500.75,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadRequerida?: number;
}
