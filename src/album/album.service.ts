import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumEntity } from './album.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ALBUM_DESCRIPTION_EMPTY, ALBUM_HAS_TRACKS, ALBUM_NAME_EMPTY, ALBUM_NOT_FOUND } from '../shared/errors/error-messages';

@Injectable()
export class AlbumService {

    constructor(
        @InjectRepository(AlbumEntity)
        private albumRepository: Repository<AlbumEntity>,
    ) { }

    async findOne(id: string): Promise<AlbumEntity> {
        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id }, relations: ["performers", "tracks"] });
        if (!album)
            throw new BusinessLogicException(ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        return album;
    }

    async findAll(): Promise<AlbumEntity[]> {
        return await this.albumRepository.find({ relations: ["performers", "tracks"] });
    }

    async create(albumEntity: AlbumEntity): Promise<AlbumEntity> {

        if (albumEntity.name.length == 0)
            throw new BusinessLogicException(ALBUM_NAME_EMPTY, BusinessError.BAD_REQUEST);

        if (albumEntity.description.length == 0)
            throw new BusinessLogicException(ALBUM_DESCRIPTION_EMPTY, BusinessError.BAD_REQUEST);

        return await this.albumRepository.save(albumEntity);
    }

    async delete(id: string) {
        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id }, relations: ["performers", "tracks"] });

        if (!album)
            throw new BusinessLogicException(ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        if (album.tracks.length > 0)
            throw new BusinessLogicException(ALBUM_HAS_TRACKS, BusinessError.BAD_REQUEST);

        await this.albumRepository.remove(album);
    }
}
