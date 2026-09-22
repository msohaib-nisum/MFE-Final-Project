const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('../../package.json').dependencies;

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: 'http://localhost:4201/',
    clean: true,
  },
  devServer: {
    port: 4201,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@banking/shared-types': path.resolve(__dirname, '../../libs/shared-types/src'),
      '@banking/shared-ui': path.resolve(__dirname, '../../libs/shared-ui/src'),
      '@banking/state': path.resolve(__dirname, '../../libs/state/src'),
      '@banking/events': path.resolve(__dirname, '../../libs/events/src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeAccounts',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
          eager: true,
        },
        '@reduxjs/toolkit': {
          singleton: true,
          requiredVersion: deps['@reduxjs/toolkit'],
        },
        'react-redux': {
          singleton: true,
          requiredVersion: deps['react-redux'],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
