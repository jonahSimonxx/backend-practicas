import { PartialType } from '@nestjs/swagger';
import { CreateAlmacenDto } from './CreateAlmacenDto';
import { IsString, IsIn, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlmacenDto extends PartialType(CreateAlmacenDto) {
  @ApiProperty({ 
    description: 'ID único del almacén (no se puede modificar)', 
    example: 'ALM-001',
    required: false,
    readOnly: true
  })
  @IsOptional()
  id?: string;  

  @ApiProperty({ 
    description: 'Nuevo estado del almacén', 
    enum: ['activo', 'inactivo'],
    required: false
  })
  @IsString()
  @IsIn(['activo', 'inactivo'])
  @IsOptional()
  estado?: string;
}