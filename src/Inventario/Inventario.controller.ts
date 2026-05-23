import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InventarioService } from './Inventario.service';
import { CreateInventarioDto } from './DTOS/CreateInventarioDto';
import { UpdateInventarioDto } from './DTOS/UpdateInventarioDto';
import { InventarioDto } from './DTOS/InventarioDto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { CurrentUser } from '../Auth/decorators/current-user.decorator';

@ApiTags('inventarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventarios')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de inventario' })
  @ApiResponse({ status: 201, description: 'Inventario creado exitosamente', type: InventarioDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID o lote ya existen' })
  async create(
    @Body() createInventarioDto: CreateInventarioDto,
    @CurrentUser() _user: any,
  ): Promise<InventarioDto> {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los inventarios' })
  @ApiQuery({ name: 'recursoId', required: false, description: 'Filtrar por recurso' })
  @ApiQuery({ name: 'almacenId', required: false, description: 'Filtrar por almacén' })
  @ApiQuery({ name: 'estado', required: false, enum: ['disponible', 'reservado'] })
  @ApiQuery({ name: 'fabricante', required: false, description: 'Filtrar por fabricante' })
  @ApiQuery({ name: 'caducados', required: false, description: 'Solo caducados', type: Boolean })
  @ApiQuery({ name: 'porCaducar', required: false, description: 'Próximos a caducar (días)', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de inventarios', type: [InventarioDto] })
  async findAll(
    @Query('recursoId') recursoId?: string,
    @Query('almacenId') almacenId?: string,
    @Query('estado') estado?: string,
    @Query('fabricante') fabricante?: string,
    @Query('caducados') caducados?: string,
    @Query('porCaducar') porCaducar?: string,
  ): Promise<InventarioDto[]> {
    if (caducados === 'true') {
      return this.inventarioService.findCaducados();
    }
    if (porCaducar) {
      const dias = parseInt(porCaducar) || 30;
      return this.inventarioService.findPorCaducar(dias);
    }
    if (recursoId) {
      return this.inventarioService.findByRecurso(recursoId);
    }
    if (almacenId) {
      return this.inventarioService.findByAlmacen(almacenId);
    }
    if (estado) {
      return this.inventarioService.findByEstado(estado);
    }
    if (fabricante) {
      return this.inventarioService.findByFabricante(fabricante);
    }
    return this.inventarioService.findAll();
  }

  @Get('recurso/:recursoId/disponibilidad')
  @ApiOperation({ summary: 'Obtener disponibilidad total de un recurso' })
  @ApiParam({ name: 'recursoId', description: 'ID del recurso', type: String })
  @ApiResponse({ status: 200, description: 'Disponibilidad del recurso' })
  async getDisponibilidadRecurso(@Param('recursoId') recursoId: string): Promise<{ total: number }> {
    const total = await this.inventarioService.getTotalDisponiblePorRecurso(recursoId);
    return { total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un inventario por ID' })
  @ApiParam({ name: 'id', description: 'ID del inventario', type: String })
  @ApiResponse({ status: 200, description: 'Inventario encontrado', type: InventarioDto })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  async findOne(@Param('id') id: string): Promise<InventarioDto> {
    return this.inventarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un inventario' })
  @ApiParam({ name: 'id', description: 'ID del inventario', type: String })
  @ApiResponse({ status: 200, description: 'Inventario actualizado', type: InventarioDto })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ): Promise<InventarioDto> {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un inventario' })
  @ApiParam({ name: 'id', description: 'ID del inventario', type: String })
  @ApiResponse({ status: 200, description: 'Inventario eliminado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene cantidad disponible)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.inventarioService.remove(id);
  }
}
