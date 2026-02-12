import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalculoEstrategiaService } from './CalculoEstrategia.service';
import { CreateCalculoEstrategiaDto } from './DTOS/CreateCalculoEstrategiaDto';
import { UpdateCalculoEstrategiaDto } from './DTOS/UpdateCalculoEstrategiaDto';
import { CalculoEstrategiaDto } from './DTOS/CalculoEstrategiaDto';
import { ResultadoCalculoDto } from '../CalculoEstrategia/DTOS/resultado-calculo.dto';
import { CalculoRequestDto } from '../CalculoEstrategia/DTOS/calculo-request.dto';

@ApiTags('calculo-estrategias')
@Controller('calculo-estrategias')
export class CalculoEstrategiaController {
  constructor(private readonly calculoEstrategiaService: CalculoEstrategiaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cálculo de estrategia' })
  @ApiResponse({ status: 201, description: 'Cálculo creado exitosamente', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createCalculoEstrategiaDto: CreateCalculoEstrategiaDto): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.create(createCalculoEstrategiaDto);
  }

  @Post('calcular-detallado/:estrategiaId')
  @ApiOperation({ summary: 'Calcular estrategia con detalles por recurso' })
  @ApiParam({ name: 'estrategiaId', description: 'ID de la estrategia', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Cálculo detallado realizado', 
    type: ResultadoCalculoDto 
  })
  async calcularDetallado(
    @Param('estrategiaId') estrategiaId: string,
    @Body() calculoRequest?: CalculoRequestDto,
  ): Promise<ResultadoCalculoDto> {
    return this.calculoEstrategiaService.calcularEstrategiaDetallada(estrategiaId, calculoRequest);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cálculos' })
  @ApiQuery({ name: 'estrategiaId', required: false, description: 'Filtrar por estrategia' })
  @ApiQuery({ name: 'resultado', required: false, enum: ['satisfacible', 'insatisfacible', 'parcial'] })
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
  async update(
    @Param('id') id: string,
    @Body() updateCalculoEstrategiaDto: UpdateCalculoEstrategiaDto,
  ): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.update(id, updateCalculoEstrategiaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un cálculo' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 204, description: 'Cálculo eliminado' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.calculoEstrategiaService.remove(id);
  }

  @Get(':id/detalles-recursos')
  @ApiOperation({ summary: 'Obtener detalles de recursos del cálculo' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Detalles de recursos' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  async getDetallesRecursos(@Param('id') id: string): Promise<any> {
    const calculo = await this.calculoEstrategiaService.findOne(id);
    return { message: 'Detalles de recursos disponibles', calculoId: id };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cálculo por ID' })
  @ApiParam({ name: 'id', description: 'ID del cálculo', type: String })
  @ApiResponse({ status: 200, description: 'Cálculo encontrado', type: CalculoEstrategiaDto })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  async findOne(@Param('id') id: string): Promise<CalculoEstrategiaDto> {
    return this.calculoEstrategiaService.findOne(id);
  }
}