const { durationSec, ffmpegPath, inputFile, outputFile } = require('../config');
const { spawn } = require('child_process');
const { parseProgress } = require('../');

// Redirect progress to stdout
const args = ['-y', '-re', '-progress', '-', '-i', inputFile, '-r', '30', '-f', 'mp4', outputFile];

/**
 * Parse and log ffmpeg progress stdout
 * @param data { Buffer }
 */
function logProgress(data) {
  const progress = parseProgress(data.toString(), durationSec * 1000);
  if (progress) {
    console.log(progress);
  }
}

const ffmpeg = spawn(ffmpegPath, args);

ffmpeg.stdout.on('data', logProgress);

ffmpeg.on('close', code => {
  if (code) {
    console.error('FFMPEG ERROR');
  } else {
    console.log('DONE.');
  }
});
