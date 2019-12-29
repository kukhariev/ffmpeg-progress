/* eslint-disable @typescript-eslint/no-unused-vars */

import * as os from 'os';
import * as ffmpeg from 'ffmpeg-static';
const FFMPEG_PATH = ffmpeg.path;
jest.setTimeout(30000);

const tmp = os.tmpdir();
import { spawn } from 'child_process';
import { FFMpegProgress, FFMpegProgressEvent, parseProgress } from '../src/';

const args0 = [
  '-y',
  '-hide_banner',
  '-f',
  'lavfi',
  '-i',
  'testsrc=duration=10:size=640x360:rate=50',
  `${tmp}/testfile.mp4`
];
const args1 = [
  '-y',
  '-hide_banner',
  '-i',
  `${tmp}/testfile.mp4`,
  '-r',
  '25',
  '-f',
  'mp4',
  `${tmp}/o.mp4`
];
const args3 = ['-y', '-hide_banner', '-i', 'badfile', '-f', 'mp4', `${tmp}/o.mp4`];
const args4 = [
  '-y',
  '-hide_banner',
  '-nostats',
  '-progress',
  '-',
  '-i',
  `${tmp}/testfile.mp4`,
  '-r',
  '25',
  '-f',
  'mp4',
  `${tmp}/o.mp4`
];

describe('FFMpegProgress', () => {
  it('should not include `percentage`, `remaining` if no duration src ', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args0);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr.pipe(ffmpegProgress).on('data', (progress: FFMpegProgressEvent) => {
      expect(progress).not.toHaveProperty('percentage');
      expect(progress).not.toHaveProperty('remaining');
    });
    ffmpeg.on('close', code => {
      done(code);
    });
  });

  it('should be able to report progress', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args1);
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
    const ffmpeg = spawn(FFMPEG_PATH, args4);
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
    const ffmpeg = spawn(FFMPEG_PATH, args1);
    const ffmpegProgress = new FFMpegProgress();

    ffmpeg.stderr.pipe(ffmpegProgress).on('data', (evt: FFMpegProgressEvent) => {
      ffmpeg.kill();
    });
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.duration).toBe(10000);
      done(code);
    });
  });
  it('should be able to report error message', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args3);
    const ffmpegProgress = new FFMpegProgress();
    ffmpeg.stderr.pipe(ffmpegProgress);
    ffmpeg.on('close', code => {
      expect(ffmpegProgress.exitMessage).toMatch('badfile: No such file or directory');
      done();
    });
  });
});
describe('parseProgress', () => {
  it('should be able to parse progress', done => {
    const ffmpeg = spawn(FFMPEG_PATH, args1);
    ffmpeg.stderr.on('data', data => {
      const progress = parseProgress(data.toString(), 10000);
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
    const ffmpeg = spawn(FFMPEG_PATH, args4);

    ffmpeg.stdout.on('data', data => {
      const progress = parseProgress(data.toString(), 10000) || {};

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
