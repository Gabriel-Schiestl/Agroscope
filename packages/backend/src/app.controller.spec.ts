import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('getHello', () => {
        it('should respond with 200 and the greeting from AppService', () => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            appController.getHello(res as any);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith('Hello World!');
        });
    });
});
