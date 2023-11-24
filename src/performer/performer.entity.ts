
import { AlbumEntity } from '../album/album.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PerformerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    image: string;

    @Column()
    description: string;

    @ManyToMany(() => AlbumEntity, album => album.performers)
    albums: AlbumEntity[];
}
