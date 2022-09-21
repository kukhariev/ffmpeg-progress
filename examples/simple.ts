import { spawn } from 'child_process';
import { FfmpegProgress } from '../src';
import { ffmpegPath, inputFile, outputFile } from '../config';

const args = ['-y', '-re', '-i', inputFile, '-r', '30', '-f', 'mp4', outputFile];

const ffmpegProgress = new FfmpegProgress();

const ffmpeg = spawn(ffmpegPath, args);

ffmpeg.stderr.pipe(ffmpegProgress).on('data', console.log);

ffmpeg.on('close', code => {
  if (code) {
    console.error(`FFMPEG ERROR: ${ffmpegProgress.exitMessage}`);
  } else {
    console.log('DONE.');
  }
});
