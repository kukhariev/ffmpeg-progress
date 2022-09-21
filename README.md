# ffmpeg-progress

[![npm](https://img.shields.io/npm/v/@dropb/ffmpeg-progress.svg?)](https://www.npmjs.com/package/@dropb/ffmpeg-progress)
[![CI](https://github.com/kukhariev/ffmpeg-progress/actions/workflows/test.yml/badge.svg)](https://github.com/kukhariev/ffmpeg-progress/actions/workflows/test.yml)

Extract progress status from FFMPEG

## Install

```sh
npm install  @dropb/ffmpeg-progress
```

## Usage

see [examples](./examples/)

## API
###
```ts
interface FFMpegProgressEvent {
  frame: number;
  fps: number;
  size: number;
  time: string;
  bitrate: number;
  speed: number;
  /**
   * Time (milliseconds)
   */
  time_ms: number;
  /**
   * ETA (milliseconds)
   */
  remaining?: number;
  /**
   * Progress percentage
   */
  percentage?: number;
}
```
### FFMpegProgress Pipe

```ts
new FFMpegProgress(duration?: number)
```

Creates an instance of FFMpegProgress Pipe.
(optional) `duration` - override video duration (milliseconds). Default - auto detect.

public properties:

- `exitMessage` - error message
- `duration`

### parseProgress

```ts
parseProgress(data: string, duration?: number): FFMpegProgressEvent
```
## License

[MIT](LICENSE)
