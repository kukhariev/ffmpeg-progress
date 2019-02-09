import * as os from 'os';
import * as ffmpeg from 'ffmpeg-static';
const FFMPEG_PATH = ffmpeg.path;
const tmp = os.tmpdir();
import { expect } from 'chai';
import { spawn } from 'child_process';
import { FFMpegProgress, FFMpegProgressData } from '../src/';

const args0 = [
  '-y',
  '-f',
  'lavfi',
  '-i',
  'testsrc=duration=10:size=640x360:rate=50',
  `${tmp}/testfile.mp4`
];

const args1 = [
  '-y',
  '-i',
  `${tmp}/testfile.mp4`,
  '-r',
  '25',
  '-f',
  'mp4',
  `${tmp}/o.mp4`
];
const arg3 = ['-y', '-i', 'badfile', '-f', 'mp4', `${tmp}/o.mp4`];

describe('ffmpeg-progress', () => {
  it('should not include some keys', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args0);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr
      .pipe(ffmpegProgress)
      .on('data', (progress: FFMpegProgressData) => {
        expect(progress).to.not.have.any.keys('progress', 'remaining');
      });
    ffmpeg.on('close', code => {
      done();
    });
  });

  it('should be able to report progress', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args1);
    const ffmpegProgress = new FFMpegProgress();
    ffmpegProgress.duration = 10000;
    ffmpeg.stderr
      .pipe(ffmpegProgress)
      .on('data', (progress: FFMpegProgressData) => {
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
    const ffmpeg = spawn(FFMPEG_PATH, args1);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr
      .pipe(ffmpegProgress)
      .on('data', (progress: FFMpegProgressData) => {});
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.duration).to.be.equal(10000);
      done();
    });
  });
  it('should be able to report error message', done => {
    const ffmpeg = spawn(FFMPEG_PATH, arg3);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr.pipe(ffmpegProgress);
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.exitMessage).to.be.equal(
        'badfile: No such file or directory'
      );
      done();
    });
  });
});
