import { PrismaClient } from "@prisma/client";
declare global {
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

if(process.env.NODE_ENV !== 'production') globalThis.prisma = db

// Supabase client seperately for storage.
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://zsjqscvinjtidjauquzi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);