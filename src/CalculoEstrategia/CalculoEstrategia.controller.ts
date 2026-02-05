import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalculoEstrategiaService } from './CalculoEstrategia.service';
import { CreateCalculoEstrategiaDto } from './DTOS/CreateCalculoEstrategiaDto';
import { UpdateCalculoEstrategiaDto } from './DTOS/UpdateCalculoEstrategiaDto';
import { CalculoEstrategiaDto } from './DTOS/CalculoEstrategiaDto';

@ApiTags('calculo-estrategias')
@Controller('calculo-estrategias')
export class CalculoEstrategiaController {
  constructor(private readonly calculoEstrategiaService: CalculoEstrategiaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cálculo de estrategia' })
  @ApiResponse({ status: 201, description: 'Cálculo creado exitosamente', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID ya existe' })
  async create(@Body() createCalculoEstrategiaDto: CreateCalculoEstrategiaDto): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.create(createCalculoEstrategiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cálculos' })
  @ApiQuery({ name: 'estrategiaId', required: false, description: 'Filtrar por estrategia' })
  @ApiQuery({ name: 'resultado', required: false, enum: ['satisfactorio', 'parcial'] })
  @ApiResponse({ status: 200, description: 'Lista de cálculos', type: [CalculoEstrategiaDto] })
  async findAll(
    @Query('estrategiaId') estrategiaId?: string,
    @Query('resultado') resultado?: string
  ): Promise<CalculoEstrategiaDto[]> {
    if (estrategiaId) {
      return this.calculoEstrategiaService.findByEstrategia(estrategiaId);
    }
    if (resultado) {
      return this.calculoEstrategiaService.findByResultado(resultado);
    }
    return this.calculoEstrategiaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cálculo por ID' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Cálculo encontrado', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  async findOne(@Param('id') id: string): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.findOne(id);
  }

  @Get('estrategia/:estrategiaId/ultimo')
  @ApiOperation({ summary: 'Obtener el último cálculo de una estrategia' })
  @ApiParam({ name: 'estrategiaId', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Último cálculo encontrado', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 404, description: 'No se encontraron cálculos' })
  async findLatestByEstrategia(@Param('estrategiaId') estrategiaId: string): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.findLatestByEstrategia(estrategiaId);
  }

  @Get('estrategia/:estrategiaId/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de cálculos por estrategia' })
  @ApiParam({ name: 'estrategiaId', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Estadísticas de cálculos' })
  async getEstadisticas(@Param('estrategiaId') estrategiaId: string): Promise<any> {
    return this.calculoEstrategiaService.getEstadisticasPorEstrategia(estrategiaId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cálculo' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Cálculo actualizado', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateCalculoEstrategiaDto: UpdateCalculoEstrategiaDto,
  ): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.update(id, updateCalculoEstrategiaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cálculo' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Cálculo eliminado' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene detalles)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.calculoEstrategiaService.remove(id);
  }

  @Get(':id/detalles-recursos')
  @ApiOperation({ summary: 'Obtener detalles de recursos del cálculo (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Detalles de recursos' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  async getDetallesRecursos(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de DetalleCalculoRecurso
    return { message: 'Endpoint pendiente - Módulo DetalleCalculoRecurso no implementado' };
  }
}