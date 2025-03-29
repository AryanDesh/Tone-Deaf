import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const friendsRouter = Router();
const prisma = new PrismaClient();

// Send Friend Request
friendsRouter.post("/request", async (req, res) => {
  const { followingId, followerId } = req.body;

  if (followingId === followerId) {
    res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    const existingFriendship = await prisma.friendship.findUnique({
      where: { followingId_followerId: { followingId, followerId } }
    });

    if (existingFriendship) {
       res.status(400).json({ error: "Friend request already exists" });
    }

    const newFriendship = await prisma.friendship.create({
      data: {
        followingId,
        followerId,
        status: "PENDING"
      }
    });

    res.json(newFriendship);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Accept Friend Request
friendsRouter.post("/accept", async (req, res) => {
  const { followingId, followerId } = req.body;

  try {
    const friendship = await prisma.friendship.updateMany({
      where: { followingId, followerId, status: "PENDING" },
      data: { status: "ACCEPTED" }
    });

    if (!friendship.count) {
       res.status(404).json({ error: "No pending request found" });
    }

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Reject Friend Request
friendsRouter.post("/reject", async (req, res) => {
  const { followingId, followerId } = req.body;

  try {
    const friendship = await prisma.friendship.updateMany({
      where: { followingId, followerId, status: "PENDING" },
      data: { status: "PENDING" }
    });

    if (!friendship.count) {
       res.status(404).json({ error: "No pending request found" });
    }

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Remove Friend
friendsRouter.post("/remove", async (req, res) => {
  const { followingId, followerId } = req.body;

  try {
    const friendship = await prisma.friendship.deleteMany({
      where: {
        OR: [
          { followingId, followerId, status: "ACCEPTED" },
          { followingId: followerId, followerId: followingId, status: "ACCEPTED" }
        ]
      }
    });

    if (!friendship.count) {
       res.status(404).json({ error: "Friendship not found" });
    }

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get Friends List
friendsRouter.get("/:userId/friends", async (req, res) => {
  const { userId } = req.params;

  try {
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ followingId: userId, status: "ACCEPTED" }, { followerId: userId, status: "ACCEPTED" }]
      },
      include: {
        following: { select: { id : true, username: true, email : true } },
        follower: { select: { id: true, username: true, email : true } }
      }
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get Pending Requests
friendsRouter.get("/:userId/pending", async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await prisma.friendship.findMany({
      where: { followingId: userId, status: "PENDING" },
      include: { follower: { select: { id: true, username: true, email: true } } }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default friendsRouter;
