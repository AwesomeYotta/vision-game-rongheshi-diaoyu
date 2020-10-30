const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TinypngPlugin = require('tinypng-plugin-webpack-full-featured');
const StaticResourceConfig = require('./h5-game-util/util/StaticResourceConfig.js');

const merge = require('webpack-merge');
const isProduction = process.env.NODE_ENV === 'production';

const modes = {
    [true]: 'production',
    [false]: 'development'
}

const config = {
    context: __dirname,

    entry: ['babel-polyfill', './src/main.ts'],

    output: {
        filename: 'app.[contenthash:7].js',
        path: path.join(__dirname, './dist')
    },

    target: 'web',

    mode: modes[isProduction],

    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            '@': path.resolve(__dirname, './h5-game-util'),
            '#': path.resolve(__dirname, './src/assets'),
            'http': path.resolve(__dirname, './src/http'),
            'game': path.resolve(__dirname, './src/game'),
            'common': path.resolve(__dirname, './src/common')
        }
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
            
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }, {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'tslint-loader'
            }, {
                test: /\.ts$/,
                loader: 'ts-loader'
            }, {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: false,
                    name: 'image/[name].[contenthash:7].[ext]'
                }
            }, {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: false,
                    name: 'media/[name].[contenthash:7].[ext]'
                }
            }, {
                test: /\.(scss|sass)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }, {
                test: /\.(eot|ttf|woff|woff2)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: false,
                    name: 'media/[name].[contenthash:7].[ext]'
                }
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            createjsPathProd: StaticResourceConfig.createjsPathProd,
            createjsPathTest: StaticResourceConfig.createjsPathTest,
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        }),
        new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname, './') }),
        new MiniCssExtractPlugin({
            filename: './css/style.[contenthash:7].css'
        }),
        new OptimizeCSSAssetsPlugin({}),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        }),
        new TinypngPlugin({
            from: path.resolve(__dirname, './src/assets/img'),
            extentions: ['png', 'jpeg', 'jpg'],
            silent: false,
            cache: true,
        })
    ]
};

if (isProduction) {
    const TerserPlugin = require('terser-webpack-plugin');
    module.exports = merge(config, {
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    test: /\.js(\?.*)?$/i,
                    terserOptions: {
                        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                        extractComments: 'all',
                        compress: {
                            drop_console: true,
                        },
                    }
                }),
            ],

        }
    });
    } else {
    module.exports = merge(config, {
        devtool: 'source-map',
        devServer: {
            port: 9000,
            open: true,
            watchContentBase: true,
            historyApiFallback: true,
            proxy: {
                '/api': {
                    target: 'http://vision-api.yottasystem.com',
                    pathRewrite: { '^/api': '' },
                    changeOrigin: true
                },
                '/ossimg': {
                    target: 'https://vision-backend.oss-cn-beijing.aliyuncs.com',
                    pathRewrite: { '^/ossimg': '' },
                    changeOrigin: true
                }
            }
        }
    });
}