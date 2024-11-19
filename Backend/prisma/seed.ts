import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create some songs
  const song1 = await prisma.songs.create({
    data: {
      songId: 'SNG001',
      mp3: '/music/song1.mp3',
    },
  });

  const song2 = await prisma.songs.create({
    data: {
      songId: 'SNG002',
      mp3: '/music/song2.mp3',
    },
  });

  // Create metadata for songs
  const metadata1 = await prisma.metadata.create({
    data: {
      title: 'Song One',
      artist: 'Artist A',
      album: 'Album Alpha',
      duration: 210,
      images: '/images/song1.jpg',
      tags: ['pop', '2024'],
      songId: song1.id,
    },
  });

  const metadata2 = await prisma.metadata.create({
    data: {
      title: 'Song Two',
      artist: 'Artist B',
      album: 'Album Beta',
      duration: 180,
      images: '/images/song2.jpg',
      tags: ['rock', '2023'],
      songId: song2.id,
    },
  });

  // Create a user
  const user = await prisma.user.create({
    data: {
      username: 'johndoe',
      password: 'hashedpassword123', // Use a real hashing mechanism
      email: 'johndoe@example.com',
      playlists: {
        create: [
          {
            name: 'Liked',
            songs: {
              connect: [
                { id: metadata1.id },
                { id: metadata2.id },
              ],
            },
          },
        ],
      },
    },
  });

  // Create another playlist for the user
  await prisma.playlist.create({
    data: {
      name: 'Chill Vibes',
      userId: user.id,
      songs: {
        connect: [{ id: metadata1.id }],
      },
    },
  });

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
