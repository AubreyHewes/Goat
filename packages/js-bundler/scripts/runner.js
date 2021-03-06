
const fileExtensions = '.+(es6.js|ts)';

/**
 * Entry for all file mode
 * @param {Object} config
 */
function runAll(config) {
  const files = getFiles(config);
  run({
    ...config,
    files,
    ts: hasTS(files),
  });
}

/**
 * Entry for single file mode (eg: watching)
 * @param {Object} config
 * @param {String} file
 */
function runSingle(config, file) {
  run({
    ...config,
    files: [file],
    ts: hasTS([file]),
  });
}

/**
 * Run webpack
 * @param {Object} config
 */
function run(config) {
  const { dist } = config.configuration.locations.javascript;
  config.entryFiles = formatEntryFiles(config.files, dist, config.path);
  const getWebpackSetup = require('./webpack');
  const logResults = require('./log');
  const compiler = getWebpackSetup(config);
  compiler.run((err, stats) => logResults(stats));
}


/**
 * Check if there are any typescript files
 * @param {Array} files
 * @returns {Boolean}
 */
function hasTS(files) {
  return files.some(file => /\.ts$/.test(file));
}

/**
 * Get all files at the configured location
 * @param {Object} { path, configuration }
 * @returns {Array}
 */
function getFiles({ path, configuration }) {
  const { normalize } = require('path');
  const { sync } = require('glob');
  const entry = normalize(`${path}/${configuration.locations.javascript.src}`);
  return sync(`${entry}/**/**${fileExtensions}`);
}

/**
 * Format files array to entry files object to feed webpack
 * @param {Array} files
 * @param {String} path
 * @returns {Object}
 */
function formatEntryFiles(files, dest, path) {
  const { resolve } = require('path');
  return files.reduce((obj, el) => {
    const name = el.replace(`${path}/`, '').replace(/(\.es6\.js|\.ts)$/g, '');
    const destination = dest === '<source>' ? name : name.replace(name.substring(0, name.lastIndexOf('/')), dest);
    obj[destination] = resolve(el);
    return obj;
  }, {});
}

module.exports = { runAll, runSingle };
