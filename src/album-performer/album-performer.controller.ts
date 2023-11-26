import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { AlbumPerformerService } from './album-performer.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';

@Controller('albums')
@UseInterceptors(BusinessErrorsInterceptor)
export class AlbumPerformerController {
    constructor(private readonly albumPerformerService: AlbumPerformerService) { }

    @Post(':albumId/performers/:performerId')
    async addPerformerAlbum(@Param('albumId') albumId: string, @Param('performerId') performerId: string) {
        return await this.albumPerformerService.addPerformerToAlbum(albumId, performerId);
    }

}
