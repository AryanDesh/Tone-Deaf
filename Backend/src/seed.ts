import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create songdata
  const songdata1 = await prisma.songdata.create({
    data: {
      title: 'Song 1',
      artist: 'Artist 1',
      album: 'Album 1',
      duration: 210,
      images: 'https://example.com/image1.jpg',
      tags: ['pop', '2023'],
      song: {
        create: {
          songId: 'song1',
          mp3: 'https://example.com/song1.mp3',
        },
      },
    },
  });

  const songdata2 = await prisma.songdata.create({
    data: {
      title: 'Song 2',
      artist: 'Artist 2',
      album: 'Album 2',
      duration: 200,
      images: 'https://example.com/image2.jpg',
      tags: ['rock', '2022'],
      song: {
        create: {
          songId: 'song2',
          mp3: 'https://example.com/song2.mp3',
        },
      },
    },
  });

  // Create User
  const user = await prisma.user.create({
    data: {
      username: 'john_doe',
      password: 'hashed_password',
      email: 'john@example.com',
    },
  });

  // Create Playlist
  const playlist = await prisma.playlist.create({
    data: {
      name: 'My Favorite Songs',
      user: { connect: { id: user.id } },
    },
  });

  // Create PlaylistSong entries manually
  await prisma.playlistSong.createMany({
    data: [
      { playlistId: playlist.id, SongdataId: songdata1.id },
      { playlistId: playlist.id, SongdataId: songdata2.id },
    ],
  });

  // Verify the data
  const playlistsWithSongs = await prisma.playlist.findMany({
    include: {
      PlaylistSong: { include: { Songdata: true } },
    },
  });
  console.log('Playlists with Songs:', JSON.stringify(playlistsWithSongs, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
