import { IsString, IsIn, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AlmacenDto {
  @ApiProperty({ description: 'ID del almacén', example: 'ALM-001' })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ description: 'Nombre del almacén', example: 'Almacén Central' })
  @IsString()
  @Length(1, 50)
  nombre: string;

  @ApiProperty({ description: 'Ubicación del almacén', example: 'Edificio A, Piso 3' })
  @IsString()
  @Length(1, 180)
  ubicacion: string;

  @ApiProperty({ 
    description: 'Tipo de almacén', 
    enum: ['primario', 'secundario'],
    example: 'primario'
  })
  @IsString()
  @IsIn(['primario', 'secundario'])  
  tipoAlmacen: string;

  @ApiProperty({ 
    description: 'Estado del almacén', 
    enum: ['activo', 'inactivo'],
    default: 'activo'
  })
  @IsString()
  @IsIn(['activo', 'inactivo'])  
  @IsOptional()
  estado?: string;
}