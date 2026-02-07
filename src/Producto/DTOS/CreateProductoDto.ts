import { IsString, IsNumber, IsIn, IsOptional, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'ID único del producto', example: 'PROD-001', required: true })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Dipirona', required: true })
  @IsString()
  @Length(1, 180)
  nombre: string;

  @ApiProperty({ description: 'Descripción del producto', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ 
    description: 'Tipo de envase', 
    enum: ['primario', 'secundario', 'terciario'],
    example: 'primario',
    required: true
  })
  @IsString()
  @IsIn(['primario', 'secundario', 'terciario']) 
  tipoEnvase: string;

  @ApiProperty({ 
    description: 'Tipo de producto', 
    enum: ['directo', 'indirecto'],
    example: 'directo',
    required: true
  })
  @IsString()
  @IsIn(['directo', 'indirecto']) 
  tipoProducto: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'litros', required: true })
  @IsString()
  @Length(1, 50)
  unidadMedida: string;
}