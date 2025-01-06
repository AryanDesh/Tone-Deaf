'use strict';

import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fs from 'fs';
import path from 'path';

const exec = promisify(execCallback);

const dir = path.join(__dirname, '../../public');
const dest = path.join(__dirname, '../../temp/chunks');

// Ensure the destination directory exists
if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

const startTime = new Date();
console.info('> Start reading files', startTime);

fs.readdir(dir, async (readDirError, files) => {
    if (readDirError) {
        console.error('Error reading directory:', readDirError);
        return;
    }

    const processFiles = files.map(async (file, index) => {
        const fileName = path.join(dir, file);
        const outputFileName = path.join(dest, `${index}.m3u8`);

        try {
            const { stdout, stderr } = await exec(
                `ffmpeg -i "${fileName}" -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputFileName}"`
            );

            if (stderr) {
                console.warn(`Warning for file ${fileName}:`, stderr);
            }

            console.log(`Processed file ${fileName} successfully.`);
        } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
        }
    });

    try {
        await Promise.all(processFiles);
        const endTime = new Date();
        console.info('< End Preparing files', endTime);
    } catch (error) {
        console.error('Error processing files:', error);
    }
});
