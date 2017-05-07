//var webpack = require('webpack');

module.exports = {
    entry: {
        'popup': './app/scripts.babel/popup.js',
        'background': './app/scripts.babel/background.js'
    },
    output: {
    filename: './app/build/[name].js'
    },

    resolve: {
        extensions: ['.js']
    },

    module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.js?$/, loader: 'babel-loader', exclude: /node_modules/
    },
      {
      test: /\.json$/,
      loader: "json-loader"
    }
    ]
  },
  watch: true

};
