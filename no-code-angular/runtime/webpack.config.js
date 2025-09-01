module.exports = {
  module: {
    rules: [
      {
        test: /\.component\.ts$/,
        loader: '@angular-devkit/build-angular/ivy/loader'
      }
    ]
  }
};