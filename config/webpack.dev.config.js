const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

module.exports = merge(baseConfig, {
  devtool: 'source-map',
  devServer: {
      disableHostCheck: true
    },
  plugins: {
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'develop'
      }
    })
  }
});
