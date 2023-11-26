import { Test, TestingModule } from '@nestjs/testing';
import { TrackService } from './track.service';
import { Repository } from 'typeorm';
import { TrackEntity } from './track.entity';
import { AlbumEntity } from '../album/album.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { ALBUM_NOT_FOUND, TRACK_NOT_FOUND, NON_POSITIVE_DURATION, NO_TRACK_IN_ALBUM } from '../shared/errors/error-messages';

describe('TrackService', () => {
    let service: TrackService;
    let repository: Repository<TrackEntity>;
    let albumRepository: Repository<AlbumEntity>;
    let album: AlbumEntity;
    let tracksList: TrackEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [TrackService],
        }).compile();

        service = module.get<TrackService>(TrackService);
        repository = module.get<Repository<TrackEntity>>(getRepositoryToken(TrackEntity));
        albumRepository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
        await seedDatabase();
    });

    const seedDatabase = async () => {
        albumRepository.clear();
        album = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.word(),
            tracks: []
        })

        repository.clear();
        tracksList = [];
        for (let i = 0; i < 5; i++) {
            const track: TrackEntity = await repository.save({
                name: faker.lorem.word(),
                duration: faker.number.int(),
                album: album
            })
            tracksList.push(track);
        }

        album.tracks = tracksList;
    }

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return a all tracks associated to an album', async () => {
        const tracks: TrackEntity[] = await service.findAll(album.id);
        expect(tracks).not.toBeNull();
        expect(tracks).toHaveLength(tracksList.length);
    });

    it('findAll should return an empty array when there are no tracks', async () => {
        const album: AlbumEntity = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.word(),
            tracks: []
        })
        const tracks: TrackEntity[] = await service.findAll(album.id);
        expect(tracks).not.toBeNull();
        expect(tracks).toHaveLength(0);
    });

    it('findOne should return a track by id', async () => {
        const storedTrack: TrackEntity = tracksList[0];
        const track: TrackEntity = await service.findOne(album.id, storedTrack.id);
        expect(track).not.toBeNull();
        expect(track.id).toEqual(storedTrack.id);
        expect(track.name).toEqual(storedTrack.name);
        expect(track.duration).toEqual(storedTrack.duration);
    });

    it('findOne should throw an exception when track id does not exist', async () => {
        await expect(service.findOne(album.id, '0')).rejects.toHaveProperty('message', TRACK_NOT_FOUND);
    });

    it('findOne should throw an exception when album id does not exist', async () => {
        await expect(service.findOne('0', '0')).rejects.toHaveProperty('message', ALBUM_NOT_FOUND);
    });

    it('findOne should throw an exception when track id is not associated to the album', async () => {
        const album: AlbumEntity = await albumRepository.save({
            name: faker.lorem.word(),
            albumCover: faker.internet.url(),
            releaseDate: faker.date.past(),
            description: faker.lorem.word(),
            tracks: []
        })
        const track: TrackEntity = await repository.save({
            name: faker.lorem.word(),
            duration: faker.number.int(),
            album: null
        })

        await expect(service.findOne(album.id, track.id)).rejects.toHaveProperty('message', NO_TRACK_IN_ALBUM);
    });

    it('create should add a new track to an album', async () => {
        const newTrack: TrackEntity = await service.create(album.id, tracksList[0]);

        expect(newTrack).not.toBeNull();
        expect(newTrack.id).not.toBeNull();
        expect(newTrack.name).not.toBeNull();
        expect(newTrack.duration).not.toBeNull();
    });

    it('create should throw an exception when album id does not exist', async () => {
        await expect(service.create('0', tracksList[0])).rejects.toHaveProperty('message', ALBUM_NOT_FOUND);
    });

    it('create should throw an exception when track duration is not positive', async () => {
        await expect(service.create(album.id, { ...tracksList[0], duration: -1 })).rejects.toHaveProperty('message', NON_POSITIVE_DURATION);
    });

});
