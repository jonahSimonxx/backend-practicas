import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuditoriaService } from './Auditoria.service';
import { Auditoria } from './ENTITY/Auditoria.entity';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

/**
 * Endpoints de solo lectura para consultar la traza de auditoría (RF-016).
 */
@ApiTags('auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría' })
  @ApiQuery({ name: 'entidad', required: false, description: 'Filtrar por entidad afectada' })
  @ApiQuery({ name: 'entidadId', required: false, description: 'Filtrar por ID de la entidad' })
  @ApiResponse({ status: 200, description: 'Lista de registros de auditoría', type: [Auditoria] })
  async findAll(
    @Query('entidad') entidad?: string,
    @Query('entidadId') entidadId?: string,
  ): Promise<Auditoria[]> {
    if (entidad) {
      return this.auditoriaService.findByEntidad(entidad, entidadId);
    }
    return this.auditoriaService.findAll();
  }
}
