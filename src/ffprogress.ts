import { Transform } from 'stream';

export interface FFMpegProgressData {
  frame?: string;
  fps?: string;
  q?: string;
  size?: string;
  time?: string;
  bitrate?: string;
  dup?: string;
  drop?: string;
  speed?: string;
  time_ms?: number; // milliseconds
  remaining?: number; // milliseconds
  progress?: number; // percentage
}

const durationRegex = /Duration:[\n\s]?(.*)[\n\s]?, start:[\n\s]?(.*)\,/;

/**
 * convert HH:MM:SS.mss to milliseconds
 */
function timeString2ms(timeString: string): number {
  const [h, m, s] = timeString.split(':');
  return (+h * 36e5 + +m * 6e4 + +s * 1e3) | 0;
}
/**
 *
 */
export class FFMpegProgress extends Transform {
  private acc = '';
  exitMessage = '';

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
        .trim()
        .split(/[\=\s]+/g);
      for (let i = 0; i < info.length; i += 2) {
        info[i] === 'Lsize'
          ? (data['size'] = info[i + 1])
          : (data[info[i]] = info[i + 1]);
      }
      data.time_ms = timeString2ms(data.time);
      if (this.duration) {
        data.progress = +(100 * data.time_ms / this.duration).toFixed(2);
        data.remaining = Math.floor(
          (this.duration - data.time_ms) * parseFloat(data.speed)
        );
      }
      this.push(data);
    } else {
      if (!this.duration) {
        this.acc = this.acc + str;
        const match = this.acc.match(durationRegex);
        if (match && match[1]) {
          this.duration = timeString2ms(match[1]);
        }
      }
      this.exitMessage = str.split('\n').splice(-2)[0];
    }
    done();
  }
}
