
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformerEntity } from '../performer/performer.entity';
import { AlbumEntity } from '../album/album.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ALBUM_NOT_FOUND, MAXIMUM_THREE_PERFORMERS, PERFORMER_NOT_FOUND } from '../shared/errors/error-messages';

@Injectable()
export class AlbumPerformerService {

    constructor(
        @InjectRepository(AlbumEntity)
        private readonly albumRepository: Repository<AlbumEntity>,

        @InjectRepository(PerformerEntity)
        private readonly performerRepository: Repository<PerformerEntity>
    ) { }

    async addPerformerToAlbum(albumId: string, performerId: string): Promise<AlbumEntity> {
        const performer: PerformerEntity = await this.performerRepository.findOne({ where: { id: performerId } });
        if (!performer)
            throw new BusinessLogicException(PERFORMER_NOT_FOUND, BusinessError.NOT_FOUND);

        const album: AlbumEntity = await this.albumRepository.findOne({ where: { id: albumId }, relations: ["performers"] })
        if (!album)
            throw new BusinessLogicException(ALBUM_NOT_FOUND, BusinessError.NOT_FOUND);

        if (album.performers.length >= 3)
            throw new BusinessLogicException(MAXIMUM_THREE_PERFORMERS, BusinessError.BAD_REQUEST);

        album.performers = [...album.performers, performer];
        return await this.albumRepository.save(album);
    }

}