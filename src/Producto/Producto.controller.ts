import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductoService } from './Producto.service';
import { CreateProductoDto } from './DTOS/CreateProductoDto';
import { UpdateProductoDto } from './DTOS/UpdateProductoDto';
import { ProductoDto } from './DTOS/ProductoDto';

@ApiTags('productos')
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente', type: ProductoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ID ya existe' })
  async create(@Body() createProductoDto: CreateProductoDto): Promise<ProductoDto> {
    return this.productoService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiQuery({ name: 'tipoEnvase', required: false, enum: ['primario', 'secundario', 'terciario'] })
  @ApiQuery({ name: 'tipoProducto', required: false, enum: ['directo', 'indirecto'] })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre' })
  @ApiResponse({ status: 200, description: 'Lista de productos', type: [ProductoDto] })
  async findAll(
    @Query('tipoEnvase') tipoEnvase?: string,
    @Query('tipoProducto') tipoProducto?: string,
    @Query('search') search?: string
  ): Promise<ProductoDto[]> {
    if (search) {
      return this.productoService.searchByNombre(search);
    }
    if (tipoEnvase) {
      return this.productoService.findByTipoEnvase(tipoEnvase);
    }
    if (tipoProducto) {
      return this.productoService.findByTipoProducto(tipoProducto);
    }
    return this.productoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: ProductoDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id') id: string): Promise<ProductoDto> {
    return this.productoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Producto actualizado', type: ProductoDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto en la actualización' })
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoDto> {
    return this.productoService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar (tiene relaciones)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productoService.remove(id);
  }

  @Get(':id/demandas')
  @ApiOperation({ summary: 'Obtener demandas del producto (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Demandas del producto' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getDemandas(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de Demanda
    return { message: 'Endpoint pendiente - Módulo Demanda no implementado' };
  }

  @Get(':id/recursos')
  @ApiOperation({ summary: 'Obtener recursos relacionados (pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 200, description: 'Recursos del producto' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getRecursos(@Param('id') id: string): Promise<any> {
    // TODO: Implementar cuando tengas el módulo de Relaciones
    return { message: 'Endpoint pendiente - Módulo Relaciones no implementado' };
  }
}