---
title: Chrome Devtools 教程一 Elements 面板
date: 2021-07-03 11:01:52
tags:
  - Chrome
category:
  - 技术
  - 教程
---

## 什么是 Chrome Devtools

[Chrome Devtools 官方文档](https://developer.chrome.com/docs/devtools/overview/)

注：谷歌的网站在国内需要翻墙才能看

> Chrome DevTools 是一组直接内置于Google Chrome浏览器中的 Web 开发人员工具。

如果你用 [VsCode](https://code.visualstudio.com/) 的话，它是基于 [Electron](https://www.electronjs.org/apps) 实现的，也有这个调试工具，如图所示

![](vscode-chrome-devtools-example.jpg)

本系列主要讲解 Elements、Console、Network、Sources、Application、Performance、Memory 这七个调试面板（顶级选项卡）
<!-- more -->

## Elements 面板基础用法

在开始研究 Elements 面板之前，我们首先来使用 HMTL 写一个最基本的网页

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elements 面板</title>
</head>
<body>
    <main></main>
</body>
</html>
```

在浏览器中以文件协议或HTTP协议打开该文件后，可以通过 `F12` 或 `Ctrl+Shift+I` 快捷键展开 Chrome Devtools；通过鼠标右键点击页面中某个区域，得到如下菜单

![](menu-check.jpg)

选择检查打开 Chrome Devtools 的 Elements 面板（该方式会自动切换到 Elements 面板并选中右键点击位置对应的元素）；你还可以通过更多工具打开它，如图所示：

![](more-tools-menu.jpg)

刚才的文件打开后在 Chrome Devtools 的 Elements 面板中会得到如下界面

![](elements-simple-example.jpg)

我们能看到大致两个部分，一个是上半部分： DOM 树，以及下半部分 Elements 面板的子选项卡，当 Devtools 足够宽时，它也可以变成左右布局

### DOM 树

当 Elements 面板被打开时，除通过右键检测打开的情况，默认选中的元素是 body 元素，被选中的元素会被标记为 `$0`，同时该元素所在行会被高亮展示，见上面的 Elements 面板示意图，使用键盘 ↑ 或 ↓ 、使用鼠标左键点击 DOM 树中某个标签可以切换被选中的元素

被选中的元素可以在 Console 面板中被访问到，如我们当前选中的元素为 body 元素，则在 Console 面板中输入 `$0`，能得到 body 元素，如下图所示：

![](print-$0-example.jpg)

此时我们将 main 元素选中，则在 Console 面板中打印 `$0` 会得到 main 元素，而 body 元素会被标记为 `$1`（该标记不会在 DOM 树中显示）

![](print-$1-example.jpg)

你可以访问 `$0` ~ `$4` 的元素

DOM 树中的元素如果有子节点，一般来讲，它会被折叠起来，可以通过点击元素标签名展开，可以展开或折叠的元素左侧有三角形标记

#### 在 DOM 树中编辑 DOM

我们在示例代码中的 main 标签下，增加一串 div 标签，用于研究如何在 DOM 树中编辑 DOM 元素

```html
<div class="div1"></div>
<div class="div2"></div>
<div class="div3"></div>
<div class="div4"></div>
<div class="div5"></div>
<div class="div6"></div>
<div class="div7"></div>
<div class="div8"></div>
<div class="div9"></div>
<div class="div10"></div>
<div class="div11"></div>
```

+ 通过拖拽的方式，调整节点在 DOM 树中的顺序

![](dom-transform.jpg)

+ 编辑元素属性

双击元素某一属性节点，可将其变为一个输入框，之后进行编辑即可

![](double-click-attr-and-edit.jpg)

被选中的元素前面有三点的标记，点击会出现菜单，右键点击元素也会出现菜单

![](element-menu.jpg)

+ 右键菜单进行编辑

选择 `Add attribute`，会在该元素最后一个属性值后增加一个输入框，输入新属性即可

当右键点击位置在元素属性节点上时，会有 `Edit attribute` 选项，选择该项会与双击元素属性节点有相同的效果（见上文）

选择 `Duplicate element`，会立即复制该元素（包含所有子节点），并粘贴到该元素之后，根节点 html 无法被复制

选择 `Delete Element`，会删除该元素节点（也可通过选中元素节点后按 `Del` 键，达到同样的效果）

选择 `Edit as HTML`，则你可以像编辑 .html 文件一样编辑被选中的元素节点及其子节点

选择 `Copy`，会展开二级菜单

![](menu-copy-second.jpg)

选择 `Cut element` 和 `Copy element` 能将元素剪切（复制）到剪贴板上，如复制上图中类名为 div6 的元素，会得到如下字符串 `<div class="div6"></div>`，剪切元素后，可以选中一个元素节点（非被剪切元素）通过 `Paste element` 粘贴到它的子节点中，复制元素后，可以选择一个元素节点（可为其自身），通过 `Paste element` 粘贴到它的子节点中

`Copy` 选项的二级菜单，除了上述三个外，都是将节点的相关信息，复制到剪切板上，如 `Copy selector` ，选择上述的类名为 div6 的元素进行 `Copy selector` 的操作，得到如下字符串 `body > div.div5 > div`

回到一级菜单


#### 在 DOM 树中操作 DOM 元素

+ 隐藏元素

选择 `Hide element`，会为被选中的元素节点添加 `__web-inspector-hide-shortcut__` 类名

对应的选择器和样式表为：

```css
.__web-inspector-hide-shortcut__, .__web-inspector-hide-shortcut__ *, .__web-inspector-hidebefore-shortcut__::before, .__web-inspector-hideafter-shortcut__::after {
    visibility: hidden !important;
}
```

通过这种方式被隐藏的元素，在 DOM 树中，该节点左侧会有一个大黑圆点，用于标记元素已被隐藏，再次选择该选项，元素将被解除隐藏

+ Force state

我们先为类名为 .div11 的元素设置一些基础样式

```html
<style>
.div11 {
  height: 100px;
  width: 100px;
  background-color: pink;
}
</style>
```


### 示例代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elements 面板</title>
    <style>
      .div11 {
        height: 100px;
        width: 100px;
        background-color: pink;
      }
    </style>
  </head>
  <body>
    <main></main>
    <div class="div1"></div>
    <div class="div2"></div>
    <div class="div3"></div>
    <div class="div4"></div>
    <div class="div5"></div>
    <div class="div6"></div>
    <div class="div7"></div>
    <div class="div8"></div>
    <div class="div9"></div>
    <div class="div10"></div>
    <div class="div11"></div>
  </body>
</html>
```