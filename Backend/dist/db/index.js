"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = globalThis.prisma || new client_1.PrismaClient({
// log: ['query', 'info', 'warn', 'error'],
});
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = exports.prisma;
// Supabase client seperately for storage.
const client_s3_1 = require("@aws-sdk/client-s3");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_S3_ACCESS_KEY || "";
console.log(supabaseKey + " " + supabaseUrl);
// if (!supabaseUrl || !supabaseKey) {
//     throw new Error("Supabase URL or Key is missing!");
// }
exports.s3 = new client_s3_1.S3Client({
    forcePathStyle: true,
    region: 'ap-south-1',
    endpoint: process.env.S3_CONNECTION_URL,
    credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_ID || "",
        secretAccessKey: process.env.SUPABASE_S3_ACCESS_KEY || "",
    }
});
