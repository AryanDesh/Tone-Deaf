import { Router } from "express";
import { prisma } from "../db";
import auth from "../middleware/auth";

const songRouter  = Router();

songRouter.use(auth);
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

/**
 * Get recommended songs for a user based on their listening history
 * Recommendation algorithm:
 * 1. Find the most common tags from user's recent streams
 * 2. Recommend songs that share these tags but haven't been streamed by the user recently
 */
songRouter.get('/recommendations', async(req, res) => {
  const userId = req.userId;
  
  if (!userId) {
    res.status(400).json({ error: 'UserId is required and must be a string' });
    return;
  }

  try {
    // Get user's recently streamed songs (last 20)
    const recentStreams = await prisma.streamLog.findMany({
      where: { userId: String(userId) },
      orderBy: { streamedAt: 'desc' },
      take: 20,
      include: {
        song: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      }
    });

    if (recentStreams.length === 0) {
      const popularSongs = await prisma.song.findMany({
        take: 10,
        orderBy: {
          streamLog: {
            _count: 'desc'
          }
        }
      });
      res.status(200).json(popularSongs);
      return;
    }

    // Extract tags from recently played songs
    const tagFrequency: Record<number, number> = {};
    
    recentStreams.forEach(stream => {
      stream.song.tags.forEach(tagRelation => {
        const tagId = tagRelation.tagId;
        tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
      });
    });

    // Sort tags by frequency
    const sortedTags = Object.entries(tagFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(entry => parseInt(entry[0]));
    
    // Get top 3 tags (or less if user has fewer tags)
    const topTags = sortedTags.slice(0, 3);
    
    // Get recently played song IDs to exclude them from recommendations
    const recentSongIds = recentStreams.map(stream => stream.songId);

    // Find songs with similar tags that user hasn't recently played
    const recommendedSongs = await prisma.song.findMany({
      where: {
        AND: [
          {
            tags: {
              some: {
                tagId: {
                  in: topTags
                }
              }
            }
          },
          {
            id: {
              notIn: recentSongIds
            }
          }
        ]
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      take: 10
    });

    res.status(200).json(recommendedSongs);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default songRouter;