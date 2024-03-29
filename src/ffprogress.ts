import { Transform } from 'stream';

/**
 * Progress events
 * @public
 */
export interface FfmpegProgressEvent {
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

  [propName: string]: unknown;
}

/**
 * convert HH:MM:SS.mss to milliseconds
 */
export function humanTime2msec(timeString: string): number {
  const [h, m, s] = timeString.split(':').map(Number);
  return Math.round(h * 36e5 + m * 6e4 + s * 1e3);
}

/**
 *
 * @param data
 * @param duration video duration (milliseconds)
 */
export function parseProgress(data: string, duration?: number): FfmpegProgressEvent | undefined {
  if (data.startsWith('frame=')) {
    const evt = {} as FfmpegProgressEvent;
    const info = data.replace(/=\s+/g, '=').trim().split(/\s+/g);

    info.forEach(kv => {
      const [k, v] = kv.split('=');
      switch (k) {
        case 'frame':
        case 'fps': {
          evt[k] = +v;
          break;
        }
        case 'bitrate':
        case 'speed': {
          evt[k] = Number.parseFloat(v);
          break;
        }
        case 'Lsize':
        case 'size': {
          evt['size'] = Number.parseInt(v) * 1024;
          break;
        }
        case 'total_size': {
          evt['size'] = +v;
          break;
        }
        case 'out_time':
        case 'time': {
          evt['time'] = v;
          evt.time_ms = humanTime2msec(evt.time);
          break;
        }
        default:
          if (v) {
            evt[k] = v;
          }
          break;
      }
    });

    if (duration) {
      evt.percentage = +((100 * evt.time_ms) / duration).toFixed(2);
      evt.remaining = Math.floor((duration - evt.time_ms) * evt.speed);
    }
    return evt;
  }
  return;
}
/**
 * Extract progress status from FFmpeg stderr.
 * @public
 */
export class FfmpegProgress extends Transform {
  /**
   * last ffmpeg stderr message
   * @beta
   */
  exitMessage = '';
  header = '';
  /**
   * Creates an instance of FfmpegProgress.
   * @param duration - video duration (milliseconds)
   * If parameter is omitted - will attempt to auto-detect media duration
   */
  constructor(public duration: number = 0) {
    super({ readableObjectMode: true });
  }

  _transform(chunk: Buffer, _encoding: string, done: () => void): void {
    const str = chunk.toString();
    if (this.duration === 0) {
      this.header += str;
      const match = /(^|Duration: )(\d\d:\d\d:\d\d\.\d\d)/.exec(this.header);
      if (match && match[2]) {
        this.duration = humanTime2msec(match[2]);
      } else if (this.header.includes('Duration: N/A') || this.header.length > 8 * 1024) {
        this.duration = NaN;
      }
    }
    const evt = parseProgress(str, this.duration);
    if (evt) {
      this.push(evt);
    } else {
      this.exitMessage = str.split('\n').splice(-2)[0];
    }
    done();
  }
}
