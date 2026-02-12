import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('ALMACEN') 
export class Almacen {
  @PrimaryColumn({ 
    type: 'varchar', 
    length: 20  
  })
  id: string;

  @Column({ 
    name: 'NOMBRE',
    type: 'varchar', 
    length: 50
  })
  nombre: string;

  @Column({ 
    name: 'UBICACION',
    type: 'varchar', 
    length: 180
  })
  ubicacion: string;

  @Column({
    name: 'TIPO_ALMACEN',
    type: 'varchar',
    length: 50
  })
  tipoAlmacen: string; 

  @Column({
    name: 'ESTADO',
    type: 'varchar',
    length: 50,
    default: 'activo'  
  })
  estado: string;  
}