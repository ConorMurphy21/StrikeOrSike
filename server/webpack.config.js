const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  node: {
    __dirname: false
  },
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/js/src'),
    filename: 'server-bundle.js'
  },
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
        test: /\.(txt|aff|dic)$/i,
        type: 'resources'
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};
