import { TrackService } from './track.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackEntity } from './track.entity';
import { AlbumEntity } from 'src/album/album.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TrackEntity, AlbumEntity])],
    controllers: [],
    providers: [TrackService],
})
export class TrackModule { }
