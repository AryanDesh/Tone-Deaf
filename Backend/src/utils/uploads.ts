import { db } from "../db";
import fs from "fs";
import path from "path";

const chunksDir = path.join(__dirname, '../temp/chunks');
const songsDir = path.join(__dirname, '../../public');

const chunks = fs.readdirSync(chunksDir);
const songs = fs.readdirSync(songsDir);


songs.forEach((song) => {
    chunks.forEach(chunks => {
        
    })
})
// const { data, error } = await supabase.storage
//   .from('avatars')
//   .upload('public/avatar1.png', )

