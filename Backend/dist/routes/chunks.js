"use strict";
// If something doesnt work, check the asyncHandler and/or ffMpeg in chunking Function.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const util_1 = require("util");
const child_process_1 = require("child_process");
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const db_1 = require("../db");
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const chunkRouter = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
chunkRouter.get('/chunks', (req, res) => {
});
chunkRouter.post('/chunks', upload.fields([
    { name: "mp3", maxCount: 1 },
    { name: "images", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, artist, album } = req.body;
    // @ts-ignore
    const image = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.images) || "";
    // @ts-ignore
    const mp3File = ((_b = req.files) === null || _b === void 0 ? void 0 : _b.mp3) || "";
    console.log("image");
    const genres = JSON.parse(req.body.genres);
    if (!mp3File && !title) {
        res.status(400).json({ msg: "Don't forget your MP3 file and/or title." });
        return;
    }
    try {
        const songExists = yield db_1.prisma.song.findFirst({
            where: { title: title, artist: artist },
        });
        if (songExists) {
            res.status(400).json({ msg: "We already got you, you Melomaniac!" });
            return;
        }
        const duration = yield extractDuration(mp3File[0].path);
        const addSong = yield db_1.prisma.song.create({
            data: {
                title,
                artist,
                album,
                duration,
                tags: {
                    create: genres.map((tag) => ({
                        tag: {
                            connectOrCreate: {
                                where: { tag },
                                create: { tag },
                            },
                        },
                    })),
                },
            },
        });
        const filePath = path_1.default.join(__dirname, "../..", mp3File[0].path);
        const imagePath = path_1.default.join(__dirname, "../..", image[0].path);
        console.log(filePath);
        yield chunking(addSong.id, filePath, imagePath);
        res.status(200).json({ msg: 'All processes completed!' });
        return;
    }
    catch (error) {
        console.error('Error in /chunks:', error);
        res.status(500).json({ msg: 'Internal server error.' });
        return;
    }
}));
exports.default = chunkRouter;
const chunking = (songId, filePath, imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    const exec = (0, util_1.promisify)(child_process_1.exec);
    console.log("In chunking");
    const tempFolder = path_1.default.join(__dirname, "../..", `./temp_chunks_${songId}`);
    if (!fs_1.default.existsSync(tempFolder)) {
        fs_1.default.mkdirSync(tempFolder, { recursive: true });
    }
    const imageExtension = path_1.default.extname(imagePath);
    if (!imageExtension) {
        throw new Error(`Unable to determine the file extension for image at ${imagePath}`);
    }
    const destinationImagePath = path_1.default.join(tempFolder, `${songId}${imageExtension}`);
    if (fs_1.default.existsSync(imagePath)) {
        fs_1.default.copyFileSync(imagePath, destinationImagePath);
        console.log(`Image copied to ${destinationImagePath}`);
    }
    else {
        console.error(`Image not found at path: ${imagePath}`);
    }
    const outputFileName = path_1.default.join(tempFolder, `${songId}.m3u8`);
    const chunkFilePattern = path_1.default.join(tempFolder, `${songId}_chunk_%03d.ts`);
    try {
        console.info('> Start processing the file:', new Date());
        const { stdout, stderr } = yield exec(`ffmpeg -i "${filePath}" -vn -acodec copy -hls_time 10 -hls_segment_filename "${chunkFilePattern}" -hls_list_size 0 -f hls "${outputFileName}"`);
        if (stderr) {
            console.warn(`Warning during processing ${filePath}:`, stderr);
        }
        console.log(`Chunks and playlist created successfully for ${filePath}:`);
        console.log(`Playlist file: ${outputFileName}`);
        const files = (0, fs_1.readdirSync)(tempFolder);
        files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            const fileLoc = path_1.default.join(tempFolder, file);
            const fileBuffer = fs_1.default.readFileSync(fileLoc);
            const uploadCommand = new client_s3_1.PutObjectCommand({
                Bucket: 'Songs-Chunks',
                Key: `${songId}/${file}`,
                Body: fileBuffer,
            });
            yield db_1.s3.send(uploadCommand);
            console.log("Completed uploading to Supabase Storage S3");
            return;
        }));
    }
    catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
    finally {
        fs_1.default.rmSync(tempFolder, { recursive: true, force: true });
        console.log(`Temporary folder ${tempFolder} deleted.`);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            console.log(`Original file ${filePath} deleted after processing.`);
        }
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
            console.log(`Original image ${imagePath} deleted after processing.`);
        }
    }
});
function extractDuration(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileLoc = path_1.default.join(__dirname, "../..", filePath);
        console.log(fileLoc);
        try {
            const execAsync = (0, util_1.promisify)(child_process_1.exec);
            const ffmpegCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${fileLoc}"`;
            const { stdout } = yield execAsync(ffmpegCmd);
            const metadata = JSON.parse(stdout);
            const format = metadata.format;
            const duration = Math.round(parseFloat(format.duration || '0'));
            return duration;
        }
        catch (error) {
            throw new Error(`Error extracting metadata: ${error.message}`);
        }
    });
}
