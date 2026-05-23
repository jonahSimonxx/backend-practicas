import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RelacionProductoRecursoService } from './RelacionProductoRecurso.service';
import { CreateRelacionProductoRecursoDto } from './DTOS/CreateRelacionProductoRecursoDto';
import { UpdateRelacionProductoRecursoDto } from './DTOS/UpdateRelacionProductoRecursoDto';
import { RelacionProductoRecursoDto } from './DTOS/RelacionProductoRecursoDto';
import { RequerimientosQueryDto } from './DTOS/RequerimientosQueryDto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { CurrentUser } from '../Auth/decorators/current-user.decorator';

@ApiTags('relaciones-producto-recurso')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('relaciones-producto-recurso')
export class RelacionProductoRecursoController {
  constructor(private readonly relacionService: RelacionProductoRecursoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva relación producto-recurso' })
  @ApiResponse({ status: 201, description: 'Relación creada exitosamente', type: RelacionProductoRecursoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto o Recurso no existe' })
  @ApiResponse({ status: 409, description: 'ID ya existe o relación duplicada' })
  async create(
    @Body() createRelacionDto: CreateRelacionProductoRecursoDto,
    @CurrentUser() _user: any,
  ): Promise<RelacionProductoRecursoDto> {
    return this.relacionService.create(createRelacionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las relaciones' })
  @ApiQuery({ name: 'productoId', required: false, description: 'Filtrar por producto' })
  @ApiQuery({ name: 'recursoId', required: false, description: 'Filtrar por recurso' })
  @ApiQuery({ name: 'tipoRelacion', required: false, enum: ['consumo', 'producción'] })
  @ApiResponse({ status: 200, description: 'Lista de relaciones', type: [RelacionProductoRecursoDto] })
  async findAll(
    @Query('productoId') productoId?: string,
    @Query('recursoId') recursoId?: string,
    @Query('tipoRelacion') tipoRelacion?: string,
  ): Promise<RelacionProductoRecursoDto[]> {
    if (productoId && recursoId) {
      const relacion = await this.relacionService.findByProductoYRecurso(productoId, recursoId);
      return relacion ? [relacion] : [];
    }
    if (productoId) {
      return this.relacionService.findByProducto(productoId);
    }
    if (recursoId) {
      return this.relacionService.findByRecurso(recursoId);
    }
    if (tipoRelacion) {
      return this.relacionService.findByTipoRelacion(tipoRelacion);
    }
    return this.relacionService.findAll();
  }

  // ===== Rutas estáticas ANTES de las dinámicas (:id) =====

  @Get('estadisticas/recursos-mas-utilizados')
  @ApiOperation({ summary: 'Obtener recursos más utilizados' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados', type: Number })
  @ApiResponse({ status: 200, description: 'Recursos más utilizados' })
  async getRecursosMasUtilizados(@Query('limit') limit?: number): Promise<any[]> {
    return this.relacionService.getRecursosMasUtilizados(limit || 10);
  }

  @Get('producto/:productoId/requerimientos')
  @ApiOperation({ summary: 'Obtener requerimientos para una cantidad de producto' })
  @ApiParam({ name: 'productoId', description: 'ID del producto', type: String })
  @ApiQuery({ name: 'cantidad', required: true, description: 'Cantidad del producto', type: Number })
  @ApiResponse({ status: 200, description: 'Requerimientos calculados' })
  async getRequerimientosParaProducto(
    @Param('productoId') productoId: string,
    @Query() query: RequerimientosQueryDto,
  ): Promise<any> {
    return this.relacionService.getRequerimientosParaProducto(productoId, query.cantidad);
  }

  @Get('producto/:productoId/recursos')
  @ApiOperation({ summary: 'Obtener todos los recursos de un producto' })
  @ApiParam({ name: 'productoId', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Recursos del producto', type: [RelacionProductoRecursoDto] })
  async getRecursosDeProducto(@Param('productoId') productoId: string): Promise<RelacionProductoRecursoDto[]> {
    return this.relacionService.findByProducto(productoId);
  }

  @Get('recurso/:recursoId/productos')
  @ApiOperation({ summary: 'Obtener todos los productos que usan un recurso' })
  @ApiParam({ name: 'recursoId', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Productos del recurso', type: [RelacionProductoRecursoDto] })
  async getProductosDeRecurso(@Param('recursoId') recursoId: string): Promise<RelacionProductoRecursoDto[]> {
    return this.relacionService.findByRecurso(recursoId);
  }

  // ===== Rutas dinámicas (:id) DESPUÉS de las estáticas =====

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una relación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: String })
  @ApiResponse({ status: 200, description: 'Relación encontrada', type: RelacionProductoRecursoDto })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  async findOne(@Param('id') id: string): Promise<RelacionProductoRecursoDto> {
    return this.relacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una relación' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: String })
  @ApiResponse({ status: 200, description: 'Relación actualizada', type: RelacionProductoRecursoDto })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateRelacionDto: UpdateRelacionProductoRecursoDto,
  ): Promise<RelacionProductoRecursoDto> {
    return this.relacionService.update(id, updateRelacionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una relación' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: String })
  @ApiResponse({ status: 200, description: 'Relación eliminada' })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.relacionService.remove(id);
  }
}
