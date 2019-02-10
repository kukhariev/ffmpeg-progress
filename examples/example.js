
const FFMPEG_PATH = '/usr/bin/ffmpeg';

const { spawn } = require('child_process');
const { FFMpegProgress } = require('../lib');

const args = [
  '-y',
  '-i',
  '/tmp/testfile.mp4',
  '-r',
  '30',
  '-f',
  'mp4',
  '/tmp/o.mp4'
];
const ffmpegProgress = new FFMpegProgress();
const ffmpeg = spawn(FFMPEG_PATH, args);

function logProgress(progressData) {
  console.log(progressData);
}
ffmpeg.stderr.pipe(ffmpegProgress).on('data', logProgress);
ffmpeg.on('close', code => {
  if (code) {
    console.error(`FFMPEG ERROR: ${ffmpegProgress.exitMessage}`);
  } else {
    console.log('DONE.');
  }
});
