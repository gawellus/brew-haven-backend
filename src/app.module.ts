import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeerController } from './beer.controller';
import { BeerService } from './beer.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  controllers: [AppController, BeerController, AuthController],
  providers: [AppService, BeerService, AuthService],
})
export class AppModule {}
