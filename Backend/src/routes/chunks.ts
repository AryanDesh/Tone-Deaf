// If something doesnt work, check the asyncHandler and/or ffMpeg in chunking Function.

import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fs, { readdirSync } from 'fs';
import path from 'path';
import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma, s3 } from '../db';
import { PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer';

const chunkRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});

const upload = multer({ storage });


chunkRouter.get('/chunks', (req, res) => {
})

chunkRouter.post(
  '/chunks',
  upload.fields([
    { name: "mp3", maxCount: 1 },
    { name: "images", maxCount: 1 },
  ]),  async (req: Request, res: Response) => {
    const { title, artist, album } = req.body;
    // @ts-ignore
    const image = req.files?.images || "";

    // @ts-ignore
    const mp3File = req.files?.mp3 || "";   
    
    const genres: string[] = JSON.parse(req.body.genres);
   
    if (!mp3File && !title) {
      res.status(400).json({ msg: "Don't forget your MP3 file and/or title." });
      return ;
    }    
    try {
      const songExists = await prisma.song.findFirst({
        where: { title: title, artist: artist },
      });      
      if (songExists) {
        res.status(400).json({ msg: "We already got you, you Melomaniac!" });
        return; 
      }

      const duration = await extractDuration(mp3File[0].path);
      const addSong = await prisma.song.create({
        data: {
          title,
          artist,
          album,
          duration,
          tags: {
            create: genres.map((tag: string) => ({
              tag: {
                connectOrCreate: {
                  where: { tag },
                  create: { tag },
                },
              },
            })),
          },
        },
      });
      const filePath= path.join(__dirname, "../.." ,mp3File[0].path);
      const imagePath= path.join(__dirname, "../.." ,image[0].path);
      console.log(filePath);
      await chunking(addSong.id, filePath, imagePath);

      res.status(200).json({ msg: 'All processes completed!' });
      return;
    } catch (error) {
      console.error('Error in /chunks:', error);
      res.status(500).json({ msg: 'Internal server error.' });
      return;
    }
  }
);


export default chunkRouter;

const chunking = async (
    songId : string,
    filePath : string,
    imagePath: string
) => {
    const exec = promisify(execCallback);

    const tempFolder = path.join(__dirname, "../..", `./temp_chunks_${songId}`);
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
    }

    
    const imageExtension = path.extname(imagePath);
    if (!imageExtension) {
        throw new Error(`Unable to determine the file extension for image at ${imagePath}`);
    }

    const destinationImagePath = path.join(tempFolder, `${songId}${imageExtension}`);
    
    if (fs.existsSync(imagePath)) {
        fs.copyFileSync(imagePath, destinationImagePath);
        console.log(`Image copied to ${destinationImagePath}`);
    } else {
        console.error(`Image not found at path: ${imagePath}`);
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

            const uploadCommand = new PutObjectCommand({
              Bucket: 'Songs-Chunks',
              Key: `${songId}/${file}`,
              Body: fileBuffer,
            })

            await s3.send(uploadCommand)
            console.log("Completed uploading to Supabase Storage S3");
            return;
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
  const fileLoc = path.join(__dirname, "../.." ,filePath);
  console.log(fileLoc);
    try {
      const execAsync = promisify(execCallback);
      const ffmpegCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${fileLoc}"`;
      const { stdout } = await execAsync(ffmpegCmd);
      const metadata = JSON.parse(stdout);
      const format = metadata.format;
      const duration = Math.round(parseFloat(format.duration || '0'));  
      return duration
    } catch (error) {
      throw new Error(`Error extracting metadata: ${(error as Error).message}`);
    }
}
  