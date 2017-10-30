import webpack from 'webpack';
import { resolve } from 'path';

const hotReloadModules = [
  'react-hot-loader/patch',
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000'
];

export default {
  devtool: 'eval',
  entry: {
    'common': [
      'babel-polyfill',
      'isomorphic-fetch',
      ...hotReloadModules,
      resolve(__dirname, 'src/common')
    ],
    'shop': [...hotReloadModules, resolve(__dirname, 'src/shop/index')],
    'police': [...hotReloadModules, resolve(__dirname, 'src/police/index')],
    'repair-shop': [...hotReloadModules, resolve(__dirname, 'src/repair-shop/index')],
    'insurance': [...hotReloadModules, resolve(__dirname, 'src/insurance/index')],
    'block-explorer': [...hotReloadModules, resolve(__dirname, 'src/block-explorer/index')]
  },
  target: 'web',
  output: {
    path: resolve(__dirname, 'dist'), // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'] },
      { test: /(\.css)$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /(\.scss)$/, use: [
          'style-loader', 'css-loader', 'postcss-loader',
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
