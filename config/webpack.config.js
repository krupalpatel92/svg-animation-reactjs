const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  resolve: {
    fallback: {
      "fs": false
    }
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-inline-loader'
          }
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ogg|mp3|wav)$/i,
        type: 'asset/resource',
        generator: {
          outputPath: 'audio/',
          publicPath: 'audio/',
        },
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body",
      publicPath: "./",
      assetModuleFilename: 'assets/[hash][ext][query]'
    })
  ],
}