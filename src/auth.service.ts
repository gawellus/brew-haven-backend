import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

@Injectable()
export class AuthService {
  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    return data;
  }

  async getUser(access_token: string) {
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error) throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    return data.user;
  }
} 