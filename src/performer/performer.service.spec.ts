import { Test, TestingModule } from '@nestjs/testing';
import { PerformerService } from './performer.service';
import { Repository } from 'typeorm';
import { PerformerEntity } from './performer.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { DESCRIPTION_TOO_LONG, PERFORMER_NOT_FOUND } from '../shared/errors/error-messages';

describe('PerformerService', () => {
    let service: PerformerService;
    let repository: Repository<PerformerEntity>;
    let performersList: PerformerEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PerformerService],
        }).compile();

        service = module.get<PerformerService>(PerformerService);
        repository = module.get<Repository<PerformerEntity>>(getRepositoryToken(PerformerEntity));
        await seedDatabase();
    });

    const seedDatabase = async () => {
        repository.clear();
        performersList = [];
        for (let i = 0; i < 5; i++) {
            const performer: PerformerEntity = await repository.save({
                name: faker.lorem.word(),
                image: faker.internet.url(),
                description: faker.lorem.word(),
            })
            performersList.push(performer);
        }
    }

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return a all performers', async () => {
        const performers: PerformerEntity[] = await service.findAll();
        expect(performers).not.toBeNull();
        expect(performers).toHaveLength(performersList.length);
    });

    it('findAll should return an empty array when there are no performers', async () => {
        repository.clear();
        const performers: PerformerEntity[] = await service.findAll();
        expect(performers).not.toBeNull();
        expect(performers).toHaveLength(0);
    });

    it('findOne should return a performer by id', async () => {
        const storedPerformer: PerformerEntity = performersList[0];
        const performer: PerformerEntity = await service.findOne(storedPerformer.id);
        expect(performer).not.toBeNull();
        expect(performer.id).toEqual(storedPerformer.id);
        expect(performer.name).toEqual(storedPerformer.name);
        expect(performer.image).toEqual(storedPerformer.image);
        expect(performer.description).toEqual(storedPerformer.description);
    });

    it('findOne should throw an exception when performer id does not exist', async () => {
        await expect(service.findOne('0')).rejects.toHaveProperty('message', PERFORMER_NOT_FOUND);
    });

    it('create should return a new performer', async () => {
        const performer: PerformerEntity = {
            id: "",
            name: faker.lorem.word(),
            image: faker.internet.url(),
            description: faker.lorem.word(),
            albums: []
        }
        const newPerformer: PerformerEntity = await service.create(performer);
        expect(newPerformer).not.toBeNull();

        const storedPerformer: PerformerEntity = await repository.findOne({ where: { id: newPerformer.id } })
        expect(storedPerformer).not.toBeNull();
        expect(storedPerformer.id).toEqual(newPerformer.id);
        expect(storedPerformer.name).toEqual(newPerformer.name);
        expect(storedPerformer.image).toEqual(newPerformer.image);
        expect(storedPerformer.description).toEqual(newPerformer.description);

    });

    it('create should throw an exception when performer description is too long', async () => {
        const performer: PerformerEntity = {
            id: "",
            name: faker.lorem.word(),
            image: faker.internet.url(),
            description: faker.lorem.paragraphs(10),
            albums: []
        }
        await expect(service.create(performer)).rejects.toHaveProperty('message', DESCRIPTION_TOO_LONG);
    });

});
