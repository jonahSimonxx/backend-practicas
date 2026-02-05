import { IsString, IsNumber, IsIn, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRelacionProductoRecursoDto {
  @ApiProperty({ 
    description: 'ID único de la relación', 
    example: 'REL-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  id: string;

  @ApiProperty({ 
    description: 'ID del producto relacionado', 
    example: 'PROD-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  productoId: string;

  @ApiProperty({ 
    description: 'ID del recurso relacionado', 
    example: 'REC-001',
    required: true
  })
  @IsString()
  @Length(1, 20)
  recursoId: string;

  @ApiProperty({ 
    description: 'Cantidad requerida del recurso por unidad de producto', 
    example: 2.5,
    required: true
  })
  @IsNumber()
  @Min(0)
  cantidadRequerida: number;

  @ApiProperty({ 
    description: 'Tipo de relación', 
    enum: ['consumo', 'producción'],
    example: 'consumo',
    required: true
  })
  @IsString()
  @IsIn(['consumo', 'producción']) 
  tipoRelacion: string;
}