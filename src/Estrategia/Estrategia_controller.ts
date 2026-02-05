import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EstrategiaService } from './Estrategia_service';
import { CreateEstrategiaDto } from './DTOS/CreateEstrategiaDto';
import { UpdateEstrategiaDto } from './DTOS/UpdateEstrategiaDto';
import { EstrategiaDto } from './DTOS/EstrategiaDto';

@ApiTags('estrategias')
@Controller('estrategias')
export class EstrategiaController {
  constructor(private readonly estrategiaService: EstrategiaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva estrategia' })
  @ApiResponse({ status: 201, description: 'Estrategia creada exitosamente', type: EstrategiaDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID ya existe' })
  async create(@Body() createEstrategiaDto: CreateEstrategiaDto): Promise<EstrategiaDto> {
    return this.estrategiaService.create(createEstrategiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las estrategias' })
  @ApiQuery({ name: 'estado', required: false, enum: ['activo', 'inactivo'] })
  @ApiQuery({ name: 'resultado', required: false, enum: ['posible', 'imposible'] })
  @ApiResponse({ status: 200, description: 'Lista de estrategias', type: [EstrategiaDto] })
  async findAll(
    @Query('estado') estado?: string,
    @Query('resultado') resultado?: string
  ): Promise<EstrategiaDto[]> {
    if (estado) {
      return this.estrategiaService.findByEstado(estado);
    }
    if (resultado) {
      return this.estrategiaService.findByResultadoCalculo(resultado);
    }
    return this.estrategiaService.findAll();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de estrategias' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales' })
  async getEstadisticas(): Promise<any> {
    return this.estrategiaService.getEstadisticas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una estrategia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String }) // CORREGIDO: type String
  @ApiResponse({ status: 200, description: 'Estrategia encontrada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async findOne(@Param('id') id: string): Promise<EstrategiaDto> { // CORREGIDO: id es string
    return this.estrategiaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String }) // CORREGIDO: type String
  @ApiResponse({ status: 200, description: 'Estrategia actualizada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async update(
    @Param('id') id: string, // CORREGIDO: id es string
    @Body() updateEstrategiaDto: UpdateEstrategiaDto,
  ): Promise<EstrategiaDto> {
    return this.estrategiaService.update(id, updateEstrategiaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String }) // CORREGIDO: type String
  @ApiResponse({ status: 204, description: 'Estrategia eliminada' })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async remove(@Param('id') id: string): Promise<void> { // CORREGIDO: id es string
    return this.estrategiaService.remove(id);
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Estrategia activada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async activar(@Param('id') id: string): Promise<EstrategiaDto> {
    return this.estrategiaService.activarEstrategia(id);
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar una estrategia' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Estrategia desactivada', type: EstrategiaDto })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async desactivar(@Param('id') id: string): Promise<EstrategiaDto> {
    return this.estrategiaService.desactivarEstrategia(id);
  }

  @Get(':id/demandas')
  @ApiOperation({ summary: 'Obtener demandas de la estrategia (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Demandas de la estrategia' })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async getDemandas(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas relaciones
    return { message: 'Endpoint pendiente - Relaciones no implementadas' };
  }

  @Get(':id/calculos')
  @ApiOperation({ summary: 'Obtener cálculos de la estrategia (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID de la estrategia', type: String })
  @ApiResponse({ status: 200, description: 'Cálculos de la estrategia' })
  @ApiResponse({ status: 404, description: 'Estrategia no encontrada' })
  async getCalculos(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas relaciones
    return { message: 'Endpoint pendiente - Relaciones no implementadas' };
  }
}