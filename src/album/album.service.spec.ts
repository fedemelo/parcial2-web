import { Test, TestingModule } from '@nestjs/testing';
import { AlbumService } from './album.service';
import { Repository } from 'typeorm';
import { AlbumEntity } from './album.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { ALBUM_DESCRIPTION_EMPTY, ALBUM_NAME_EMPTY, ALBUM_NOT_FOUND, ALBUM_HAS_TRACKS } from '../shared/errors/error-messages';
import { TrackEntity } from '../track/track.entity';

describe('AlbumService', () => {
    let service: AlbumService;
    let repository: Repository<AlbumEntity>;
    let trackRepository: Repository<TrackEntity>;
    let albumsList: AlbumEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AlbumService],
        }).compile();

        service = module.get<AlbumService>(AlbumService);
        repository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
        trackRepository = module.get<Repository<TrackEntity>>(getRepositoryToken(TrackEntity));
        await seedDatabase();
    });

    const seedDatabase = async () => {

        repository.clear();
        albumsList = [];
        for (let i = 0; i < 5; i++) {
            const album: AlbumEntity = await repository.save({
                name: faker.lorem.word(),
                albumCover: faker.internet.url(),
                releaseDate: faker.date.past(),
                description: faker.lorem.word(),
                tracks: [],
                performers: []
            })
            albumsList.push(album);
        }

    }

    it('should be defined', () => {
        expect(service).toBeDefined();
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
        expect(album.performers).toEqual(storedAlbum.performers);
        expect(album.tracks).toEqual(storedAlbum.tracks);
    });

    it('findOne should throw an exception when album id does not exist', async () => {
        await expect(service.findOne('0')).rejects.toHaveProperty('message', ALBUM_NOT_FOUND);
    });

    it('findAll should return all albums', async () => {
        const albums: AlbumEntity[] = await service.findAll();
        expect(albums).not.toBeNull();
        expect(albums).toHaveLength(albumsList.length);
    });

    it('findAll should return an empty array when there are no albums', async () => {
        await repository.clear();
        const albums: AlbumEntity[] = await service.findAll();
        expect(albums).not.toBeNull();
        expect(albums).toHaveLength(0);
    });

    it('create should return a new album', async () => {
        const album: AlbumEntity = {
            id: "",
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.word(),
            performers: [],
            tracks: []
        }
        const newAlbum: AlbumEntity = await service.create(album);
        expect(newAlbum).not.toBeNull();

        const storedAlbum: AlbumEntity = await repository.findOne({ where: { id: newAlbum.id }, relations: ["performers", "tracks"]})
        expect(storedAlbum).not.toBeNull();
        expect(storedAlbum.id).toEqual(newAlbum.id);
        expect(storedAlbum.name).toEqual(newAlbum.name);
        expect(storedAlbum.albumCover).toEqual(newAlbum.albumCover);
        expect(storedAlbum.releaseDate).toEqual(newAlbum.releaseDate);
        expect(storedAlbum.description).toEqual(newAlbum.description);
        expect(storedAlbum.performers).toEqual(newAlbum.performers);
        expect(storedAlbum.tracks).toEqual(newAlbum.tracks);
    });

    it('create should throw an exception when description is empty', async () => {
        const album: AlbumEntity = {
            id: "",
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: "",
            performers: [],
            tracks: []
        }
        await expect(service.create(album)).rejects.toHaveProperty('message', ALBUM_DESCRIPTION_EMPTY);
    });

    it('create should throw an exception when name is empty', async () => {
        const album: AlbumEntity = {
            id: "",
            name: "",
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.word(),
            performers: [],
            tracks: []
        }
        await expect(service.create(album)).rejects.toHaveProperty('message', ALBUM_NAME_EMPTY);
    });

    it('delete should remove an album', async () => {
        const album: AlbumEntity = albumsList[0];
        await service.delete(album.id);
        const storedAlbum: AlbumEntity = await repository.findOne({ where: { id: album.id } })
        expect(storedAlbum).toBeNull();
    });

    it('delete should throw an exception when album id does not exist', async () => {
        await expect(service.delete('0')).rejects.toHaveProperty('message', ALBUM_NOT_FOUND);
    });

    it('delete should throw an exception when album has tracks associated to it', async () => {
        const album: AlbumEntity = albumsList[0];

        const track: TrackEntity = await trackRepository.save({
            name: faker.lorem.word(),
            duration: faker.number.int(),
            album: album,
        });

        album.tracks  = [track];
        await expect(service.delete(album.id)).rejects.toHaveProperty('message', ALBUM_HAS_TRACKS);
    });

});
