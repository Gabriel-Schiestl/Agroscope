import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from 'ormconfig';
import { CoreModule } from './modules/core/core.module';

@Module({
  imports: [TypeOrmModule.forRoot(OrmConfig), CoreModule],
})
export class AppModule {}
