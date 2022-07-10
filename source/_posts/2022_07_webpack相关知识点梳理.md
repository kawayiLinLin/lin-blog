---
title: webpack相关知识点梳理
date: 2022-07-03 14:58:25
tags:
---

## 与 Webpack 类似的工具有哪些？为什么选择和弃用 Webpack

- [grunt](https://gruntjs.net)

  自动化。对于需要反复重复的任务，例如压缩、编译、单元测试等。在 `Gruntfile` 文件配置任务

  最老牌的打包工具，用配置的思想来写打包脚本，一切皆可配置

  - 优点

    早期出现

  - 缺点

    配置项太多
    不同插件配置项的扩展字段不同
    学习成本高，需要学习不同插件的组合配合方式

  - ES6 -> ES5 demo

    1. 安装

       ```shell
       npm install grunt grunt-babel @babel/core @babel/preset-env -D
       ```

    2. Gruntfile.js

       ```js
       module.exports = function (grunt) {
         // 加载 babel 任务
         grunt.loadNpmTask("grunt-babel")
         // 初始化配置文件
         grunt.initConfig({
           // babel 配置
           babel: {
             options: {
               sourceMap: true,
               // babel预设 ES6 -> ES5
               persets: ["@babel/perset-env"],
             },
             dist: {
               // 把 src/app.js 打包到 dist/app.js
               files: {
                 "dist/app.js": "src/app.js",
               },
             },
           },
         })
         // default 默认/入口任务
         grunt.registerTask("default", ["babel"])
       }
       ```

- gulp

  <!-- more -->

  基于 `nodejs` 的 `stream` 的打包工具
  定位是基于任务流的自动化构建工具
  通过 task 对整个开发过程进行构建

  - 优点

  流式写法，清晰看到资源的流转过程
  API 简单
  易于学习
  适合多页面

  - 缺点

  异常处理麻烦
  工作流顺序难以精细控制
  不太适合单页或自定义模块的开发

  - ES6 - ES5 demo

    1. 安装

       ```shell
       npm install -S -D glup-cli gulp gulp-babel @babel/core @babel/preset-env
       ```

    2. gulpfile.js

       ```js
       const gulp = require("gulp")
       const babel = require("gulp-babel")
       function defaultTask(callback) {
         gulp
           .src("src/app.js") // 读取文件
           .pipe(
             babel({
               // 传给 babel 任务
               presets: ["@babel/preset-env"],
             })
           )
           .pipe(gulp.dest("dist")) // 写到 dist 里
         callback()
       }
       module.exports = defaultTask
       ```

- Webpack

  模块化的打包和管理工具。通过 loader 转换，任何形式的资源都能视为模块
  将按需加载的模块进行代码分割，等到需要的时候再异步加载
  定位是模块打包器，而 Gulp/Grunt 属于构建工具

  - 优点

  可以模块化的打包任何资源
  适合任何模块化系统
  适合 SPA 应用的开发

  - 缺点

  学习成本高，配置复杂
  通过 babel 编译后的 js 体积过大

  - ES6 - ES5 demo

    1. 安装

       ```shell
       npm install webpack
       ```

    2. webpack.config.js

       ```js
       const path = require('path')
       module.exports = {
           mode: 'development', // 开发模式
           devtools: false, // 不生成sourcemap
           entry: "./src/app.js", //入口
           output: {
               path: path.resolve(__dirname, 'dist'),
               filename: 'bundle.js'
           },
           module: {
               rules: [
                   test: /\.jsx?$/,
                   use: {
                       loader: 'babel-loader',
                       options: {
                           presets: ['@babel/preset-env']
                       }
                   },
                   include: path.join(__dirname, 'src'),
                   exclude: /node_modules/
               ]
           },
           plugins: [],
           devServer: {}
       }
       ```

- Rollup

  下一代 ES6 模块化工具，利用 ES6，tree-shaking 生成简洁更简单的代码
  一般而言，类库使用 Rollup，应用使用 Webpack
  需要拆分资源，或者静态资源较多，需要引入较多的 CommonJS 模块时，使用 Webpack
  代码库是基于 ES6 模块，希望代码能被其他人直接使用，使用 Rollup

  - 优点

  用 ES6 写代码，通过减少 dead code 来缩小包的体积

  - 缺点

  代码拆分、静态资源、CommonJS 支持不好

  - ES6 - ES5 demo

    1. 安装

       ```shell
       npm install rollup
       ```

    2. rollup.config.js

       ```js
       import resolve from 'rollup-plugins-node-resolve'
       import babel from 'rollup-plugins-babel'

       export default {
       input: 'src/main.js' // webpack 的 entry
       output: {
           file: 'dist/bundle.js',
           format: 'cjs',
           exports: 'default'
       },
       plugins: [
           resolve(),
           babel({
               "presets": ['@babel/preset-env'],
               exclude: "node_modules/**"
           })
       ]
       }
       ```

- parcel

  快速，零配置的 web 应用程序打包器
  目前只能用于构建在浏览器运行的网页

  - 优点

  内置了常见场景的构建方案及其依赖，无需再安装依赖
  内置开发服务器
  能以 html 为入口，自动检测和打包依赖资源
  支持模块热替换，开箱即用

  - 缺点

  不支持 sourcemap
  不支持 tree-shaking
  配置不灵活

  - ES6 -> ES5 demo

    1. 安装

       ```shell
       npm install -g parcel-bundler

       parcel src/index.html -p 3000
       ```

## Loader 和 Plugins 的不同

- Loader -> 加载器。Webpack 将一切视为模块，但是 Webpack 原生只支持解析 JS 文件，Loader 让 Webpack 具有了加载和解析非 JS 文件的能力

- Plugin -> 插件。Plugin 可以扩展 Webpack 的能力，让 Webpack 更灵活。Webpack 在运行的生命周期中会广播很多事件，插件监听合适的事件，在合适的时机通过 Webpack 提供的 API 改变输出结果

## webpack 基本的工作流

```js
const webpack = require("webpack")
const config = require("./webpack.config.js")

debugger
const compiler = webpack(config)
function compilerCallback(err, stats) {
  const statsString = stats.toString()
  console.log(statsString)
}

compiler.run((err, stats) => {
  compilerCallback(err, stats)
})
```

1. 初始化参数

从配置文件和 shell 文件中读取和合并参数，得出最终的参数

2. 开始编译

用上一步得到的参数初始化 Compiler 对象
加载所有配置的插件，执行对象的 run 方法开始执行编译
根据配置中的 entry 确定入口文件

3. 编译模块

从入口文件触发，调用所有配置的 loader 对模块进行编译
再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理

4. 完成模块编译

使用 loader 翻译完所有的模块后，得到每个模块的资源和对应的依赖关系

5. 输出资源

根据入口和模块的依赖关系，组装成一个个包含多个模块的 Chunk
把每个 Chunk 转换成一个单独的文件加入到输出列表（可以修改输出内容的最后机会）

6. 输出完成

确定好输出内容后，根据配置的输出路径和路径名，把文件写到文件系统（可以指定文件系统 compiler.inputFileSystem compiler.outputFileSystem compiler.watchFileSystem）

伪代码模拟

```js
const { SyncHook } = require("tapable")
const fs = require("fs")

class Compiler {
  constructor(options) {
    this.options = options
    this.hooks = {
      run: new SyncHook(),
      done: new SyncHook(),
    }
  }
  run() {
    const modules = []
    const chunks = []
    const files = []
    this.hooks.run.call()
    // 2.3根据配置中的entry确定入口文件
    const entry = path.join(this.options.context, this.options.entry)
    // 3.1 读取模块内容
    const entryContent = fs.readFileSync(entry, "utf-8")
    // 3.2 使用 loader 解析
    const entrySource = babelLoader(entryContent)
    // module 模块
    // chunk 代码块
    // file 文件
    // bundle
    const entryModule = {
      id: entry,
      source: entrySource,
    }

    modules.push(entryModule)
    // 把入口模块的代码转换成 AST，分析里面的 import 和 require 依赖
    // 继续解析入口引入的模块
    const subEntry = path.join(this.options.context, "subEntryPath")
    // 3.1 读取模块内容
    const subEntryContent = fs.readFileSync(subEntry, "utf-8")
    // 3.2 使用 loader 解析
    const subEntrySource = babelLoader(subEntryContent)

    const subModule = {
      id: subEntry,
      source: subEntrySource,
    }

    modules.push(subModule)
    // 5.1根据入口和模块的依赖关系，组装成一个个包含多个模块的 Chunk
    const chunk = {
      name: "main",
      modules: modules,
    }
    chunks.push(chunk)
    // 5.2把每个 Chunk 转换成一个单独的文件加入到输出列表
    const file = {
      file: this.options.output.filename,
      source: `输出的文件内容`,
    }
    files.push(file)
    const outputPath = path.join(
      this.options.output.path,
      this.options.output.filename
    )
    fs.writeFileSync(outputPath, file.source, "utf-8")
    this.hooks.done.call()
  }
}
// 1. 从配置文件和 shell 文件中读取和合并参数，得出最终的参数
const options = require("./webpack.config.js")
// 2.1用上一步得到的参数初始化 Compiler 对象
const compiler = new Compiler(options)
// 2.2加载所有配置的插件，执行对象的run方法开始执行编译
if (options.plugins && Array.isArray(options.plugins)) {
  for (const plugin of options.plugin) {
    plugin.apply(compiler)
  }
}
// 2.3根据配置中的entry确定入口文件
compiler.run()

// es6 - es5
function babelLoader(source) {
  return "返回解析后的新内容，如 ES6 转 ES5"
}
```

## 常见的 loader 和 plugin

可以通过 create-react-app 创建一个项目，然后 `npm run eject`，暴露配置文件

![](changjiandeloader.jpg)

![](changyongchajian.jpg)

## sourcemap 是什么，生产环境怎么用？

- sourcemap 是为了解决开发代码和实际运行代码不一致时，帮助我们 debug 到原始开发代码的技术
- webpack 是通过配置可以自动给我们 sourcemap 文件，map 文件是一种对应编译文件和源文件的方法

sourcemap 的类型

![](sourcemaps.jpg)

[sourcemap 原理](http://www.zhufengpeixun.com/strong/html/103.14.webpack-sourcemap.html#t152.%20sourcemap)

## 代码分割

1. 入口点分割

在 entry 配置多个入口

可能会导致重复打包 chunk 到多个 bundle 中

2. 动态导入或懒加载

2.1 按需加载 如 React.lazy(() => import('path/file.js'))
2.2 预加载 preload （必须要用到的资源）
`<link href="xxx" rel="preload" as="script" />`

```js
import(
  "file.js"
  /* webpackPreload: true */
  /* webpackChunkName: "file" */
)
```

2.3 预先拉取 prefetch (可能要用到的资源，告诉浏览器可能在未来会用到某个资源，在闲时加载)
`<link href="xxx" rel="prefetch" as="script" />`

```js
import(
  "file.js"
  /* webpackPrefetch: true */
  /* webpackChunkName: "file" */
)
```

module：就是 js 的模块化，webpack 支持 commonJS，ES6 等模块规范，简单说就是可以用 import 引入的代码
chunk：webpack 根据功能拆出来的，包含三种情况

1. 项目入口
2. import 动态引入的
3. 通过 splitChunks 拆分的代码
   bundle：是 webpack 打包后的各个文件，一般和 chunk 是一对一的关系，是对 chunk 进行编译压缩打包处理之后的产物

## 如何通过 webpack 来优化前端性能

1. 压缩JS TerserPlugin
2. 压缩CSS OptimizeCssAssetsPlugin
3. 压缩图片 image-webpack-loader
4. 单独提取CSS MiniCssExtractPlugin
5. 清除无用的CSS purgess-webpack-plugin
6. 