import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RecursoService } from './Recurso.service';
import { CreateRecursoDto } from './DTOS/CreateRecursoDto';
import { UpdateRecursoDto } from './DTOS/UpdateRecursoDto';
import { RecursoDto } from './DTOS/RecursoDto';

@ApiTags('recursos')
@Controller('recursos')
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo recurso' })
  @ApiResponse({ status: 201, description: 'Recurso creado exitosamente', type: RecursoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID o código ya existen' })
  async create(@Body() createRecursoDto: CreateRecursoDto): Promise<RecursoDto> {
    return this.recursoService.create(createRecursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los recursos' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['materia prima', 'insumo'] })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre' })
  @ApiQuery({ name: 'bajoInventario', required: false, description: 'Recursos con inventario bajo', type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de recursos', type: [RecursoDto] })
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('search') search?: string,
    @Query('bajoInventario') bajoInventario?: string
  ): Promise<RecursoDto[]> {
    if (bajoInventario === 'true') {
      return this.recursoService.getRecursosConBajoInventario();
    }
    if (search) {
      return this.recursoService.searchByNombre(search);
    }
    if (tipo) {
      return this.recursoService.findByTipoRecurso(tipo);
    }
    return this.recursoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un recurso por ID' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Recurso encontrado', type: RecursoDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async findOne(@Param('id') id: string): Promise<RecursoDto> {
    return this.recursoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un recurso' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Recurso actualizado', type: RecursoDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateRecursoDto: UpdateRecursoDto,
  ): Promise<RecursoDto> {
    return this.recursoService.update(id, updateRecursoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un recurso' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Recurso eliminado' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene relaciones)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.recursoService.remove(id);
  }

  @Get(':id/productos')
  @ApiOperation({ summary: 'Obtener productos relacionados (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Productos que usan este recurso' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async getProductosRelacionados(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de Relaciones
    return { message: 'Endpoint pendiente - Módulo Relaciones no implementado' };
  }

  @Get(':id/inventarios')
  @ApiOperation({ summary: 'Obtener inventarios del recurso (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Inventarios del recurso' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async getInventarios(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de Inventario
    return { message: 'Endpoint pendiente - Módulo Inventario no implementado' };
  }

  @Get(':id/disponibilidad')
  @ApiOperation({ summary: 'Obtener disponibilidad total (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Disponibilidad del recurso' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado' })
  async getDisponibilidad(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas relaciones
    return { 
      message: 'Endpoint pendiente - Relaciones no implementadas',
      id,
      cantidadTotal: 0,
      disponible: false
    };
  }
}