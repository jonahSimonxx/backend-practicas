import { IsString, IsIn, IsOptional, Length, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlmacenDto {
  @ApiProperty({ 
    description: 'ID único del almacén', 
    example: 'ALM-001',
    required: true
  })
  @IsString()
  @Length(1, 50)
  id: string;

  @ApiProperty({ 
    description: 'Código del almacén', 
    example: 'ALM001'
  })
  @IsString()
  @Length(1, 20)
  codigo: string;

  @ApiProperty({ 
    description: 'Nombre del almacén', 
    example: 'Almacén Central',
    required: true 
  })
  @IsString()
  @Length(1, 50)
  nombre: string;

  @ApiProperty({ 
    description: 'Ubicación física', 
    example: 'Edificio A, Piso 3, Zona 5' 
  })
  @IsString()
  @Length(1, 180)
  ubicacion: string;

  @ApiProperty({ 
    description: 'Tipo de almacén según clasificación', 
    enum: ['primario', 'secundario'],
    example: 'primario',
    required: true
  })
  @IsString()
  @IsIn(['primario', 'secundario'])  
  tipoAlmacen: string;

  @ApiProperty({ 
    description: 'Estado operativo del almacén', 
    enum: ['activo', 'inactivo'],
    default: 'activo',
    required: true
  })
  @IsString()
  @IsIn(['activo', 'inactivo'])  
  @IsOptional()
  estado?: string = 'activo';
}