import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(OrmConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
