import { Router } from "express";
import { prisma } from "../db";
import auth from "../middleware/auth";
const playlistRouter = Router();
playlistRouter.use(auth);

playlistRouter.get('/all-playlist', async(req, res) => {
    try{
        const userId = req.userId;
        console.log(userId);
        const UsersPrivatePlaylists = await prisma.playlist.findMany({
            where: {
              userId: userId,
              shared: false,
            }
          });          
        res.json(UsersPrivatePlaylists);
    }catch(e){
        res.status(404).json({message: "error fetching playlists" , error : e});
        
    }
})

playlistRouter.get('/:playlistId', async (req, res) => {
    const { playlistId } = req.params;

    try {
        const playlist = await prisma.playlist.findUnique({
            where: { id: parseInt(playlistId) }, 
            include: {
                playlistSong: { select: { songId : true, song: true } },
            }
        });

        if (!playlist) {
            res.status(404).json({ message: "Playlist not found" });
            return;
        }

        res.status(200).json({
            playlistId: playlist.id,
            playlistName: playlist.name,
            songs: playlist.playlistSong,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
});


playlistRouter.post('/create', async (req, res) => {
    const { userId, name } = req.body;

    try {
        const playlist = await prisma.playlist.create({
            data: {
                name,
                userId,
            },
        });

        res.status(201).json({ message: "Playlist created successfully", playlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
});

playlistRouter.post('/:playlistId/add-song', async (req, res) => {
    const { playlistId } = req.params;
    const { songId } = req.body;

    try {
        await prisma.playlistSong.create({
            data: {
                playlistId: parseInt(playlistId),
                songId: songId,
            },
        });

        res.status(200).json({ message: "Song added to playlist successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
});

playlistRouter.delete('/:playlistId/remove-song', async (req, res) => {
    const { playlistId } = req.params;
    const { songId } = req.body;

    try {
        await prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: parseInt(playlistId),
                    songId: songId,
                },
            },
        });

        res.status(200).json({ message: "Song removed from playlist successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
});

playlistRouter.post('/like', async (req, res) => {
    const { userId, songId } = req.body;

    const user = await prisma.user.findUnique({
        where : {id : userId}
    })
    if(!user?.likedId){
        res.json({message : "No Liked Playlist"});
        return;
    }
    try {
        await prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: user.likedId,
                    songId: songId,
                },
            },
        });

        res.status(200).json({ message: "Song liked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
});

playlistRouter.post('/dislike', async (req, res) => {
    const { userId , songId} = req.body;
    const user = await prisma.user.findUnique({
        where : {id : userId}
    })
    if(!user?.likedId){
        res.json({message : "No Liked Playlist"});
        return;
    }
    try {
        await prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: user.likedId,
                    songId: songId,
                },
            },
        });
        res.status(200).json({ message: "Song disliked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
});

export default playlistRouter;
