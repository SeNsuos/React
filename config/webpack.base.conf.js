const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app/test.js',

  output: {
    filename: 'test.js',
    publicPath: '/',
    path: path.resolve(__dirname, '../dist'),
  },

  devServer: {
    contentBase: path.resolve(__dirname, '../app'),
    hot: true,
    inline: true,
    hot: true,
    open: true
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },

  plugins: [
    new htmlWebpackPlugin({
      template: "./app/index.html"
    })
  ]
}