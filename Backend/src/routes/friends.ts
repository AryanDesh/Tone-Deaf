import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middleware/auth";

const friendRouter = express.Router();
const prisma = new PrismaClient();

friendRouter.use(auth);

// Send Friend Request
friendRouter.post("/request/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;
  if(!userId) {
    res.json({message : "Login to send friendRequest"})
    return;
  }
  if (userId === friendId)  {
    res.status(400).json({ message: "You cannot send a request to yourself." });
    return;
  }
  try {
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { followingId: userId, followerId: friendId },
          { followingId: friendId, followerId: userId },
        ],
      },
    });

    if (existingFriendship)  {
      res.status(400).json({ message: "Friend request already exists." })
      return;
    };

    const friendship = await prisma.friendship.create({
      data: {
        followingId: friendId,
        followerId: userId,
        status: "PENDING",
      },
    });

    res.status(201).json({ message: "Friend request sent.", data : friendship });
  } catch (error) {
    res.status(500).json({ error: "Error sending friend request." });
  }
});

// Accept Friend Request
friendRouter.post("/accept/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;

  try {
    const friendship = await prisma.friendship.updateMany({
      where: { followingId: userId, followerId: friendId, status: "PENDING" },
      data: { status: "ACCEPTED" },
    });

    if (!friendship.count) {
      res.status(404).json({ message: "Friend request not found." });
      return;
    } 

    res.json({ message: "Friend request accepted." , data : friendship});
  } catch (error) {
    res.status(500).json({ error: "Error accepting friend request." });
  }
});

// Reject Friend Request
friendRouter.post("/reject/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;

  try {
    const deletedFriendship = await prisma.friendship.deleteMany({
      where: { followingId: userId, followerId: friendId, status: "PENDING" },
    });

    if (!deletedFriendship.count) {
      res.status(404).json({ message: "Friend request not found." });
      return;
    } 

    res.json({ message: "Friend request rejected.", data : deletedFriendship });
  } catch (error) {
    res.status(500).json({ error: "Error rejecting friend request." });
  }
});

// Remove Friend
friendRouter.delete("/remove/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;

  try {
    const deletedFriendship = await prisma.friendship.deleteMany({
      where: {
        OR: [
          { followingId: userId, followerId: friendId, status: "ACCEPTED" },
          { followingId: friendId, followerId: userId, status: "ACCEPTED" },
        ],
      },
    });

    if (!deletedFriendship.count) {
      res.status(404).json({ message: "Friendship not found." });
      return;
    } 

    res.json({ message: "Friend removed successfully." , data : deletedFriendship});
  } catch (error) {
    res.status(500).json({ error: "Error removing friend." });
  }
});

// Block Friend
friendRouter.post("/block/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;

  try {
    const blockedFriendship = await prisma.friendship.updateMany({
      where: {
        OR: [
          { followingId: userId, followerId: friendId },
          { followingId: friendId, followerId: userId },
        ],
      },
      data: { status: "BLOCKED" },
    });

    if (!blockedFriendship.count) {
      res.status(404).json({ message: "Friendship not found." });
      return;
    } 

    res.json({ message: "User blocked.", data : blockedFriendship });
  } catch (error) {
    res.status(500).json({ error: "Error blocking user." });
  }
});

// Unblock Friend
friendRouter.post("/unblock/:friendId", async (req, res) => {
  const { friendId } = req.params;
  const userId = req.userId;

  try {
    const unblockedFriendship = await prisma.friendship.updateMany({
      where: {
        OR: [
          { followingId: userId, followerId: friendId, status: "BLOCKED" },
          { followingId: friendId, followerId: userId, status: "BLOCKED" },
        ],
      },
      data: { status: "ACCEPTED" },
    });

    if (!unblockedFriendship.count)  {
      res.status(404).json({ message: "Friendship not found." });
      return;
    }
    res.json({ message: "User unblocked.", data : unblockedFriendship });
  } catch (error) {
    res.status(500).json({ error: "Error unblocking user." });
  }
});

// Get Friend List
friendRouter.get("/list", async (req, res) => {
  const userId = req.userId;

  try {
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { followingId: userId, status: "ACCEPTED" },
          { followerId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        following: { select: { id: true, username: true, email: true } },
        follower: { select: { id: true, username: true, email: true } },
      },
    });

    const formattedFriends = friends.map((f) => ({
      id: f.followingId === userId ? f.follower.id : f.following.id,
      username: f.followingId === userId ? f.follower.username : f.following.username,
      email: f.followingId === userId ? f.follower.email : f.following.email,
    }));

    res.json({ friends: formattedFriends });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving friends list." });
  }
});

export default friendRouter;
