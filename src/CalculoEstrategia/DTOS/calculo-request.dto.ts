import { ApiProperty } from '@nestjs/swagger';

export class CalculoRequestDto {
  @ApiProperty({ required: false })
  usarAlmacenesNoTocar?: boolean;
  
  @ApiProperty({ required: false })
  priorizarAlmacenes?: string[];

  @ApiProperty({
    required: false,
    enum: ['basico', 'avanzado'],
    description: 'Algoritmo de cálculo de viabilidad a usar (patrón Strategy). Por defecto: basico.',
  })
  algoritmo?: 'basico' | 'avanzado';
}