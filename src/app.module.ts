import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AlbumEntity } from './album/album.entity';
import { PerformerEntity } from './performer/performer.entity';
import { TrackEntity } from './track/track.entity';

import { AlbumModule } from './album/album.module';
import { PerformerModule } from './performer/performer.module';
import { TrackModule } from './track/track.module';
import { AlbumPerformerModule } from './album-performer/album-performer.module';

@Module({
  imports: [AlbumModule, PerformerModule, TrackModule,
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    database: 'albums',
    entities: [AlbumEntity, PerformerEntity, TrackEntity],
    dropSchema: true,
    synchronize: true,
    keepConnectionAlive: true,
  }),
  AlbumPerformerModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
