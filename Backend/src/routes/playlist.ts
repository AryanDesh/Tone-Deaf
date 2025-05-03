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

playlistRouter.get('/room/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.userId; // From auth middleware
    
    // First, verify the room exists
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      select: { id: true }
    });

    if (!room) {
      res.status(404).json({ success: false, message: "Room not found" });
      return ;
    }

    // Find all shared playlists in this room
    const sharedPlaylists = await prisma.sharedPlaylist.findMany({
      where: {
        roomId: room.id
      },
      include: {
        playlist: {
          include: {
            user: {
              select: {
                username: true,
                id: true
              }
            },
            playlistSong: {
              include: {
                song: true
              }
            }
          }
        }
      }
    });

    // Format the response
    const formattedPlaylists = sharedPlaylists.map(sharedPlaylist => {
      return {
        id: sharedPlaylist.playlist.id,
        name: sharedPlaylist.playlist.name,
        sharedPlaylistId: sharedPlaylist.id,
        owner: {
          id: sharedPlaylist.playlist.user.id,
          username: sharedPlaylist.playlist.user.username,
          isCurrentUser: sharedPlaylist.playlist.user.id === userId
        },
        songs: sharedPlaylist.playlist.playlistSong.map(ps => ({
          id: ps.song.id,
          title: ps.song.title,
          artist: ps.song.artist,
          album: ps.song.album,
          duration: ps.song.duration
        }))
      };
    });

    res.status(200).json({
      success: true,
      roomCode,
      playlists: formattedPlaylists
    });
  } catch (error) {
    console.error('Error fetching shared playlists in room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared playlists',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

playlistRouter.get('/shared-playlist', async (req, res) => {
    try {
      const userId = req.userId 
      
      if (!userId) {
        res.status(401).json({ error: 'User ID is required' });
        return 
      }
  const sharedPlaylists = await prisma.playlist.findMany({
        where: {
          userId: userId,
          shared: true
        },
        include: {
          playlistSong: {
            include: {
              song: true
            }
          },
          sharedPlaylist: {
            include: {
              room: {
                select: {
                  name: true,
                  code: true,
                  users: {
                    select: {
                      user: {
                        select: {
                          username: true,
                          id: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
  
      const formattedPlaylists = sharedPlaylists.map(playlist => {
        return {
          id: playlist.id,
          name: playlist.name,
          songs: playlist.playlistSong.map(ps => ps.song),
          sharedIn: playlist.sharedPlaylist ? {
            room: {
              id: playlist.sharedPlaylist.roomId,
              name: playlist.sharedPlaylist.room.name,
              code: playlist.sharedPlaylist.room.code,
              participants: playlist.sharedPlaylist.room.users.map(u => ({
                id: u.user.id,
                username: u.user.username
              }))
            }
          } : null
        };
      });
  
      res.status(200).json({ 
          success: true, 
          playlists: formattedPlaylists 
        }); 
    } catch (error) {
      console.error('Error fetching shared playlists:', error);
      res.status(500).json({ 
          error: 'Failed to fetch shared playlists',
          details: error instanceof Error ? error.message : 'Unknown error'
        }); 
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
