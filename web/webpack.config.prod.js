import webpack from 'webpack';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production')
};

export default {
  devtool: 'source-map',
  entry: {
    'common': [
      'babel-polyfill',
      'isomorphic-fetch',
      resolve(__dirname, 'src/common')
    ],
    'shop': resolve(__dirname, 'src/shop/index'),
    'police': resolve(__dirname, 'src/police/index'),
    'repair-shop': resolve(__dirname, 'src/repair-shop/index'),
    'insurance': resolve(__dirname, 'src/insurance/index'),
    'block-explorer': resolve(__dirname, 'src/block-explorer/index')
  },
  target: 'web',
  output: {
    path: resolve(__dirname, '../app/static/js'), // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'] },
      {
        test: /(\.css)$/, use: ['style-loader', 'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer('last 5 versions', 'ie 10')]
            }
          }
        ]
      },
      {
        test: /(\.scss)$/, use: [
          'style-loader', 'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer('last 5 versions', 'ie 10')]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                resolve(__dirname, 'node_modules/normalize-scss/sass')
              ]
            }
          }
        ]
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.(woff|woff2)$/, use: 'url?prefix=font/&limit=5000' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
