import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DetalleCalculoRecursoService } from './DetalleCalculoRecurso.service';
import { CreateDetalleCalculoRecursoDto } from './DTOS/CreateDetalleCalculoRecursoDto';
import { UpdateDetalleCalculoRecursoDto } from './DTOS/UpdateDetalleCalculoRecursoDto';
import { DetalleCalculoRecursoDto } from './DTOS/DetalleCalculoRecursoDto';

@ApiTags('detalles-calculo-recurso')
@Controller('detalles-calculo-recurso')
export class DetalleCalculoRecursoController {
  constructor(private readonly detalleService: DetalleCalculoRecursoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo detalle de cálculo de recurso' })
  @ApiResponse({ status: 201, description: 'Detalle creado exitosamente', type: DetalleCalculoRecursoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID ya existe o combinación duplicada' })
  async create(@Body() createDetalleDto: CreateDetalleCalculoRecursoDto): Promise<DetalleCalculoRecursoDto> {
    return this.detalleService.create(createDetalleDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Crear múltiples detalles en lote' })
  @ApiResponse({ status: 201, description: 'Detalles creados exitosamente', type: [DetalleCalculoRecursoDto] })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createBatch(@Body() createDetalleDtos: CreateDetalleCalculoRecursoDto[]): Promise<DetalleCalculoRecursoDto[]> {
    return this.detalleService.createBatch(createDetalleDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los detalles' })
  @ApiQuery({ name: 'calculoId', required: false, description: 'Filtrar por cálculo' })
  @ApiQuery({ name: 'recursoId', required: false, description: 'Filtrar por recurso' })
  @ApiQuery({ name: 'satisfacer', required: false, description: 'Filtrar por satisfacción', type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de detalles', type: [DetalleCalculoRecursoDto] })
  async findAll(
    @Query('calculoId') calculoId?: string,
    @Query('recursoId') recursoId?: string,
    @Query('satisfacer') satisfacer?: string
  ): Promise<DetalleCalculoRecursoDto[]> {
    if (calculoId && recursoId) {
      const detalle = await this.detalleService.findByCalculoYRecurso(calculoId, recursoId);
      return detalle ? [detalle] : [];
    }
    if (calculoId) {
      return this.detalleService.findByCalculo(calculoId);
    }
    if (recursoId) {
      return this.detalleService.findByRecurso(recursoId);
    }
    if (satisfacer !== undefined) {
      const satisfacerBool = satisfacer === 'true';
      return this.detalleService.findBySatisfaccion(satisfacerBool);
    }
    return this.detalleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle', type: String })
  @ApiResponse({ status: 200, description: 'Detalle encontrado', type: DetalleCalculoRecursoDto })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  async findOne(@Param('id') id: string): Promise<DetalleCalculoRecursoDto> {
    return this.detalleService.findOne(id);
  }

  @Get('calculo/:calculoId/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de un cálculo' })
  @ApiParam({ name: 'calculoId', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Estadísticas del cálculo' })
  async getEstadisticasCalculo(@Param('calculoId') calculoId: string): Promise<any> {
    return this.detalleService.getEstadisticasCalculo(calculoId);
  }

  @Get('calculo/:calculoId/satisfaccion')
  @ApiOperation({ summary: 'Obtener nivel de satisfacción de un cálculo' })
  @ApiParam({ name: 'calculoId', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Nivel de satisfacción' })
  async getSatisfaccionCalculo(@Param('calculoId') calculoId: string): Promise<{ porcentaje: number }> {
    const detalles = await this.detalleService.findByCalculo(calculoId);
    if (detalles.length === 0) {
      return { porcentaje: 0 };
    }
    
    const satisfacibles = detalles.filter(d => d.satisfacer).length;
    const porcentaje = (satisfacibles / detalles.length) * 100;
    
    return { porcentaje: parseFloat(porcentaje.toFixed(2)) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle' })
  @ApiParam({ name: 'id', description: 'ID del detalle', type: String })
  @ApiResponse({ status: 200, description: 'Detalle actualizado', type: DetalleCalculoRecursoDto })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateDetalleDto: UpdateDetalleCalculoRecursoDto,
  ): Promise<DetalleCalculoRecursoDto> {
    return this.detalleService.update(id, updateDetalleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un detalle' })
  @ApiParam({ name: 'id', description: 'ID del detalle', type: String })
  @ApiResponse({ status: 200, description: 'Detalle eliminado' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.detalleService.remove(id);
  }

  @Delete('calculo/:calculoId')
  @ApiOperation({ summary: 'Eliminar todos los detalles de un cálculo' })
  @ApiParam({ name: 'calculoId', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Detalles eliminados' })
  async removeByCalculo(@Param('calculoId') calculoId: string): Promise<{ eliminados: number }> {
    const eliminados = await this.detalleService.removeByCalculo(calculoId);
    return { eliminados };
  }
}