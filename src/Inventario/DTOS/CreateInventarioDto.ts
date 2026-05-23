import { IsString, IsNumber, IsIn, IsOptional, Min, Length, IsDate, min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventarioDto {
  @ApiProperty({ 
    description: 'ID único del inventario', 
    example: 'INV-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'ID del recurso relacionado', 
    example: 'REC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  recursoId: string;

  @ApiProperty({ 
    description: 'ID del almacén relacionado', 
    example: 'ALM-001',
    required:true
  })
  @IsString()
  @Length(1, 20)
  almacenId: string;

  @ApiProperty({ 
    description: 'Número de lote', 
    example: 1001,
    required: true
  })
  @IsNumber()
  @Min(0)
  lote: number;

  @ApiProperty({ 
    description: 'Nombre del fabricante', 
    example: 'Fabricante XYZ',
    required: true
  })
  @IsString()
  @Length(1, 50)
  fabricante: string;

  @ApiProperty({ 
    description: 'Fecha de fabricación', 
    example: '2024-01-15',
    required: true
  })
  @Type(() => Date)
  @IsDate()
  fechaFabricacion: Date;

  @ApiProperty({ 
    description: 'Fecha de caducidad', 
    example: '2025-01-15',
    required: true
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fechaCaducidad: Date;

  @ApiProperty({ 
    description: 'Cantidad disponible', 
    example: 1000.50,
    required: true
  })
  @IsNumber()
  @Min(0)
  cantidadDisponible: number;

  @ApiProperty({
    description: 'Estado del inventario',
    enum: ['disponible', 'reservado'],
    default: 'disponible',
    required: false,
  })
  @IsString()
  @IsIn(['disponible', 'reservado'])
  @IsOptional()
  estado?: string = 'disponible';

  @ApiProperty({
    description: 'Número de muestreo',
    example: 1234,
    required: true,
  })
  @IsNumber()
  @Min(0)
  numeroMuestreo: number;

  @ApiProperty({ 
    description: 'Fecha de vigencia', 
    example: '2025-01-15',
    required: true
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fechaVigencia: Date;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'mg',
    required: true
  })
  @IsString()
  unidadMedida: string;

  @ApiProperty({
    description: 'Área de almacenamiento dentro del almacén',
    example: 'Zona sur',
    required: true
  })
  @IsString()
  areaAlmacenamiento: string;

}