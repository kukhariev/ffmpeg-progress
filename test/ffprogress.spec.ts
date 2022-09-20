import { spawn } from 'child_process';
import { FFMpegProgress, FFMpegProgressEvent, parseProgress } from '../src';
import { ffmpegPath } from '../config';
import * as rimraf from 'rimraf';
import { tmpdir } from 'os';
import { mkdirSync } from 'fs';

const tmp = `${tmpdir()}/ffmpeg-progress`;

try {
  mkdirSync(tmp);
} catch {
  // EEXIST
}

jest.setTimeout(20_000);

const inputFile = 'test/fixtures/input.mp4';
const corruptFile = 'test/fixtures/corrupt.mp4';
const args = {
  0: ['-y', '-f', 'lavfi', '-i', 'testsrc=duration=10:size=640x360:rate=50', `${tmp}/0.mp4`],
  1: ['-y', '-i', inputFile, `${tmp}/1.mp4`],
  2: ['-y', '-i', 'bad file', `${tmp}/2.mp4`],
  3: ['-y', '-nostats', '-progress', '-', '-i', inputFile, `${tmp}/3.mp4`],
  4: ['-y', '-i', corruptFile, `${tmp}/4.mp4`]
};
describe('FFMpegProgress', function () {
  afterAll(() => rimraf.sync(tmp));

  describe('ffmpegProgress', () => {
    it('should not include `percentage`, `remaining` if no duration src', done => {
      const ffmpeg = spawn(ffmpegPath, args[0]);
      const ffmpegProgress = new FFMpegProgress();
      ffmpeg.stderr.pipe(ffmpegProgress).on('data', (progress: FFMpegProgressEvent) => {
        expect(progress).not.toHaveProperty('percentage');
        expect(progress).not.toHaveProperty('remaining');
      });
      ffmpeg.on('close', done);
    });

    it('should be able to report progress', done => {
      const ffmpeg = spawn(ffmpegPath, args[1]);
      const ffmpegProgress = new FFMpegProgress();
      ffmpegProgress.duration = 10000;
      ffmpeg.stderr.pipe(ffmpegProgress).on('data', (progress: FFMpegProgressEvent) => {
        expect(Object.keys(progress)).toEqual(
          expect.arrayContaining([
            'bitrate',
            'fps',
            'frame',
            'percentage',
            'size',
            'speed',
            'time',
            'time_ms',
            'remaining'
          ])
        );
      });
      ffmpeg.on('close', done);
    });

    it('should be able to process stdout `-progress` info', done => {
      const ffmpeg = spawn(ffmpegPath, args[3]);
      const ffmpegProgress = new FFMpegProgress();
      ffmpegProgress.duration = 10000;
      ffmpeg.stdout.pipe(ffmpegProgress).on('data', (progress: FFMpegProgressEvent) => {
        expect(Object.keys(progress)).toEqual(
          expect.arrayContaining([
            'bitrate',
            'fps',
            'frame',
            'percentage',
            'size',
            'speed',
            'time',
            'time_ms',
            'remaining'
          ])
        );
      });
      ffmpeg.on('close', done);
    });

    it('should be able to report duration', done => {
      const ffmpeg = spawn(ffmpegPath, args[1]);
      const ffmpegProgress = new FFMpegProgress();
      ffmpeg.stderr.pipe(ffmpegProgress).on('data', () => {
        expect(ffmpegProgress.duration).toBe(10000);
        ffmpeg.kill();
        done();
      });
    });

    it('should be able to report error message', done => {
      const ffmpeg = spawn(ffmpegPath, args[2]);
      const ffmpegProgress = new FFMpegProgress();
      ffmpeg.stderr.pipe(ffmpegProgress);
      ffmpeg.on('close', () => {
        expect(ffmpegProgress.exitMessage).toMatch('bad file: No such file or directory');
        done();
      });
    });
  });

  describe('parseProgress', () => {
    it('should be able to parse progress', done => {
      const ffmpeg = spawn(ffmpegPath, args[1]);
      ffmpeg.stderr.on('data', data => {
        const progress = parseProgress(String(data), 10000);
        if (progress) {
          expect(Object.keys(progress)).toEqual(
            expect.arrayContaining([
              'bitrate',
              'fps',
              'frame',
              'percentage',
              'size',
              'speed',
              'time',
              'time_ms',
              'remaining'
            ])
          );
        }
      });
      ffmpeg.on('close', done);
    });

    it('should be able to process `-progress` info', done => {
      const ffmpeg = spawn(ffmpegPath, args[3]);
      ffmpeg.stdout.on('data', data => {
        const progress = parseProgress(String(data), 10000) || {};
        expect(Object.keys(progress)).toEqual(
          expect.arrayContaining([
            'bitrate',
            'fps',
            'frame',
            'percentage',
            'size',
            'speed',
            'time',
            'time_ms',
            'remaining'
          ])
        );
      });
      ffmpeg.on('close', done);
    });
  });
});
