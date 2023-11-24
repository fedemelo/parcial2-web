import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumEntity } from './album.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AlbumService {

    ALBUM_NAME_EMPTY: string = "The album name cannot be empty";
    ALBUM_DESCRIPTION_EMPTY: string = "The album description cannot be empty";
    ALBUM_NOT_FOUND: string = "The album with the given id was not found";

    constructor(
        @InjectRepository(AlbumEntity)
        private albumRepository: Repository<AlbumEntity>,
    ) { }

    async findOne(id: string): Promise<AlbumEntity> {
        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id }, relations: ["performers", "tracks"] });
        if (!album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        return album;
    }

    async findAll(): Promise<AlbumEntity[]> {
        return await this.albumRepository.find({ relations: ["performers", "tracks"] });
    }

    async create(albumEntity: AlbumEntity): Promise<AlbumEntity> {

        if (albumEntity.name.length == 0)
            throw new BusinessLogicException(this.ALBUM_NAME_EMPTY, BusinessError.BAD_REQUEST);

        if (albumEntity.description.length == 0)
            throw new BusinessLogicException(this.ALBUM_DESCRIPTION_EMPTY, BusinessError.BAD_REQUEST);

        return await this.albumRepository.save(albumEntity);
    }

    async delete(id: string) {
        const Album: AlbumEntity = await this.albumRepository.findOne({ where: { id } });
        if (!Album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        await this.albumRepository.remove(Album);
    }
}
