const ffmpegStaticPath = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const { tmpdir } = require('os');

const tmp = tmpdir();
const inputFile = 'test/fixtures/input.mp4';
const outputFile = `${tmp}/output.mp4`;

const ffmpegPath = String(process.env.FFMPEG_PATH || ffmpegStaticPath);

function generateTestFile(filename, duration = 10) {
  spawnSync(ffmpegPath, [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `testsrc=duration=${duration}:size=640x360:rate=30`,
    filename
  ]);
}

if (!existsSync(inputFile)) {
  generateTestFile(inputFile, 10);
}

exports.generateTestFile = generateTestFile;
exports.inputFile = inputFile;
exports.outputFile = outputFile;
exports.ffmpegPath = ffmpegPath;
