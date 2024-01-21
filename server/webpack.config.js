const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  node: {
    __dirname: false
  },
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/js/src'),
    filename: 'server-bundle.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'resources', to: '../../resources' }]
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    plugins: [new TsconfigPathsPlugin()]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          compilerOptions: {
            noEmit: false
          }
        }
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};
