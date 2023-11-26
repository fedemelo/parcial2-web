import { Test, TestingModule } from '@nestjs/testing';
import { PerformerEntity } from '../performer/performer.entity';
import { Repository } from 'typeorm';
import { AlbumEntity } from '../album/album.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AlbumPerformerService } from './album-performer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { ALBUM_NOT_FOUND, MAXIMUM_THREE_PERFORMERS, PERFORMER_NOT_FOUND } from '../shared/errors/error-messages';

describe('AlbumPerformerService', () => {
    let service: AlbumPerformerService;
    let albumRepository: Repository<AlbumEntity>;
    let performerRepository: Repository<PerformerEntity>;
    let album: AlbumEntity;
    let performersList: PerformerEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AlbumPerformerService],
        }).compile();

        service = module.get<AlbumPerformerService>(AlbumPerformerService);
        albumRepository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
        performerRepository = module.get<Repository<PerformerEntity>>(getRepositoryToken(PerformerEntity));

        await seedDatabase();
    });

    const seedDatabase = async () => {
        performerRepository.clear();
        albumRepository.clear();

        performersList = [];
        for (let i = 0; i < 5; i++) {
            const performer: PerformerEntity = await performerRepository.save({
                name: faker.lorem.word(),
                image: faker.internet.url(),
                description: faker.lorem.paragraph(),
            })
            performersList.push(performer);
        }

        album = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.paragraph(),
            performers: performersList
        })
    }

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('addPerformerToAlbum should add a performer to an album', async () => {
        const newPerformer: PerformerEntity = await performerRepository.save({
            name: faker.lorem.word(),
            image: faker.internet.url(),
            description: faker.lorem.paragraph(),
        });

        const newAlbum: AlbumEntity = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.paragraph(),
        })

        const result: AlbumEntity = await service.addPerformerToAlbum(newAlbum.id, newPerformer.id);

        expect(result.performers.length).toBe(1);
        expect(result.performers[0]).not.toBeNull();
        expect(result.performers[0].name).toBe(newPerformer.name)
        expect(result.performers[0].image).toBe(newPerformer.image)
        expect(result.performers[0].description).toBe(newPerformer.description)
    });

    it('addPerformerToAlbum should thrown an exception when the album already has three performers', async () => {
        const newPerformer: PerformerEntity = await performerRepository.save({
            name: faker.lorem.word(),
            image: faker.internet.url(),
            description: faker.lorem.paragraph(),
        });

        await expect(() => service.addPerformerToAlbum(album.id, newPerformer.id)).rejects.toHaveProperty("message", MAXIMUM_THREE_PERFORMERS);
    });

    it('addPerformerToAlbum should thrown an exception for an invalid performer', async () => {
        const newAlbum: AlbumEntity = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.paragraph(),
        })

        await expect(() => service.addPerformerToAlbum(newAlbum.id, "0")).rejects.toHaveProperty("message", PERFORMER_NOT_FOUND);
    });

    it('addPerformerToAlbum should throw an exception for an invalid album', async () => {
        const newPerformer: PerformerEntity = await performerRepository.save({
            name: faker.lorem.word(),
            code: faker.lorem.word().substring(0, 3).toUpperCase(),
            image: faker.lorem.word(),
            description: faker.lorem.word(),
        });

        await expect(() => service.addPerformerToAlbum("0", newPerformer.id)).rejects.toHaveProperty("message", ALBUM_NOT_FOUND);
    });

});