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

- [gulp]()

  基于 `nodejs` 的 `stream` 的打包工具
  定位是基于任务流的自动化构建工具
  通过 task 对整个开发过程进行构建

  - 优点

  流式写法
  API 简单
  易于学习
  适合多页面

  - 缺点

  异常处理麻烦
  工作流顺序难以精细控制
  不太适合单页或自定义模块的开发

  - ES6 - ES5 demo

    ```shell
    npm install -g gulp-cli
    npm install -D gulp
    npx touch nodetouch gulpfile.js

    npm install -S -D glup-cli gulp gulp-babel @babel/core @babel/preset-env
    ```