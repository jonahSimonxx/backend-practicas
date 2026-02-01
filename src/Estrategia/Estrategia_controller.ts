import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EstrategiasService } from './Estrategia_service';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';

@ApiTags('estrategias')
@Controller('estrategias')
export class EstrategiasController {
  constructor(private readonly estrategiasService: EstrategiasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva estrategia' })
  @ApiResponse({ status: 201, description: 'Estrategia creada exitosamente', type: EstrategiaDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createEstrategiaDto: CreateEstrategiaDto): Promise<EstrategiaDto> {
    return this.estrategiasService.create(createEstrategiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las estrategias' })
  @ApiResponse({ status: 200, description: 'Lista de estrategias', type: [EstrategiaDto] })
  async findAll(): Promise<EstrategiaDto[]> {
    return this.estrategiasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una estrategia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: Number })
  @ApiResponse({ status: 200, description: 'Estrategia encontrada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async findOne(@Param('id') id: string): Promise<EstrategiaDto> {
    return this.estrategiasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: Number })
  @ApiResponse({ status: 200, description: 'Estrategia actualizada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateEstrategiaDto: UpdateEstrategiaDto,
  ): Promise<EstrategiaDto> {
    return this.estrategiasService.update(+id, updateEstrategiaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: Number })
  @ApiResponse({ status: 204, description: 'Estrategia eliminada' })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.estrategiasService.remove(+id);
  }

  @Post(':id/calcular')
  @ApiOperation({ summary: 'Calcular la viabilidad de una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: Number })
  @ApiResponse({ status: 200, description: 'Cálculo realizado', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async calcular(@Param('id') id: string): Promise<EstrategiaDto> {
    return this.estrategiasService.calcularEstrategia(+id);
  }
}