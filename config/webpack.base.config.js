const webapck = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//连接相对路径
const joinPath = relativePath => {
  return relativePath ? path.resolve(__dirname, `.././${relativePath}`) : '';
}
//判断是否为开发环境
const isProduct = process.env.NODE_ENV === 'production';

module.exports = {
  entry: [
    "babel-polyfill",
    "react-hot-loader/patch",
    path.resolve('app/index.jsx'),
  ],
  output: {
    path: joinPath('dist'),
    filename: isProduct ? 'js/[name].[hash:8].js' : 'js/[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('app'),
      'node_modules'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            cacheDirectory: false
          },
        }
      },
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader'],
        })
      },
      {
        test: /\.scss/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        })
      },
      {
        test: /\.(png|jep?g|svg)$/i,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8129,
            name: 'imgs/[name].[hash].[ext]',
            publicPath: '../',
          }
        }
      }
    ]
  },
  plugins: [
    //css文件抽取后打包
    new ExtractTextPlugin({
      filename: isProduct ? 'css/[name].[hash:8].css' : 'css/[name].css'
    }),
    //将打包文件插入到模板index页面中
    new HtmlWebpackPlugin({
      filename: isProduct ? joinPath('dist') + 'index.html' : 'index.html',
      template: joinPath('app/views/template.html'),
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    })
  ]
}
