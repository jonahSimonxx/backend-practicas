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
import { AlmacenService } from './Almacen_service';
import { CreateAlmacenDto } from './DTOS/CreateAlmacenDto';
import { UpdateAlmacenDto } from './DTOS/UpdateAlmacenDto';
import { AlmacenDto } from './DTOS/AlmacenDto';

@ApiTags('almacenes')
@Controller('almacenes')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo almacén' })
  @ApiResponse({ status: 201, description: 'Almacén creado exitosamente', type: AlmacenDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un almacén con ese ID' })
  async create(@Body() createAlmacenDto: CreateAlmacenDto): Promise<AlmacenDto> {
    return this.almacenService.create(createAlmacenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los almacenes' })
  @ApiQuery({ name: 'estado', required: false, enum: ['activo', 'inactivo'] })
  @ApiQuery({ name: 'tipo', required: false, enum: ['primario', 'secundario'] })
  @ApiResponse({ status: 200, description: 'Lista de almacenes', type: [AlmacenDto] })
  async findAll(
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string
  ): Promise<AlmacenDto[]> {
    if (estado) {
      return this.almacenService.findByEstado(estado);
    }
    if (tipo) {
      return this.almacenService.findByTipo(tipo);
    }
    return this.almacenService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un almacén por ID' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 200, description: 'Almacén encontrado', type: AlmacenDto })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async findOne(@Param('id') id: string): Promise<AlmacenDto> {
    return this.almacenService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un almacén' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 200, description: 'Almacén actualizado', type: AlmacenDto })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateAlmacenDto: UpdateAlmacenDto,
  ): Promise<AlmacenDto> {
    return this.almacenService.update(id, updateAlmacenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un almacén' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 204, description: 'Almacén eliminado' })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene inventarios)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.almacenService.remove(id);
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar un almacén' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 200, description: 'Almacén activado', type: AlmacenDto })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async activar(@Param('id') id: string): Promise<AlmacenDto> {
    return this.almacenService.activarAlmacen(id);
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar un almacén' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 200, description: 'Almacén desactivado', type: AlmacenDto })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async desactivar(@Param('id') id: string): Promise<AlmacenDto> {
    return this.almacenService.desactivarAlmacen(id);
  }

  @Get(':id/inventarios')
  @ApiOperation({ summary: 'Obtener inventarios del almacén (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del almacén', type: String })
  @ApiResponse({ status: 200, description: 'Inventarios del almacén' })
  @ApiResponse({ status: 404, description: 'Almacén no encontrado' })
  async getInventarios(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de Inventario
    return { message: 'Endpoint pendiente - Módulo Inventario no implementado' };
  }
}