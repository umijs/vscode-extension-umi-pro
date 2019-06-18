export default {
  chainWebpack: 'Extend or modify the webpack configuration via the API of webpack-chain',
  context: 'Configuring a global context will override the context in each page',
  disableRedirectHoist: 'whether to disable redirect hoist. false by default',
  exportStatic:
    'If set to true or Object, all routes are exported as static pages, otherwise only one index.html is output by default',
  outputPath: 'Specifies the output path',
  runtimePublicPath: 'Use the window.publicPath specified in the HTML when the value is true',
  cssPublicPath: 'Specify an extra publicPath for CSS',
  minimizer: 'Which minimizer to use. UglifyJS does not support es6 while terser does',
  hash: 'Whether to enable the hash file suffix',
  mock: 'Specify config for mock',

  singular: 'If set to true, enable the directory for singular mode',
  treeShaking: 'Configure whether to enable treeShaking, which is off by default',

  base:
    'Specify the base of the react-router to be configured when deploying to a non-root directory',
  history: 'Specify the history type, including browser, hash and memory',
  mountElementId: 'Specifies the mount point id which the react app will mount to',
  targets:
    'Configuring the minimum version of browsers you want to compatible with, umi will automatically introduce polyfill and transform grammar',
  theme:
    'The configuration theme is actually equipped with the less variable. Support for both object and string types, the string needs to point to a file that returns the configuration',
  define:
    "Passed to the code via the webpack's DefinePlugin , the value is automatically handled by JSON.stringify",
  externals: 'Configure the externals property of webpack',
  alias: 'Configure the resolve.alias property of webpack',
  devServer: 'Configure the devServer property of webpack',
  devtool: 'Configure the devtool property of webpack',
  disableCSSModules: 'Disable CSS Modules',
  disableCSSSourceMap: 'Disable SourceMap generation for CSS',
  extraBabelPresets: 'Define an additional babel preset list in the form of an array',
  extraBabelPlugins: 'Define an additional babel plugin list in the form of an array',
  extraBabelIncludes:
    'Define a list of additional files that need to be babel converted, in the form of an array, and the array item is webpack#Condition',
  extraPostCSSPlugins: 'Define additional PostCSS plugins in the format of an array',
  cssModulesExcludes:
    'The files in the specified project directory do not go css modules, the format is an array, and the items must be css or less files',
  copy:
    'Define a list of files that need to be copied simply. The format is an array. The format of the item refers to the configuration of copy-webpack-plugin',
  proxy:
    'Configure the proxy property of webpack-dev-server. If you want to proxy requests to other servers',
  sass:
    'Configure options for node-sass. Note: The node-sass and sass-loader dependencies need to be installed in the project directory when using sass',
  manifest:
    'After configuration, asset-manifest.json will be generated and the option will be passed to https://www.npmjs.com/package/webpack-manifest-plugin',
  ignoreMomentLocale: 'Ignore the locale file for moment to reduce the size',
  lessLoaderOptions: 'Additional configuration items for less-loader',
  cssLoaderOptions:
    'Additional configuration items for css-loader.Configure the resolve.alias property of webpack',
  autoprefixer: 'Configuration for autoprefixer',
  uglifyJSOptions: 'Configuration for uglifyjs-webpack-plugin@1.x',
  browserslist: 'Configure browserslist to work with babel-preset-env and autoprefixer',
  plugins:
    'Specify the plugins. The array item is the path to the plugin and can be an npm dependency, a relative path, or an absolute path',
  routes: "Configure routing. Umi's routing is based on react-router",
};
