import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from 'PublicRoutes';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get('hello')
    getHello(@Res() res: any) {
        const result = this.appService.getHello();
        res.status(200).json(result);
    }
}
