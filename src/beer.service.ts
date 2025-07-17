import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Brak wymaganych zmiennych środowiskowych SUPABASE_URL lub SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function createSupabaseForUser(token?: string) {
  if (token) {
    return createClient(supabaseUrl as string, supabaseKey as string, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
  }
  return createClient(supabaseUrl as string, supabaseKey as string);
}

@Injectable()
export class BeerService {
  async addBeer(createBeerDto: any) {
    const { name, brewery_id, style_id, abv, score, color, notes, photo_url, plato, add_notes } = createBeerDto;
    const { data, error } = await supabase
      .from('beers')
      .insert([
        { name, brewery_id, style_id, abv, score, color, notes, photo_url, plato, add_notes }
      ])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async uploadPhoto(file: Express.Multer.File): Promise<string> {
    const bucket = 'beer-photos'; // zmień jeśli inna nazwa
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) {
      throw new Error(error.message);
    }
    // Pobierz publiczny URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }

  async getAllBeers() {
    const { data, error } = await supabase
      .from('beers')
      .select('*, breweries(name), styles(name)')
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async getBeerById(id: string) {
    const { data, error } = await supabase
      .from('beers')
      .select('*, breweries(name), styles(name)')
      .eq('id', id)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async updateBeer(id: string, updateBeerDto: any, token?: string) {
    // Tworzę nowy obiekt tylko z dozwolonymi polami
    const { name, brewery_id, style_id, abv, score, color, notes, photo_url, plato, add_notes } = updateBeerDto;
    const updateObj: any = { name, brewery_id, style_id, abv, score, color, notes, photo_url, plato, add_notes };
    // Usuwam undefined
    Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);
    const supabaseUser = createSupabaseForUser(token);
    console.log('updateBeer', { id, updateObj });
    const { data, error } = await supabaseUser
      .from('beers')
      .update(updateObj)
      .eq('id', id)
      .select();
    console.log('updateBeer response', { data, error });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async getStats() {
    // Pobierz wszystkie piwa z joinem do breweries
    const { data: beers, error } = await supabase
      .from('beers')
      .select('*, breweries(name)');
    if (error) {
      throw new Error(error.message);
    }
    const totalBeers = beers.length;
    const averageScore = beers.length > 0 ? (beers.reduce((sum, b) => sum + (b.score || 0), 0) / beers.length).toFixed(2) : 0;
    const now = new Date();
    const thisMonthCount = beers.filter(b => {
      const created = new Date(b.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    // policz najczęściej występujący browar po brewery_id
    const breweryCount: Record<number, number> = {};
    beers.forEach(b => {
      if (b.brewery_id) breweryCount[b.brewery_id] = (breweryCount[b.brewery_id] || 0) + 1;
    });
    let favoriteBrewerId: number | null = null;
    let maxCount = 0;
    for (const [breweryId, count] of Object.entries(breweryCount)) {
      if (count > maxCount) {
        favoriteBrewerId = Number(breweryId);
        maxCount = count;
      }
    }
    // znajdź nazwę browaru po id
    let favoriteBrewerName: string | null = null;
    if (favoriteBrewerId) {
      const found = beers.find(b => b.brewery_id === favoriteBrewerId);
      favoriteBrewerName = found?.breweries?.name || null;
    }
    return {
      totalBeers,
      averageScore: Number(averageScore),
      thisMonthCount,
      favoriteBrewer: favoriteBrewerName
    };
  }

  async getLastBeer() {
    const { data, error } = await supabase
      .from('beers')
      .select('*, breweries(name), styles(name)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async addBrewery(createBreweryDto: any, token?: string) {
    const { name, country } = createBreweryDto;
    const supabaseUser = createSupabaseForUser(token);
    const { data, error } = await supabaseUser
      .from('breweries')
      .insert([{ name, country }])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async updateBrewery(id: string, updateBreweryDto: any, token?: string) {
    const supabaseUser = createSupabaseForUser(token);
    const numericId = Number(id);
    console.log('updateBrewery', { id, numericId, type: typeof numericId, updateBreweryDto, token });
    const { data, error } = await supabaseUser
      .from('breweries')
      .update(updateBreweryDto)
      .eq('id', numericId)
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  async addStyle(createStyleDto: any, token?: string) {
    const { name } = createStyleDto;
    const supabaseUser = createSupabaseForUser(token);
    const { data, error } = await supabaseUser
      .from('styles')
      .insert([{ name }])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async updateStyle(id: string, updateStyleDto: any, token?: string) {
    const supabaseUser = createSupabaseForUser(token);
    const numericId = Number(id);
    console.log('updateStyle', { id, numericId, type: typeof numericId, updateStyleDto, token });
    const { data, error } = await supabaseUser
      .from('styles')
      .update(updateStyleDto)
      .eq('id', numericId)
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error('Not found or no permission to update this style');
    }
    return data;
  }
} 