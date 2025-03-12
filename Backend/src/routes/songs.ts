import { Router } from "express";
import { prisma } from "../db";

const songRouter  = Router();

// ToDOs: User Recent Songs, Recommended Songs. Both routes need to be authenticated.

songRouter.post('/findsong', async(req, res) => {
    const songName = req.body.songName ;
    try{
        
        const songs = await prisma.song.findMany({
            where: {
                title: {
                    contains: songName,
                    mode: 'insensitive',
                },
            },
        });
        if(!songs){
            res.status(400).json({msg : "No songs found"})
        }
        res.status(200).json(songs);
    }catch(e){
        res.status(500).json({ message : "Internal Server Error"})
    }
    
})


// all songs ,
songRouter.get('/allsongs', async(req, res) =>{
    const allSongs = await prisma.song.findMany();
    if(!allSongs) res.status(400).json({msg : "No songs found"})
    res.status(200).json(allSongs);
})


songRouter.get('/filter', async(req, res) => {
    const { tags } = req.query;

  if (!tags || typeof tags !== 'string') {
    res.status(400).json({ error: 'Please provide a valid list of tags.' });
    return 
  }

  try {
    const tagList = tags.split(',').map((tag) => tag.trim());

    const songs = await prisma.song.findMany({
      where: {
        tags: {
          some: {
            tag: {
              tag: {
                in: tagList,
              },
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    res.status(200).json(songs);
    return 
  } catch (error) {
    console.error('Error filtering songs by tags:', error);
    res.status(500).json({ error: 'Failed to fetch songs by tags.' });
    return
  }
})

export default songRouter;