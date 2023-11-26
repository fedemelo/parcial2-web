import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class TrackDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsPositive()
    readonly duration: number;

}
