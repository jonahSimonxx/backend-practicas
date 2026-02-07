import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './ENTITY/Producto.entity';
import { CreateProductoDto } from './DTOS/CreateProductoDto';
import { UpdateProductoDto } from './DTOS/UpdateProductoDto';
import { ProductoDto } from './DTOS/ProductoDto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<ProductoDto> {
    // Verificar si ya existe un producto con ese ID
    const existente = await this.productoRepository.findOne({
      where: { id: createProductoDto.id }
    });

    if (existente) {
      throw new ConflictException(`Ya existe un producto con ID ${createProductoDto.id}`);
    }

    const producto = this.productoRepository.create(createProductoDto);
    const savedProducto = await this.productoRepository.save(producto);
    return this.mapToDto(savedProducto);
  }

  async findAll(): Promise<ProductoDto[]> {
    const productos = await this.productoRepository.find({
      order: { nombre: 'ASC' }
    });
    return productos.map(producto => this.mapToDto(producto));
  }

  async findOne(id: string): Promise<ProductoDto> {
    const producto = await this.productoRepository.findOne({
      where: { id }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mapToDto(producto);
  }

  async findByTipoEnvase(tipoEnvase: string): Promise<ProductoDto[]> {
    const productos = await this.productoRepository.find({
      where: { tipoEnvase },
      order: { nombre: 'ASC' }
    });
    return productos.map(producto => this.mapToDto(producto));
  }

  async findByTipoProducto(tipoProducto: string): Promise<ProductoDto[]> {
    const productos = await this.productoRepository.find({
      where: { tipoProducto },
      order: { nombre: 'ASC' }
    });
    return productos.map(producto => this.mapToDto(producto));
  }

  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<ProductoDto> {
    const producto = await this.productoRepository.findOne({ where: { id } });
    
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // No permitir modificar el ID
    if (updateProductoDto.id && updateProductoDto.id !== id) {
      throw new ConflictException('No se puede modificar el ID de un producto');
    }

    Object.assign(producto, updateProductoDto);
    const updatedProducto = await this.productoRepository.save(producto);
    return this.mapToDto(updatedProducto);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.productoRepository.findOne({ where: { id } });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    const result = await this.productoRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
  }

  async searchByNombre(nombre: string): Promise<ProductoDto[]> {
    const productos = await this.productoRepository
      .createQueryBuilder('producto')
      .where('LOWER(producto.nombre) LIKE LOWER(:nombre)', { nombre: `%${nombre}%` })
      .orderBy('producto.nombre', 'ASC')
      .getMany();
    
    return productos.map(producto => this.mapToDto(producto));
  }

  private mapToDto(producto: Producto): ProductoDto {
    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      tipoEnvase: producto.tipoEnvase,
      tipoProducto: producto.tipoProducto,
      unidadMedida: producto.unidadMedida,
    };
  }
}