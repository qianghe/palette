const webapck = require('webpack');
const path = require('paht');

//连接相对路径
const joinPath = relativePath => {
  return relativePath ? path.resolve(`.././${relativePath}`) : '';
}
//判断是否为开发环境
const isProduct = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    'main': path.resolve('app/index.jsx'),
    'vendor': ['react', 'react-dom', 'fetch']
  },
  output: {
    path: joinPath('static'),
    filename: isProduct ? 'js/[name].[hash:8].js' : 'js/[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('app'),
      'node_modules'
    ]
  }
  modules: {
    rules: [
      {
        test: /\.(js|jsx)/,
        use: {
          loader: 'babel-loader',
          query: {
            cacheDirectory: false,
          }
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
        options: {
          limit: 8129,
          name: 'imgs/[name].[hash].[ext]',
          publicPath: '../',
        }
      }
    ]
  }
}
