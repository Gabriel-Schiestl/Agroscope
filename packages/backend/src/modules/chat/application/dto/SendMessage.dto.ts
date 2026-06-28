import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
    @IsString()
    @MinLength(1)
    content: string;

    @IsString()
    @MinLength(1)
    sessionId: string;
}
