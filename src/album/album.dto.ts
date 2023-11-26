import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class AlbumDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly albumCover: string;

    @IsString()
    @IsNotEmpty()
    @IsDateString()
    readonly releaseDate: Date;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

}
