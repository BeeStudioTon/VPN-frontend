/* eslint-disable import/no-extraneous-dependencies */

import { Configuration, SourceMapDevToolPlugin, ProvidePlugin } from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import 'webpack-dev-server'
import fs from 'fs'

const { IgnorePlugin } = require('webpack')

const config: Configuration = {
    mode: 'none',
    entry: { app: path.join(__dirname, 'src', 'index.tsx') },
    target: 'web',
    devtool: 'inline-source-map',
    devServer: {
        static: { directory: path.join(__dirname, 'public') },
        compress: true,
        https: {
            key: fs.readFileSync('./server.key'),
            cert: fs.readFileSync('./server.cert'),
            rejectUnauthorized: false
          },
        hot: true,
        port: 3000,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*'
        },
        historyApiFallback: true,
        client: { overlay: false }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: { allowTsInNodeModules: true }
            },
            {
                test: /\.tsx?$/,
                include: /node_modules/,
                loader: 'ts-loader',
                options: { allowTsInNodeModules: true }
            },
            {
                test: /\.(css|scss)$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: [ 'source-map-loader' ]
            },
            {
                test: /\.(jpe?g|gif|png|svg)$/i,
                exclude: /\.svg$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: { limit: 10000 }
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [ '@svgr/webpack' ]
            }
        ]
    },
    ignoreWarnings: [ /Failed to parse source map/ ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.join(__dirname, 'public', 'index.html') }),
        new SourceMapDevToolPlugin({ filename: '[file].map' }),
        new ProvidePlugin({ Buffer: [ 'buffer', 'Buffer' ] }),
        new ProvidePlugin({ process: 'process/browser.js' }),
        new IgnorePlugin({ resourceRegExp: /^node:/ }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/locales', to: 'locales' }
            ]
        }),
    ],
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
        alias: {
            process: 'process/browser.js'
            // react: require.resolve("react"),
            // 'react-dom': require.resolve('react-dom')
        },
        fallback: {
            util: require.resolve('util/'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            assert: require.resolve('assert'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify'),
            url: require.resolve('url'),
            path: require.resolve('path-browserify'),
            vm: require.resolve('vm-browserify'),
            module: require.resolve('module'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify')
        }
    }
}

// eslint-disable-next-line import/no-default-export
export default config