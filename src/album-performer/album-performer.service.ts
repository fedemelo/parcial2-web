
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformerEntity } from '../performer/performer.entity';
import { AlbumEntity } from '../album/album.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AlbumPerformerService {

    PERFORMER_NOT_FOUND = "The performer with the given id was not found";
    ALBUM_NOT_FOUND = "The album with the given id was not found";
    MAXIMUM_THREE_PERFORMERS = "The album cannot have more than three performers associated to it";

    constructor(
        @InjectRepository(AlbumEntity)
        private readonly albumRepository: Repository<AlbumEntity>,

        @InjectRepository(PerformerEntity)
        private readonly performerRepository: Repository<PerformerEntity>
    ) { }

    async addPerformerToAlbum(albumId: string, performerId: string): Promise<AlbumEntity> {
        const performer: PerformerEntity = await this.performerRepository.findOne({ where: { id: performerId } });
        if (!performer)
            throw new BusinessLogicException(this.PERFORMER_NOT_FOUND, BusinessError.NOT_FOUND);

        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id: albumId }, relations: ["performers"] })
        if (!album)
            throw new BusinessLogicException(this.ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        if (album.performers.length >= 3)
            throw new BusinessLogicException(this.MAXIMUM_THREE_PERFORMERS, BusinessError.BAD_REQUEST);

        album.performers = [...album.performers, performer];
        return await this.albumRepository.save(album);
    }

}