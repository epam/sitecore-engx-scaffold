'use strict';
const path = require('path');
const autoprefixer = require('autoprefixer');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const processedEntries = require('./../processedEntries');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeModulesForBabel = require('./nodeModulesForBabelLoader');
const webpack = require('webpack');

module.exports = [
  {
    target: 'web',
    entry: processedEntries('./Project/*/client/client.index.tsx', 'build'),
    output: {
      filename: '[name].bundle.js',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.css', '.less'],
      alias: {
        dataprovideralias: path.resolve(process.cwd(), './Project/<%= solutionX %>/client/dataProvider/DataProvider.prod'),
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
        { test: /\.json$/, loader: 'json-loader' },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader',
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
              'less-loader',
            ],
          }),
        },
      ],
    },
    plugins: [
      // new BundleAnalyzerPlugin({
      //   analyzerMode: 'static',
      // }),
      new ForkTsCheckerWebpackPlugin({
        async: false,
        include: ['/Project/', '/Feature/', '/Foundation/'],
        tsconfig: './tsconfig.json',
        tslint: './tslint.json',
      }),
      new ExtractTextPlugin('./Project/<%= solutionX %>/client/build/styles.css'),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor.bundle',
        filename: 'Project\\<%= solutionX %>\\client\\build\\vendor.bundle.js',
        minChunks(module, count) {
          var context = module.context;
          return context && context.indexOf('node_modules') >= 0;
        },
      }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'react.bundle',
      //   filename: 'Project\\<%= solutionX %>\\client\\build\\react.bundle.js',
      //   minChunks(module, count) {
      //     var context = module.context;
      //     return context && context.indexOf('node_modules') >= 0 && (context.indexOf('react') >= 0 || context.indexOf('redux') >= 0 || context.indexOf('saga') >= 0);
      //   },
      // }),
    ],
  },
  // -------------------------------------------------------------------
  // Un-comment this part of configuration in order to generate server bundle
  // -------------------------------------------------------------------
  // {
  //   target: 'node',
  //   entry: processedEntries('./Project/*/client/server.index.tsx', 'build'),
  //   output: {
  //     filename: '[name].bundle.js',
  //     libraryTarget: 'this', // this option is required for use with JavaScriptViewEngine
  //   },
  //   resolve: {
  //     extensions: ['.tsx', '.ts', '.js', '.css', '.less'],
  //     alias: {
  //       dataprovideralias: path.resolve(process.cwd(), './Project/<%= solutionX %>/client/dataProvider/DataProvider.prod'),
  //       Foundation: path.resolve(process.cwd(), './Foundation/'),
  //       Project: path.resolve(process.cwd(), './Project/'),
  //       Feature: path.resolve(process.cwd(), './Feature/'),
  //     },
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: [/\.jpe?g$/, /\.png$/, /\.svg$/, /\.ttf$/, /\.otf$/, /\.eot/],
  //         loader: require.resolve('url-loader'),
  //         options: {
  //           limit: 10000,
  //           name: '[name].[ext]',
  //         },
  //       },
  //       {
  //         test: /\.(ts|tsx)$/,
  //         exclude: /node_modules/,
  //         use: [
  //           {
  //             loader: require.resolve('ts-loader'),
  //             options: {
  //               // disable type checker - we will use it in fork plugin
  //               transpileOnly: true,
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         test: /\.js$/,
  //         exclude: nodeModulesForBabel,
  //         loader: require.resolve('babel-loader'),
  //         options: {
  //           compact: true,
  //         },
  //       },
  //       { test: /\.less$/, loader: 'ignore-loader' },
  //     ],
  //   },
  //   plugins: [
  //     new ForkTsCheckerWebpackPlugin({
  //       async: false,
  //       include: ['/Project/', '/Feature/', '/Foundation/'],
  //       tsconfig: './tsconfig.json',
  //       tslint: './tslint.json',
  //     }),
  //     new CopyWebpackPlugin([
  //       {
  //         from: './Project/<%= solutionX %>/client/Assets/fonts/*',
  //         to: './Project/<%= solutionX %>/client/build/fonts/',
  //         flatten: true,
  //       },
  //     ]),
  //     new CopyWebpackPlugin([
  //       {
  //         from: './Project/<%= solutionX %>/client/Assets/*.*',
  //         to: './Project/<%= solutionX %>/client/build/',
  //         flatten: true,
  //       },
  //     ]),
  //   ],
  // },
];
