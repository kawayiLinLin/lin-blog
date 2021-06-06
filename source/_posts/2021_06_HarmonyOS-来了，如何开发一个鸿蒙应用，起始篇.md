---
title: HarmonyOS 来了，如何开发一个鸿蒙应用，起始篇
date: 2021-06-06 09:34:10
tags:
---

## 怎么开始呢

进入[鸿蒙 OS 官网](https://www.harmonyos.com/cn/home/)，下载 `HUAWEI DevEco Studio`

之后直接预览下载的压缩包，并点击这个可执行文件

<!-- more -->

![](harmony-devtools-install-example.png)

等待几秒后，出现这样的界面，点 `Next >`

![](harmony-devtools-start-setup.png)

选择一个安装路径，不要安装在系统盘哦

![](harmony-devtools-choose-path.png)

进行一些安装前的初始化设置，依次是桌面添加快捷方式，更新环境变量，鼠标右键菜单增加选项，我们先只选第一个

![](harmony-devtools-setup-settings.png)

下一步是选择项目的默认目录，没什么用，直接 `Install`

![](harmony-devtools-setup-project-folder.png)

安装完成后，点 `Finish` ，然后找到快捷方式

![](harmony-devtools-shortcut.png)

双击打开，点击 `Agree`

![](harmony-devtools-agree.png)

弹出提示，看到了熟悉的 `npm`，大意就是这个开发工具需要 `npm`，你要配置下载源，默认值给的是华为源，那不用管，右下角直接确定

![](harmony-devtools-customize.png)

下一步是装 SDK，路径不要选系统盘

![](harmony-devtools-sdk-setup.png)

确认一下信息

![](harmony-devtools-setting-confirmation.png)

同意，然后等待几分钟下载安装

![](harmony-devtools-sdk-agree.png)

安装完成后，我们创建一个项目试一下

![](harmony-devtools-home.png)

选择一个模板，选哪个参考 [https://developer.harmonyos.com/cn/docs/documentation/doc-guides/device_template-0000001053702407](https://developer.harmonyos.com/cn/docs/documentation/doc-guides/device_template-0000001053702407)，作为一个 JavaScript 攻城狮，那我们肯定找个 JS 的，选这个吧

![](harmony-project-choose.png)

![](harmony-devtools-project-example-choose.png)

配置下项目初始信息

![](harmony-devtools-project-setting.png)

打开项目后，按下 `Alt + 3`，打开预览，得到如下的页面

![](harmony-js-project.png)

## 动手做一个计算器吧

### 简单的需求分析

首先看看华为自带的计算器长啥样吧

![](calculator-example.jpg)

右上角有一个更多了，可以选择科学计数法和历史记录，这里我们只做历史记录

中间是输入内容以及计算结果的显示区域

下半部分是计算器的按钮区域

### 看看文档

回到开发工具中，Harmony JS 应用的目录结构见 [https://developer.harmonyos.com/cn/docs/documentation/doc-references/js-framework-file-0000000000611396](https://developer.harmonyos.com/cn/docs/documentation/doc-references/js-framework-file-0000000000611396)

需要关注的几个文件和文件夹就是

```txt
/entry/src/main/js/default/app.js 用于全局JavaScript逻辑和应用生命周期管理
/entry/src/main/js/default/common 用于存放公共资源文件，比如：媒体资源，自定义组件和JS文件
/entry/src/main/js/default/pages 用于存放所有组件页面
```

关于 `HML` 、 `CSS` 和 `JS` 语法请参考[文档](https://developer.harmonyos.com/cn/docs/documentation/doc-references/js-framework-syntax-hml-0000000000611413)

如果你开发过小程序或者 vue 应用，那你可能只需要关注下这几点

- hml

  - 事件绑定
  - 模板引用

- css

  - 尺寸单位
  - 选择器（看看一共有几个）-伪类 `:waiting`
  - 样式预编译

- js
  - 全部都看

### 直接开始

将项目中的 /entry/src/main/js/default/pages/index 中不需要的代码删除

hml 中只保留这部分

```html
<div class="container">
  <!-- top tool bar  -->
  <div class="top-tool-bar">
    <image
      class="toolbar-image1"
      src="{{ images_resource.image_add }}"
      @click="backHome"
    ></image>
    <text class="title"> {{ $t('strings.title') }} </text>
  </div>

  <!-- body  -->
</div>
```

我们稍作改动，计算器最上边不需要显示文字，只有右上角显示一个更多的图标

```html
<div class="top-tool-bar">
  <image
    class="toolbar-more"
    src="{{ images_resource.more }}"
    @click="handleMore"
  ></image>
  <!-- 删除了 text 组件 -->
  <!-- 修改了 image 组件类名 -->
  <!-- 修改了 image 组件绑定事件回调名，记得同步修改 js 文件中的函数名 -->
  <!-- 修改了绑定图片路径 images_resource 的属性名，原为 image_add -->
</div>
```

```css
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  left: 0px;
  top: 0px;
  background-color: rgb(233, 236, 241); /* 增加背景色定义 */
}
.top-tool-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end; /* 增加这一行 */
  align-items: center;
  width: 100%;
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
}

.toolbar-more {
  /* 修改了选择器名，原为 toolbar-image1  */
  width: 24px;
  height: 24px;
  margin-left: 16px; /* right 改为 left */
  opacity: 0.9;
}
```

我们裁剪下上面那张华为计算器的图，使用 PhotoShop 保留右上角的图标，并将其底色置为透明，尺寸裁剪为 48 \* 48 （下图为 96）

![](more-icon-example.png)

使用 input 组件给数值展示区域和结果区域预留两个位置

接下来造数据用于渲染键盘区域

```javascript
const typeDict = {
  other: "other",
  number: "number",
  operator: "operator",
  confirm: "confirm",
};

export default {
  data: {
    typeDict,
    keyboardItemsNormal: [
      [
        {
          keyName: "MC",
          id: 1,
          type: typeDict.other,
        },
        {
          keyName: "M+",
          id: 2,
          type: typeDict.other,
        },
        {
          keyName: "M-",
          id: 3,
          type: typeDict.other,
        },
        {
          keyName: "MR",
          id: 4,
          type: typeDict.other,
        },
      ],
      [
        {
          keyName: "C",
          id: 5,
          type: typeDict.other,
        },
        {
          keyName: "÷",
          id: 6,
          type: typeDict.operator,
        },
        {
          keyName: "×",
          id: 7,
          type: typeDict.operator,
        },
        {
          keyName: "⇐",
          id: 8,
          type: typeDict.other,
        },
      ],
      [
        {
          keyName: "7",
          id: 9,
          type: typeDict.number,
        },
        {
          keyName: "8",
          id: 10,
          type: typeDict.number,
        },
        {
          keyName: "9",
          id: 11,
          type: typeDict.number,
        },
        {
          keyName: "-",
          id: 12,
          type: typeDict.operator,
        },
      ],
      [
        {
          keyName: "4",
          id: 13,
          type: typeDict.number,
        },
        {
          keyName: "5",
          id: 14,
          type: typeDict.number,
        },
        {
          keyName: "6",
          id: 15,
          type: typeDict.number,
        },
        {
          keyName: "+",
          id: 16,
          type: typeDict.operator,
        },
      ],
    ],
    keyboardItemsLastTwoLine: [
      [
        {
          keyName: "1",
          id: 17,
          type: typeDict.number,
        },
        {
          keyName: "2",
          id: 18,
          type: typeDict.number,
        },
        {
          keyName: "3",
          id: 19,
          type: typeDict.number,
        },
      ],
      [
        {
          keyName: "%",
          id: 21,
          type: typeDict.operator,
        },
        {
          keyName: "0",
          id: 22,
          type: typeDict.number,
        },
        {
          keyName: ".",
          id: 23,
          type: typeDict.number,
        },
      ],
    ],
    keyboardItemConfirm: {
      keyName: "=",
      id: 20,
      type: typeDict.confirm,
    },
  },
};
```

hml body 区域

```html
<!-- 最上方 -->
<element src="./components/keyboard-button/keyboard-button.hml" name="keyboard-button">
</element>
<!-- body  -->
    <div class="result">
        <input class="expression-input" value="1+2"></input>
        <input class="result-input" value="3"></input>
    </div>
    <div class="keyboard">
        <block for="{{ (index, row) in keyboardItemsNormal }}">
            <div tid="{{ index }}" class="keyboard-row">
                <block for="{{ (rowIndex, item) in row }}">
                    <div tid="item.id" class="keyboard-item">
                        <keyboard-button type="{{ item.type }}" text="{{ item.keyName }}" type-dict="{{ typeDict }}">
                        </keyboard-button>
                    </div>
                </block>
            </div>
        </block>
        <div class="keyboard-row-last">
            <div class="keyboard-row-last-left">
                <block for="{{ (index, row) in keyboardItemsLastTwoLine }}">
                    <div tid="{{ index }}" class="keyboard-row">
                        <block for="{{ (rowIndex, item) in row }}">
                            <div tid="item.id" class="keyboard-item" style="width: 200px;">
                                <keyboard-button type="{{ item.type }}" text="{{ item.keyName }}" type-dict="{{ typeDict }}">
                                </keyboard-button>
                            </div>
                        </block>
                    </div>
                </block>
            </div>
            <div class="keyboard-row-last-right">
                <keyboard-button type="{{ keyboardItemConfirm.type }}" text="{{ keyboardItemConfirm.keyName }}" type-dict="{{ typeDict }}">
                </keyboard-button>
            </div>
        </div>
    </div>
```

css 新增

```css
.result {
  display: flex;
  flex-direction: column;
}

.result input {
  background-color: transparent;
}

.result .expression-input {
  height: 60px;
  font-size: 30px;
  font-weight: bold;
}

.keyboard {
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.keyboard .keyboard-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-height: 100px;
}

.keyboard .keyboard-row .keyboard-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
}

.keyboard-row-last {
  display: flex;
  flex: 1;
  flex-direction: row;
}

.keyboard-row-last .keyboard-row-last-left {
  display: flex;
  width: 75%;
  flex-direction: column;
}

.keyboard-row-last .keyboard-row {
  max-height: 100px;
}
```

它不支持动态绑定 class，很不灵活，所以模板写的很恶心，如果布局非常复杂就会很难实现，flex 布局表现也和 chrome 不一致，感觉直接用宽高进行定义比较好

keyboard-button 是我添加的自定义组件，为了应付它不支持动态 class 的问题

keyboard-button.hml

```html
<div>
  <button type="circle" class="other" if="{{ type === typeDict.other }}">
    {{ text }}
  </button>
  <button type="circle" class="number" elif="{{ type === typeDict.number }}">
    {{ text }}
  </button>
  <button
    type="circle"
    class="operator"
    elif="{{ type === typeDict.operator }}"
  >
    {{ text }}
  </button>
  <button class="confirm" elif="{{ type === typeDict.confirm }}">
    {{ text }}
  </button>
</div>
```

keyboard-button.css

```css
button {
  height: 65px;
  font-size: 25px;
  font-weight: bold;
}

.other {
  font-weight: normal;
  font-size: 18px;
  text-color: #333333;
  background-color: #ffffff;
}

.operator {
  text-color: rgb(59, 110, 209);
  background-color: #fff;
  font-size: 30px;
}

.confirm {
  height: 170px;
  width: 60px;
  border-radius: 30px;
  margin-left: 20px;
  margin-top: 15px;
}
```

keyboard-button.js

```js
export default {
  props: ["type", "typeDict", "text"],
};
```

最后的预览图长这个样子

![](harmony-project-priview.png)

试一下系统能力，点击按钮长震动，由于我们是自定义组件，所以需要触发自定义事件

在 keyboard-button 组件中，触发自定义事件 click，参数为 `this.text`

```js
this.$emit("click", this.text);
```

index.hml

```html
<keyboard-button @click="handleClick"></keyboard-button>
```

index.js

```js
import vibrator from "@system.vibrator";

export default {
  // ...
  handleClick(event) {
    vibrator.vibrate({
      mode: "long",
      success() {
        console.log("success to vibrate");
      },
      fail(data, code) {
        console.log(`handle fail, data = ${data}, code = ${code}`);
      },
    });
  },
};
```

### 真机试验

上真机试验效果，怎么上真机呢，先拿数据线把手机连接上电脑，手机打开 开发者模式，打开 USB 调试，选择传输文件

之后可以看这篇文档 [https://developer.harmonyos.com/cn/docs/documentation/doc-guides/ide_debug_device-0000001053822404](https://developer.harmonyos.com/cn/docs/documentation/doc-guides/ide_debug_device-0000001053822404)

真机安装上 app 后，点击按钮并没有震动，查文档发现需要在 `config.json` 里加入这样一条

```json
{
  "reqPermissions": [
    {
      "name": "ohos.permission.VIBRATE",
      "reason": "",
      "usedScene": {
        "ability": [".MainAbility"],
        "when": "inuse"
      }
    }
  ]
}
```

之后再编译运行，点击按钮就可以震动了！

下次让我们在 HarmonyOS 来了，如何开发一个鸿蒙应用，上篇 相遇吧