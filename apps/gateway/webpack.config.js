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
    publicPath: 'http://localhost:4200/',
    clean: true,
  },
  devServer: {
    port: 4200,
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
      name: 'gateway',
      filename: 'remoteEntry.js',
      remotes: {
        mfeAccounts: 'mfeAccounts@http://localhost:4201/remoteEntry.js',
        mfeTransactions: 'mfeTransactions@http://localhost:4202/remoteEntry.js',
        mfePayments: 'mfePayments@http://localhost:4203/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
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
      favicon: './public/favicon.ico',
    }),
  ],
};
