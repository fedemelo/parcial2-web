import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumEntity } from '../album/album.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { TrackEntity } from './track.entity';

@Injectable()
export class TrackService {

    ALBUM_NOT_FOUND: string = "The album with the given id was not found";
    TRACK_NOT_FOUND: string = "The track with the given id was not found";
    NO_TRACK_IN_ALBUM: string = "The track with the given id is not associated to the album";
    NON_POSITIVE_DURATION: string = "The duration must be a positive number";

    constructor(
        @InjectRepository(TrackEntity)
        private readonly trackRepository: Repository<TrackEntity>,

        @InjectRepository(AlbumEntity)
        private albumRepository: Repository<AlbumEntity>
    ) { }
    

    async findAll(albumId: string): Promise<TrackEntity[]> {
        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id: albumId }, relations: ["performers", "tracks"] });
        if (!album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        return album.tracks;
    }

    async findOne(albumId: string, trackId: string): Promise<TrackEntity> {
        const album = await this.albumRepository.findOne({ where: {id: albumId},  relations: ["performers", "tracks"] });
        if (!album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        const track = await this.trackRepository.findOne({where: {id: trackId}});
        if (!track)
            throw new BusinessLogicException(this.TRACK_NOT_FOUND, BusinessError.NOT_FOUND)

        const trackalbum = album.tracks.find(e => e.id === track.id);
        if (!trackalbum)
            throw new BusinessLogicException(this.NO_TRACK_IN_ALBUM, BusinessError.NOT_FOUND)

        return track;
    }

    async create(albumId: string, track: TrackEntity): Promise<TrackEntity> {

        const album = await this.albumRepository.findOne({where: {id: albumId}});
        if (!album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        if (track.duration <= 0)
            throw new BusinessLogicException(this.NON_POSITIVE_DURATION, BusinessError.BAD_REQUEST);

        track.album = album;

        return await this.trackRepository.save(track);
    }

}
