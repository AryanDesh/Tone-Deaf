"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../middleware/auth"));
const friendRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
friendRouter.use(auth_1.default);
// Send Friend Request
friendRouter.post("/request/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    if (!userId) {
        res.json({ message: "Login to send friendRequest" });
        return;
    }
    if (userId === friendId) {
        res.status(400).json({ message: "You cannot send a request to yourself." });
        return;
    }
    try {
        const existingFriendship = yield prisma.friendship.findFirst({
            where: {
                OR: [
                    { followingId: userId, followerId: friendId },
                    { followingId: friendId, followerId: userId },
                ],
            },
        });
        if (existingFriendship) {
            res.status(400).json({ message: "Friend request already exists." });
            return;
        }
        const friendship = yield prisma.friendship.create({
            data: {
                followingId: friendId,
                followerId: userId,
                status: "PENDING",
            },
        });
        res.status(201).json({ message: "Friend request sent.", data: friendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error sending friend request." });
    }
}));
// Accept Friend Request
friendRouter.post("/accept/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const friendship = yield prisma.friendship.updateMany({
            where: { followingId: userId, followerId: friendId, status: "PENDING" },
            data: { status: "ACCEPTED" },
        });
        if (!friendship.count) {
            res.status(404).json({ message: "Friend request not found." });
            return;
        }
        res.json({ message: "Friend request accepted.", data: friendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error accepting friend request." });
    }
}));
// Reject Friend Request
friendRouter.post("/reject/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const deletedFriendship = yield prisma.friendship.deleteMany({
            where: { followingId: userId, followerId: friendId, status: "PENDING" },
        });
        if (!deletedFriendship.count) {
            res.status(404).json({ message: "Friend request not found." });
            return;
        }
        res.json({ message: "Friend request rejected.", data: deletedFriendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error rejecting friend request." });
    }
}));
// Remove Friend
friendRouter.delete("/remove/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const deletedFriendship = yield prisma.friendship.deleteMany({
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
        res.json({ message: "Friend removed successfully.", data: deletedFriendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error removing friend." });
    }
}));
// Block Friend
friendRouter.post("/block/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const blockedFriendship = yield prisma.friendship.updateMany({
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
        res.json({ message: "User blocked.", data: blockedFriendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error blocking user." });
    }
}));
// Unblock Friend
friendRouter.post("/unblock/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const unblockedFriendship = yield prisma.friendship.updateMany({
            where: {
                OR: [
                    { followingId: userId, followerId: friendId, status: "BLOCKED" },
                    { followingId: friendId, followerId: userId, status: "BLOCKED" },
                ],
            },
            data: { status: "ACCEPTED" },
        });
        if (!unblockedFriendship.count) {
            res.status(404).json({ message: "Friendship not found." });
            return;
        }
        res.json({ message: "User unblocked.", data: unblockedFriendship });
    }
    catch (error) {
        res.status(500).json({ error: "Error unblocking user." });
    }
}));
// Get Friend List
friendRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const friends = yield prisma.friendship.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving friends list." });
    }
}));
// Get Pending Friend Requests (Received)
friendRouter.get("/pending/received", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const pendingRequests = yield prisma.friendship.findMany({
            where: {
                followingId: userId,
                status: "PENDING"
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
            },
        });
        const formattedRequests = pendingRequests.map((request) => ({
            requestId: request.id,
            user: {
                id: request.follower.id,
                username: request.follower.username,
                email: request.follower.email,
            },
            createdAt: request.created_at,
        }));
        res.json({ pendingRequests: formattedRequests });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving pending friend requests." });
    }
}));
// Get Pending Friend Requests (Sent)
friendRouter.get("/pending/sent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const sentRequests = yield prisma.friendship.findMany({
            where: {
                followerId: userId,
                status: "PENDING"
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
            },
        });
        const formattedRequests = sentRequests.map((request) => ({
            requestId: request.id,
            user: {
                id: request.following.id,
                username: request.following.username,
                email: request.following.email,
            },
            createdAt: request.created_at,
        }));
        res.json({ sentRequests: formattedRequests });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving sent friend requests." });
    }
}));
// Cancel a sent friend request
friendRouter.delete("/request/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const deletedRequest = yield prisma.friendship.deleteMany({
            where: {
                followingId: friendId,
                followerId: userId,
                status: "PENDING"
            },
        });
        if (!deletedRequest.count) {
            res.status(404).json({ message: "Friend request not found." });
            return;
        }
        res.json({ message: "Friend request canceled successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Error canceling friend request." });
    }
}));
// Get Blocked Users
friendRouter.get("/blocked", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const blockedUsers = yield prisma.friendship.findMany({
            where: {
                OR: [
                    { followingId: userId, status: "BLOCKED" },
                    { followerId: userId, status: "BLOCKED" },
                ],
            },
            include: {
                following: { select: { id: true, username: true, email: true } },
                follower: { select: { id: true, username: true, email: true } },
            },
        });
        const formattedBlocked = blockedUsers.map((relation) => {
            // Determine which user is the blocked one (not the current user)
            const blockedUser = relation.followingId === userId
                ? relation.follower
                : relation.following;
            return {
                id: blockedUser.id,
                username: blockedUser.username,
                email: blockedUser.email,
            };
        });
        res.json({ blockedUsers: formattedBlocked });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving blocked users." });
    }
}));
// Get Suggested Friends
friendRouter.get("/suggested", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized. Please log in." });
        return;
    }
    try {
        // Fetch existing friendships (Accepted, Pending, Blocked)
        const existingRelationships = yield prisma.friendship.findMany({
            where: {
                OR: [
                    { followingId: userId },
                    { followerId: userId }
                ],
            },
            select: {
                followingId: true,
                followerId: true,
                status: true
            }
        });
        // Extract already known friend IDs
        const blockedOrFriends = new Set(existingRelationships.flatMap(({ followingId, followerId, status }) => status === "BLOCKED" || status === "ACCEPTED" || status === "PENDING"
            ? [followingId, followerId]
            : []));
        blockedOrFriends.add(userId); // Exclude self
        // Fetch users who are not in the blocked/friend list
        const potentialFriends = yield prisma.user.findMany({
            where: { id: { notIn: Array.from(blockedOrFriends) } },
            select: { id: true, username: true, email: true }
        });
        // Fetch mutual friend count for each potential friend
        const suggestedFriends = yield Promise.all(potentialFriends.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            // This query is incorrect and won't give mutual friends count
            // Need to fix the logic for counting mutual friends
            const userFriends = yield prisma.friendship.findMany({
                where: {
                    status: "ACCEPTED",
                    OR: [
                        { followingId: user.id, followerId: { not: userId } },
                        { followerId: user.id, followingId: { not: userId } },
                    ],
                },
                select: {
                    followingId: true,
                    followerId: true,
                },
            });
            const userFriendIds = new Set(userFriends.flatMap(({ followingId, followerId }) => [followingId, followerId])
                .filter(id => id !== user.id));
            const currentUserFriends = yield prisma.friendship.findMany({
                where: {
                    status: "ACCEPTED",
                    OR: [
                        { followingId: userId },
                        { followerId: userId },
                    ],
                },
                select: {
                    followingId: true,
                    followerId: true,
                },
            });
            const currentUserFriendIds = new Set(currentUserFriends.flatMap(({ followingId, followerId }) => [followingId, followerId])
                .filter(id => id !== userId));
            const mutualFriends = [...userFriendIds].filter(id => currentUserFriendIds.has(id));
            return Object.assign(Object.assign({}, user), { mutualFriendsCount: mutualFriends.length, 
                // Optional: Include the mutual friends details if needed
                mutualFriendsDetails: mutualFriends.length > 0 ? mutualFriends : undefined });
        })));
        // Sort by mutual friends count (highest first)
        suggestedFriends.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);
        res.json({ suggestedFriends });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving suggested friends." });
    }
}));
// Get friendship status with a specific user
friendRouter.get("/status/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const userId = req.userId;
    try {
        const friendship = yield prisma.friendship.findFirst({
            where: {
                OR: [
                    { followingId: userId, followerId: friendId },
                    { followingId: friendId, followerId: userId },
                ],
            },
        });
        if (!friendship) {
            res.json({ status: "NONE" });
            return;
        }
        const relationshipDetails = { status: friendship.status };
        if (friendship.status === "PENDING") {
            const isRequestReceived = friendship.followingId === userId;
            relationshipDetails.direction = isRequestReceived ? "RECEIVED" : "SENT";
        }
        res.json(relationshipDetails);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving friendship status." });
    }
}));
// Get Friend Count
friendRouter.get("/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const friendCount = yield prisma.friendship.count({
            where: {
                status: "ACCEPTED",
                OR: [
                    { followingId: userId },
                    { followerId: userId },
                ],
            },
        });
        res.json({ count: friendCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving friend count." });
    }
}));
exports.default = friendRouter;
