import { IsNotEmpty, IsString } from "class-validator";

export class PerformerDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly image: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

}
