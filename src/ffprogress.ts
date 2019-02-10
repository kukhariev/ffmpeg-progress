import { Transform } from 'stream';
/**
 * Progress  events
 * @public
 */

export interface FFMpegProgressEvent {
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

/**
 * convert HH:MM:SS.mss to milliseconds
 */
function humanTime2msec(timeString: string): number {
  const [h, m, s] = timeString.split(':');
  return (+h * 36e5 + +m * 6e4 + +s * 1e3) | 0;
}
/**
 * Extract progress status from FFMPEG stderr.
 * @public
 */
export class FFMpegProgress extends Transform {
  /**
   * last ffmpeg stderr message
   * @beta
   */
  exitMessage = '';
  /**
   * Creates an instance of FFMpegProgress.
   * @param duration - video duration (milliseconds)
   * If parameter is omitted - will attempt to auto-detect media duration
   */
  constructor(public duration: number = 0) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    });
  }

  _transform(chunk: Buffer, encoding: string, done: () => void) {
    const str: string = chunk.toString();
    const progressEvent = parseProgress(str, this.duration);
    if (progressEvent) {
      this.push(progressEvent);
    } else {
      if (!this.duration && !progressEvent) {
        const re = /(^|Duration: )(\d\d:\d\d:\d\d\.\d\d)/;
        const match = str.match(re);
        if (match && match[2]) {
          this.duration = humanTime2msec(match[2]);
        }
      }
      this.exitMessage = str.split('\n').splice(-2)[0];
    }
    done();
  }
}

/**
 *
 * @param data
 * @param duration video duration (milliseconds)
 */
export function parseProgress(data: string, duration?: number): FFMpegProgressEvent | undefined {
  if (data.indexOf('frame=') === 0) {
    const evt = <FFMpegProgressEvent>{};
    const info = data
      .replace(/=\s+/g, '=')
      .trim()
      .split(/\s+/g);

    info.forEach(kv => {
      const [k, v] = kv.split('=');
      switch (k) {
        case 'frame':
        case 'fps':
          evt[k] = +v;
          break;
        case 'bitrate':
        case 'speed':

        evt[k] = parseFloat(v);
          console.log(v, evt[k]);
          break;
        case 'Lsize':
        case 'size':
          evt['size'] = parseInt(v) * 1024;
          break;
        case 'total_size':
          evt['size'] = +v;
          break;
        case 'out_time':
        case 'time':
          evt['time'] = v;
          evt.time_ms = humanTime2msec(evt.time);
          break;
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
