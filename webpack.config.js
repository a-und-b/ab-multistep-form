const path = require('path');

module.exports = {
  entry: './src/ab-multistep-form.js',
  output: {
    filename: 'ab-multistep-form.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'WebflowMultistepForm',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: 'production',
  optimization: {
    minimize: true
  }
};
