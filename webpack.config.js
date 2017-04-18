//var webpack = require('webpack');

module.exports = {
    entry: {
        'main': './main.ts',
        'backgroundService': './backgroundService.ts'
    },
    output: {
    filename: './build/[name].js'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/
    },
      {
      test: /\.json$/,
      loader: "json-loader"
    }
    ]
  },
  watch: true

};
