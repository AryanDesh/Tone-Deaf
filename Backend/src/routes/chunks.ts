// If something doesnt work, check the asyncHandler and/or ffMpeg in chunking Function.

import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fs, { readdirSync } from 'fs';
import path from 'path';
import { Router } from 'express';
import { Request, Response } from 'express';
import { db, supabase } from '../db';
import { Song } from '@prisma/client';
import multer from 'multer';
import asyncHandler from 'express-async-handler';

const chunkRouter = Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

type input = {
    title : string,
    artist : string,
    album? : string,
    image? : File,
    genres : string[]
}

chunkRouter.post(
    '/chunks',
    upload.single('mp3'),
    asyncHandler(async (req: Request, res: Response) => {
      const obj: input = req.body;
  
      if (!req.file || !obj.title) {
        res.status(400).json({ msg: "Don't forget your MP3 file and/or title." });
        return; // Ensure early exit
      }
  
      try {
        const songExists = await db.song.findFirst({
          where: {
            title: obj.title,
            artist: obj.artist,
          },
        });
  
        if (songExists) {
          res
            .status(400)
            .json({ msg: "We already got you, you Melomaniac! Sit back and enjoy." });
          return; // Ensure early exit
        }
  
        const duration = await extractDuration(req.file.path);
        const addSong = await db.song.create({
          data: { ...obj, duration: duration },
        });
        console.log('Song added to DB:', addSong);
  
        await chunking(addSong.id, req.file.path);
  
        res
          .status(200)
          .json({ msg: 'All processes completed. Your song is ready for everyone to hear!' });
      } catch (e) {
        console.error('Error in /chunks:', e);
        res.status(500).json({ msg: 'Internal server error. Please try again later.' });
      }
    })
  );


export default chunkRouter;

const chunking = async (
    songId : string,
    filePath : string
) => {
    const exec = promisify(execCallback);
    const chunks: Buffer[] = [];

    const tempFolder = `./temp_chunks_${songId}`;
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
    }

    const outputFileName = path.join(tempFolder, `${songId}.m3u8`);
    const chunkFilePattern = path.join(tempFolder, `${songId}_chunk_%03d.ts`);    
    try {
        console.info('> Start processing the file:', new Date());

        const { stdout, stderr } = await exec(
            `ffmpeg -i "${filePath}" -vn -acodec copy -hls_time 10 -hls_segment_filename "${chunkFilePattern}" -hls_list_size 0 -f hls "${outputFileName}"`
        );

        if (stderr) {
            console.warn(`Warning during processing ${filePath}:`, stderr);
        }

        console.log(`Chunks and playlist created successfully for ${filePath}:`);
        console.log(`Playlist file: ${outputFileName}`);

        const files = readdirSync(tempFolder);
        files.forEach(async (file) => {
            const fileLoc = path.join(tempFolder, file);
            const fileBuffer = fs.readFileSync(fileLoc);

            const { data, error } = await supabase.storage
                .from('Songs-Chunks')
                .upload(`${songId}/${file}`, fileBuffer, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) {
                console.error(`Error uploading ${file} to Supabase:`, error.message);
            } else {
                console.log(`Uploaded ${file} to Supabase:`, data?.path);
            }
        })
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
    finally {
        fs.rmSync(tempFolder, { recursive: true, force: true });
        console.log(`Temporary folder ${tempFolder} deleted.`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Original file ${filePath} deleted after processing.`);
        }
    }
    
}



async function extractDuration(filePath: string): Promise<number> {
    try {
      const execAsync = promisify(execCallback);
      const ffmpegCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const { stdout } = await execAsync(ffmpegCmd);
      const metadata = JSON.parse(stdout);
      const format = metadata.format;
      const duration = Math.round(parseFloat(format.duration || '0'));  
      return duration
    } catch (error) {
      throw new Error(`Error extracting metadata: ${(error as Error).message}`);
    }
}
  