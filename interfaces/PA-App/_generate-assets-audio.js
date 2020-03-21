const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const existsSync = require('fs').existsSync;
const exec = require('child_process').exec;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

/**
 * Generate audio assets in the required formats (*.mp3 and *.webm)
 * @param locale
 */
function generateAssetsAudio(locale) {
  const sourcePath = `src/assets/i18n/${locale}/`;

  if (!locale || !existsSync(sourcePath)) {
    console.warn(`No folder available for locale: ${locale}`)
    return process.exit();
  }

  // Change to requested folder:
  process.chdir(sourcePath);

  // Run `ffmpeg` command on all `*.m4a`-files:
  return exec(
    'for f in *.mp3; ' +
      'do ' + ffmpegPath + ' -n -i "$f" -dash 1 "${f%.mp3}.webm"; ' +
    'done;',
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
      } else {
        console.log(stdout);
      }
      process.exit();
    }
  );
}


///////////////////////////////////////////////////////////////////////////////


// When a locale is provided via the command-line, use that:
if (process.argv[2]) {
  return generateAssetsAudio(process.argv[2]);;
}
// Otherwise, ask for it:
rl.question('For which locale do you want to generate audio assets? : ', (locale) => {
  return generateAssetsAudio(locale);
});
