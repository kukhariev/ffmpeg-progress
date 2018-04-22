# ffmpeg-progress

[![npm](https://img.shields.io/npm/v/@dropb/ffmpeg-progress.svg?)](https://www.npmjs.com/package/@dropb/ffmpeg-progress)
[![build](https://img.shields.io/travis/kukhariev/ffmpeg-progress.svg?)](https://travis-ci.org/kukhariev/ffmpeg-progress)

Extract progress status from FFMPEG stderr

## Install

```sh
npm install  @dropb/ffmpeg-progress
```

## Usage example

```js
const FFMPEG_PATH = '/usr/bin/ffmpeg';

const { spawn } = require('child_process');
const { FFMpegProgress } = require('@dropb/ffmpeg-progress');

const args = ['-i', 'path/to/input', '-f', 'mp4', 'path/to/output'];
const ffmpegProgress = new FFMpegProgress();
const ffmpeg = spawn(FFMPEG_PATH, args);
ffmpeg.stderr.pipe(ffmpegProgress).on('data', progressData => {
  console.log(progressData);
});
ffmpeg.on('close', code => {
  if (code) {
    console.error(`FFMPEG ERROR: ${ffmpegProgress.exitMessage}`);
  } else {
    console.log('DONE.');
  }
});
/*
{ frame: '13',
  fps: '0.0',
  q: '0.0',
  size: '0kB',
  time: '00:00:00.45',
  bitrate: '0.0kbits/s',
  dup: '2',
  drop: '0',
  speed: '0.883x',
  time_ms: 450,
  progress: 6.53,
  remaining: 5686 }
{ frame: '29',
  fps: '28',
  q: '0.0',
  size: '0kB',
  time: '00:00:00.96',
  bitrate: '0.0kbits/s',
  dup: '5',
  drop: '0',
  speed: '0.945x',
  time_ms: 960,
  progress: 13.93,
  remaining: 5603 }
  ...
{ frame: '206',
  fps: '27',
  q: '-1.0',
  size: '710kB',
  time: '00:00:06.89',
  bitrate: '844.2kbits/s',
  dup: '34',
  drop: '0',
  speed: '0.898x',
  time_ms: 6890,
  progress: 100,
  remaining: 0 }
DONE.
*/
```

## API

```ts
new FFMpegProgress(duration?: number)
```

Creates an instance of FFMpegProgress.
(optional) `duration` - override video duration. Default - auto detect.

public properties:

* `exitMessage` - last ffmpeg stderr message
* `duration`

## License

[MIT](LICENSE)
