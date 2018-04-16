const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
import { expect } from 'chai';
import { spawn } from 'child_process';
import {
  FFMpegProgress,
  FFMpegProgressData
} from '../src/';
const testFile = './test/SampleVideo_640x360_1mb.flv';
const args = [
  '-re',
  '-y',
  '-i',
  './test/SampleVideo 640x360 1mb.flv',
  '-r',
  '30',
  '-f',
  'mp4',
  '/tmp/o.mp4'
];
const errargs = ['-y', '-i', 'badfile', '-f', 'mp4', '/tmp/o.mp4'];
describe('ffmpeg-progress', () => {
  it('should be able to report progress', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr
      .pipe(ffmpegProgress)
      .on('data', (progress: FFMpegProgressData) => {
        // console.log(progress);
        expect(progress).to.include.keys(
          'bitrate',
          'fps',
          'frame',
          'progress',
          'size',
          'speed',
          'time',
          'time_ms',
          'remaining'
        );
      });
    ffmpeg.on('close', code => {
      done();
    });
  });
  it('should be able to report duration', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr
      .pipe(ffmpegProgress)
      .on('data', (progress: FFMpegProgressData) => {
      });
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.duration).to.be.equal(6890);
      done();
    });

  });
  it('should be able to report error message', done => {
    const ffmpeg = spawn(FFMPEG_PATH, errargs);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr.pipe(ffmpegProgress);
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.exitMessage).to.be.equal(
        'badfile: No such file or directory'
      );
      // console.log(ffmpegProgress.exitMessage);
      done();
    });
  });
});
