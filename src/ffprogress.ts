import { Transform } from 'stream';
/**
 * Progress  events
 * @public
 */
export class FFMpegProgressData {
  frame?: string;
  fps?: string;
  q?: string;
  size?: string;
  time?: string;
  bitrate?: string;
  dup?: string;
  drop?: string;
  speed?: string;
  /**
   * Time (msec)
   */
  time_ms?: number;
  /**
   * ETA (msec)
   */
  remaining?: number;
  /**
   * Progress percentage
   */
  progress?: number;
}

const durationRegex = /Duration:[\n\s]?(.*)[\n\s]?, start:[\n\s]?(.*)\,/;

/**
 * convert HH:MM:SS.mss to milliseconds
 */
function timeString2msec(timeString: string): number {
  const [h, m, s] = timeString.split(':');
  return (+h * 36e5 + +m * 6e4 + +s * 1e3) | 0;
}
/**
 * Extract progress status from FFMPEG stderr.
 * @public
 */
export class FFMpegProgress extends Transform {
  private acc = '';
  /**
   * last ffmpeg stderr message
   * @beta
   */
  exitMessage = '';
  /**
   * Creates an instance of FFMpegProgress.
   * @param duration - video duration
   * @remarks
   * If parameter is omitted - will attempt to auto-detect media duration
   */
  constructor(public duration: number = 0) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    });
  }

  _transform(chunk: Buffer, encoding: string, done: Function) {
    const str: string = chunk.toString();
    if (str.indexOf('frame=') === 0) {
      const data: FFMpegProgressData = {};
      const info = str
        .split('\n')[0]
        .replace(/=\s+/g, '=')
        .trim()
        .split(/\s+/g);
      info.forEach(kv => {
        const [k, v] = kv.split('=');
        const key = k === 'Lsize' ? 'size' : k;
        data[key] = v;
      });
      data.time_ms = timeString2msec(data.time!);
      if (this.duration) {
        data.progress = +((100 * data.time_ms) / this.duration).toFixed(2);
        data.remaining = Math.floor((this.duration - data.time_ms) * parseFloat(data.speed!));
      }
      this.push(data);
    } else {
      if (!this.duration) {
        this.acc = this.acc + str;
        const match = this.acc.match(durationRegex);
        if (match && match[1]) {
          this.duration = timeString2msec(match[1]);
        }
      }
      this.exitMessage = str.split('\n').splice(-2)[0];
    }
    done();
  }
}
