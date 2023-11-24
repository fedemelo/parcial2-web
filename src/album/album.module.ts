import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from './album.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AlbumEntity])],
    controllers: [],
    providers: [AlbumService],
})
export class AlbumModule { }
