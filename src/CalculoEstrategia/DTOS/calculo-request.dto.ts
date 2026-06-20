import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Opciones para el cálculo detallado de una estrategia.
 *
 * Regla de negocio: los almacenes inactivos NUNCA se consideran en el cálculo
 * (es implícito). Por eso ya no existe la opción `usarAlmacenesNoTocar`.
 */
export class CalculoRequestDto {
  /**
   * IDs de los almacenes específicos contra los que se desea verificar la
   * estrategia. Solo se consideran los que estén activos. Si se omite (o se
   * envía vacío), se consideran todos los almacenes activos.
   *
   * Nota: debe tener decoradores de class-validator porque el ValidationPipe
   * global usa `whitelist: true`; sin ellos el campo se descarta del body.
   */
  @ApiPropertyOptional({
    type: [String],
    description:
      'IDs de almacenes activos a los que se restringe el cálculo. Si se omite, se usan todos los almacenes activos.',
    example: ['ALM-1', 'ALM-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorizarAlmacenes?: string[];
}
