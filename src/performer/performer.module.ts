import { Module } from '@nestjs/common';
import { PerformerService } from './performer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformerEntity } from './performer.entity';

@Module({
    providers: [PerformerService],
    imports: [TypeOrmModule.forFeature([PerformerEntity])],
    controllers: [],
})
export class PerformerModule { }
