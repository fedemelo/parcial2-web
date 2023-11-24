import { Module } from '@nestjs/common';
import { AlbumPerformerService } from './album-performer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from '../album/album.entity';
import { PerformerEntity } from '../performer/performer.entity';

@Module({
    providers: [AlbumPerformerService],
    imports: [TypeOrmModule.forFeature([AlbumEntity, PerformerEntity])],
    controllers: [],
})
export class AlbumPerformerModule { }
