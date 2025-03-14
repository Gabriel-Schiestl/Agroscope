import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { SicknessDto } from './Sickness.dto';

export class HistoryDto {
    @IsString()
    id: string;

    @IsString()
    handling: string;

    @IsString()
    image: string;

    @Type(() => SicknessDto)
    sickness: SicknessDto;
}
