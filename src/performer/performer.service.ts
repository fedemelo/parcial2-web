import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformerEntity } from './performer.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { DESCRIPTION_TOO_LONG, PERFORMER_NOT_FOUND } from '../shared/errors/error-messages';

@Injectable()
export class PerformerService {

    constructor(
        @InjectRepository(PerformerEntity)
        private performerRepository: Repository<PerformerEntity>,
    ) { }

    async findAll(): Promise<PerformerEntity[]> {
        return await this.performerRepository.find({ relations: ['albums'] });
    }

    async findOne(id: string): Promise<PerformerEntity> {
        const Performer: PerformerEntity = await this.performerRepository.findOne({ where: { id }, relations: ["albums"] });
        if (!Performer)
            throw new BusinessLogicException(PERFORMER_NOT_FOUND, BusinessError.NOT_FOUND);

        return Performer;
    }

    async create(Performer: PerformerEntity): Promise<PerformerEntity> {

        if (Performer.description.length > 100)
            throw new BusinessLogicException(DESCRIPTION_TOO_LONG, BusinessError.BAD_REQUEST);
        
        return await this.performerRepository.save(Performer);
    }

}
