'use strict';
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const processedEntries = require('./../../processedEntries');
const nodeModulesForBabel = require('./../nodeModulesForBabelLoader');

const envUrl = process.env.ENV_URL;

module.exports = {
  entry: {
    client: './Project/<%= solutionX %>/client/client.index.tsx',
    devServer: './scripts/webpack/environments/development/devServerEntry.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: '/scripts/webpack/environments/development',
    publicPath: '/',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './scripts/webpack/environments/development/',
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api/**': {
        target: envUrl,
        changeOrigin: true,
      },
      '/sitecore/**': {
        target: envUrl,
        changeOrigin: true,
      },
      '/-/{media,jssmedia}/**': {
        target: envUrl,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css', '.less', '.json'],
    alias: {
      dataprovideralias: path.resolve(process.cwd(), './Project/<%= solutionX %>/client/dataProvider/DataProvider.dev'),
      Foundation: path.resolve(process.cwd(), './Foundation/'),
      Project: path.resolve(process.cwd(), './Project/'),
      Feature: path.resolve(process.cwd(), './Feature/'),
    },
  },
  module: {
    rules: [
      {
        test: [/\.jpe?g$/, /\.png$/, /\.svg$/, /\.ttf$/, /\.otf$/, /\.eot/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: '[name].[ext]',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: nodeModulesForBabel,
        loader: require.resolve('babel-loader'),
        options: {
          compact: true,
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: require.resolve('style-loader'),
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              // Necessary for external CSS imports to work
              // https://github.com/facebookincubator/create-react-app/issues/2677
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-object-fit-images'),
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
          {
            loader: require.resolve('less-loader'),
          },
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
      include: ['/Project/', '/Feature/', '/Foundation/'],
      tsconfig: './tsconfig.json',
      tslint: './tslint.json',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.ENV_URL': JSON.stringify(process.env.ENV_URL),
      'process.env.STATIC_CONTENT': JSON.stringify(process.env.STATIC_CONTENT),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
