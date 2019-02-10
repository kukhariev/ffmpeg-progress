const FFMPEG_PATH = '/usr/bin/ffmpeg';

const { spawn } = require('child_process');
const { parseProgress } = require('../lib');

const args = [
  '-y',
  '-progress',
  '-',
  '-i',
  '/tmp/testfile.mp4',
  '-r',
  '30',
  '-f',
  'mp4',
  '/tmp/o.mp4'
];

const ffmpeg = spawn(FFMPEG_PATH, args);

function logProgress(data) {
  const progress = parseProgress(data.toString(), 10000);
  if (progress) {
    console.log(progress);
  }
}
ffmpeg.stdout.on('data', logProgress);

ffmpeg.on('close', code => {
  if (code) {
    console.error(`FFMPEG ERROR: ${ffmpegProgress.exitMessage}`);
  } else {
    console.log('DONE.');
  }
});
