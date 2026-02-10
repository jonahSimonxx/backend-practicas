import { ApiProperty } from '@nestjs/swagger';

export class CalculoRequestDto {
  @ApiProperty({ required: false })
  usarAlmacenesNoTocar?: boolean;
  
  @ApiProperty({ required: false })
  priorizarAlmacenes?: string[]; // ['primario', 'secundario']
}