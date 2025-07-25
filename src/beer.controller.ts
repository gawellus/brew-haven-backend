import { Controller, Post, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors, Get, Param, Put, Patch, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BeerService } from './beer.service';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

@Controller('beers')
export class BeerController {
  constructor(private readonly beerService: BeerService) {}

  @Post()
  async addBeer(@Body() createBeerDto: any) {
    try {
      const beer = await this.beerService.addBeer(createBeerDto);
      return beer;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    try {
      const photoUrl = await this.beerService.uploadPhoto(file);
      return { url: photoUrl };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('breweries')
  async addBrewery(@Body() createBreweryDto: any, @Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '');
      const brewery = await this.beerService.addBrewery(createBreweryDto, token);
      return brewery;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('breweries/:id')
  async updateBrewery(@Param('id') id: string, @Body() updateBreweryDto: any, @Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '');
      const brewery = await this.beerService.updateBrewery(id, updateBreweryDto, token);
      return brewery;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('styles')
  async addStyle(@Body() createStyleDto: any, @Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '');
      const style = await this.beerService.addStyle(createStyleDto, token);
      return style;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('styles/:id')
  async updateStyle(@Param('id') id: string, @Body() updateStyleDto: any, @Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '');
      const style = await this.beerService.updateStyle(id, updateStyleDto, token);
      return style;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await this.beerService.getStats();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllBeers() {
    try {
      return await this.beerService.getAllBeers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('last')
  async getLastBeer() {
    try {
      return await this.beerService.getLastBeer();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('breweries')
  async getBreweries() {
    const { data, error } = await supabase.from('breweries').select('*').order('name');
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  @Get('styles')
  async getStyles() {
    const { data, error } = await supabase.from('styles').select('*').order('name');
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  @Get(':id')
  async getBeerById(@Param('id') id: string) {
    try {
      return await this.beerService.getBeerById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateBeer(@Param('id') id: string, @Body() updateBeerDto: any, @Headers('authorization') auth: string) {
    try {
      const token = auth?.replace('Bearer ', '');
      const beer = await this.beerService.updateBeer(id, updateBeerDto, token);
      return beer;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 