import { PrismaClient } from "@prisma/client";
declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

if(process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Supabase client seperately for storage.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_S3_ACCESS_KEY || "";

console.log(supabaseKey + " " + supabaseUrl );
// if (!supabaseUrl || !supabaseKey) {
//     throw new Error("Supabase URL or Key is missing!");
// }

export const s3 = new S3Client({
    forcePathStyle: true,
    region: 'ap-south-1',
    endpoint: process.env.S3_CONNECTION_URL,
    credentials: {
      accessKeyId: process.env.SUPABASE_S3_ACCESS_ID || "",
      secretAccessKey: process.env.SUPABASE_S3_ACCESS_KEY || "",
    }
});
