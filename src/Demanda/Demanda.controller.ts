import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DemandaService } from './Demanda.service';
import { CreateDemandaDto } from './DTOS/CreateDemandaDto';
import { UpdateDemandaDto } from './DTOS/UpdateDemandaDto';
import { DemandaDto } from './DTOS/DemandaDto';

@ApiTags('demandas')
@Controller('demandas')
export class DemandaController {
  constructor(private readonly demandaService: DemandaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva demanda' })
  @ApiResponse({ status: 201, description: 'Demanda creada exitosamente', type: DemandaDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID ya existe' })
  async create(@Body() createDemandaDto: CreateDemandaDto): Promise<DemandaDto> {
    return this.demandaService.create(createDemandaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las demandas' })
  @ApiQuery({ name: 'estrategiaId', required: false, description: 'Filtrar por estrategia' })
  @ApiQuery({ name: 'productoId', required: false, description: 'Filtrar por producto' })
  @ApiQuery({ name: 'tipoDemanda', required: false, enum: ['estática', 'dinámica'] })
  @ApiQuery({ name: 'periodo', required: false, enum: ['mensual', 'trimestral', 'anual'] })
  @ApiResponse({ status: 200, description: 'Lista de demandas', type: [DemandaDto] })
  async findAll(
    @Query('estrategiaId') estrategiaId?: string,
    @Query('productoId') productoId?: string,
    @Query('tipoDemanda') tipoDemanda?: string,
    @Query('periodo') periodo?: string
  ): Promise<DemandaDto[]> {
    if (estrategiaId) {
      return this.demandaService.findByEstrategia(estrategiaId);
    }
    if (productoId) {
      return this.demandaService.findByProducto(productoId);
    }
    if (tipoDemanda) {
      return this.demandaService.findByTipoDemanda(tipoDemanda);
    }
    if (periodo) {
      return this.demandaService.findByPeriodo(periodo);
    }
    return this.demandaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una demanda por ID' })
  @ApiParam({ name: 'id', description: 'ID de la demanda', type: String })
  @ApiResponse({ status: 200, description: 'Demanda encontrada', type: DemandaDto })
  @ApiResponse({ status: 404, description: 'Demanda no encontrada' })
  async findOne(@Param('id') id: string): Promise<DemandaDto> {
    return this.demandaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una demanda' })
  @ApiParam({ name: 'id', description: 'ID de la demanda', type: String })
  @ApiResponse({ status: 200, description: 'Demanda actualizada', type: DemandaDto })
  @ApiResponse({ status: 404, description: 'Demanda no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateDemandaDto: UpdateDemandaDto,
  ): Promise<DemandaDto> {
    return this.demandaService.update(id, updateDemandaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una demanda' })
  @ApiParam({ name: 'id', description: 'ID de la demanda', type: String })
  @ApiResponse({ status: 200, description: 'Demanda eliminada' })
  @ApiResponse({ status: 404, description: 'Demanda no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.demandaService.remove(id);
  }
}