import { Test, TestingModule } from '@nestjs/testing';
import { AlbumService } from './album.service';
import { Repository } from 'typeorm';
import { AlbumEntity } from './album.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AlbumService', () => {
    let service: AlbumService;
    let repository: Repository<AlbumEntity>;
    let albumsList: AlbumEntity[];

    const ALBUM_DESCRIPTION_EMPTY: string = "The album description cannot be empty";
    const ALBUM_NOT_FOUND: string = "The album with the given id was not found";

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AlbumService],
        }).compile();

        service = module.get<AlbumService>(AlbumService);
        repository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
        await seedDatabase();
    });

    const seedDatabase = async () => {
        repository.clear();
        albumsList = [];
        for (let i = 0; i < 5; i++) {
            const album: AlbumEntity = await repository.save({
                name: faker.lorem.word(),
                albumCover: faker.lorem.paragraph(),
                releaseDate: faker.date.past(),
                description: faker.internet.url()
            })
            albumsList.push(album);

        }
    }

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return a all albums', async () => {
        const albums: AlbumEntity[] = await service.findAll();
        expect(albums).not.toBeNull();
        expect(albums).toHaveLength(albumsList.length);
    });

    it('findOne should return a album by id', async () => {
        const storedAlbum: AlbumEntity = albumsList[0];
        const album: AlbumEntity = await service.findOne(storedAlbum.id);
        expect(album).not.toBeNull();
        expect(album.id).toEqual(storedAlbum.id);
        expect(album.name).toEqual(storedAlbum.name);
        expect(album.albumCover).toEqual(storedAlbum.albumCover);
        expect(album.releaseDate).toEqual(storedAlbum.releaseDate);
        expect(album.description).toEqual(storedAlbum.description);
    });

    it('findOne should throw an exception when album id does not exist', async () => {
        await expect(service.findOne('0')).rejects.toHaveProperty('message', ALBUM_NOT_FOUND);
    });

    it('create should return a new album', async () => {
        const album: AlbumEntity = {
            id: "",
            name: faker.lorem.word(),
            albumCover: faker.lorem.paragraph(),
            releaseDate: faker.date.past(),
            description: faker.internet.url(),
            performers: [],
            tracks: []
        }
        const newAlbum: AlbumEntity = await service.create(album);
        expect(newAlbum).not.toBeNull();

        const storedAlbum: AlbumEntity = await repository.findOne({ where: { id: newAlbum.id } })
        expect(storedAlbum).not.toBeNull();
        expect(storedAlbum.id).toEqual(newAlbum.id);
        expect(storedAlbum.name).toEqual(newAlbum.name);
        expect(storedAlbum.albumCover).toEqual(newAlbum.albumCover);
        expect(storedAlbum.releaseDate).toEqual(newAlbum.releaseDate);
        expect(storedAlbum.description).toEqual(newAlbum.description);
    });

    it('create should throw an exception when description is empty', async () => {
        const album: AlbumEntity = {
            id: "",
            name: faker.lorem.word(),
            albumCover: faker.lorem.paragraph(),
            releaseDate: faker.date.future(),
            description: "",
            performers: [],
            tracks: []
        }
        await expect(service.create(album)).rejects.toHaveProperty('message', ALBUM_DESCRIPTION_EMPTY);
    });

});
