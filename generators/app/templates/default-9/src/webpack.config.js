const devConfig = require('./scripts/webpack/environments/development/development');
const prodConfig = require('./scripts/webpack/environments/production');

const config = process.env.NODE_ENV === 'development' ? devConfig : prodConfig;

module.exports = config;