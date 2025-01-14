import { Router } from "express";
import { prisma } from "../db";

const temp  = Router();

// single song, req contains name of the song return uuid.
temp.post('/findsong', async(req, res) => {
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
temp.get('/allsongs', async(req, res) =>{
    const allSongs = await prisma.song.findMany();
    if(!allSongs) res.status(400).json({msg : "No songs found"})
    res.status(200).json(allSongs);
})

export default temp;