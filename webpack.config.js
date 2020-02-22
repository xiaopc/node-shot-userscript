const path = require('path')
const WebpackUserscript = require('webpack-userscript')
const dev = process.env.NODE_ENV === 'development'

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'node-shot.user.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  plugins: [
    new WebpackUserscript({
      headers: {
        name: "node-shot 网页元素截图",
        version: dev ? `[version]-build.[buildNo]` : `[version]`,
        description: "node-shot 支持选择网页的某个元素进行截图，可以导出为 PNG/JPG/SVG。 This script can make the screenshot of a certain node in a page, and export as PNG/JPG/SVG.",
        homepage: "https://github.com/xiaopc/node-shot-userscript/",
        match: dev ? "*://xiaopc.org/*" : "*://*/*",
      },
      metajs: false
    })
  ]
}