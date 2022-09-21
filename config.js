const ffmpegStaticPath = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const { tmpdir } = require('os');

const tmp = tmpdir();
const inputFile = `${__dirname}/test/fixtures/input.mp4`;
const outputFile = `${tmp}/output.mp4`;
const durationSec = 10.0;

const ffmpegPath = String(process.env.FFMPEG_PATH || ffmpegStaticPath);

function generateTestFile(filename, durationSec = 10.0) {
  spawnSync(ffmpegPath, [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `testsrc=duration=${durationSec}:size=640x360:rate=30`,
    filename
  ]);
}

if (!existsSync(inputFile)) {
  generateTestFile(inputFile, durationSec);
}

exports.generateTestFile = generateTestFile;
exports.inputFile = inputFile;
exports.durationSec = durationSec;
exports.outputFile = outputFile;
exports.ffmpegPath = ffmpegPath;
