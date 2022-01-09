const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const rewireCssModules = require('react-app-rewire-css-modules');
const path = require("path");
const fs = require("fs");
const rewireBabelLoader = require("react-app-rewire-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = function override(config, env) {
  config = injectBabelPlugin(['import', { libraryName: 'antd',"libraryDirectory": "es", style: true }], config);
  config = injectBabelPlugin(["syntax-dynamic-import"], config);

  config = rewireLess.withLoaderOptions({
    modifyVars: { "@primary-color": "#1DA57A" },
  })(config, env);
  config = rewireCssModules(config, env,{options: { root: '.' }});
  config = rewireBabelLoader.include(
    config,
    resolveApp("node_modules/scratch-vm"),
    resolveApp("node_modules/scratch-utils"),
    resolveApp("node_modules/scratch-audio"),
    resolveApp("node_modules/scratch-parser"),
    resolveApp("node_modules/scratch-render"),
    resolveApp("node_modules/scratch-render-fonts"),
    resolveApp("node_modules/scratch-sb1-converter"),
    resolveApp("node_modules/scratch-storage"),
    resolveApp("node_modules/scratch-utils"),
    resolveApp("node_modules/scratch-svg-renderer"),
    resolveApp("node_modules/scratch-translate-extension-languages"),
    resolveApp("node_modules/gl-matrix")
  );
  config.devtool = false;
  return config;
};



 
