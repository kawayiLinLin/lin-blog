---
title: "TypeScript进阶, 如何避免 any"
date: 2021-05-08 11:59:06
category:
  - 技术
  - 分享
tags:
  - TypeScript
---

## 为什么会出现 `any`

- 不知道如何准确的定义出类型，`TS` 报错了，用 `any` 能解决，便用 `any` 了
- 觉得定义类型浪费时间，项目经理催的紧，工期紧张，`any` 更方便

## 频繁使用 `any` 的弊端

- 不利于良好的编码习惯
- 不利于项目的后续维护
- 会出现很多本可避免的 `bug`

<!-- more -->

## 不使用 `any` 的好处

- 良好的代码提示
- 强大的静态类型检查
- 可读性和可维护性

**所以，我们要对 AnyScript 说不！**

## TS 容易出现 `any` 的场景梳理

### 给 window 全局对象增加属性

常常能见到这样的写法

```typescript
;(<any>window).obj = {}(
  // 或
  window as any
).obj = {}
```

这样做，在使用时和赋值时都需要断言一次，非常麻烦，并且使用时也不能得到代码提示

正确的做法应该是

1. 在项目全局的 `xxx.d.ts` 文件中配置如下代码

```typescript
interface Window {
  obj: {}
}
```

2. 在需要给 `window` 赋值的文件目录下级新建一个 `@types` 文件夹，并在其中新建 `index.d.ts` 文件，添加如下代码

```typescript
interface Window {
  obj: {}
}
```

方法 2 也会在全局的 `window` 上增加 `obj` 这一声明，如果新增属性使用的跨度比较大，则推荐放在项目的 `index.d.ts` 中更利于维护，两种方式都在全局给 `window` 添加了属性，但方法 1 能一眼看出项目中 `window` 中添加了什么属性

### 正确使用可选链、非空断言

错误的理解 `typescript` 的可选参数，而使用断言导致隐患

```ts
const a: {
  b: string
  c?: {
    d: string
  }
} = {
  b: "123",
}

console.log((<any>a).c.d) // 错误，这样访问会报错，应使用可选链
console.log(a.c!.d) // 错误，ts 不会将错误抛出，但实际访问也会报错
```

`!` 非空断言与 `as` 有相似之处，主要用于断言某个属性的值不为 `null` 和 `undefined`，它不会影响最终的代码产物，只会影响代码编译过程中的类型校验

`?.` [可选链操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining) 会影响编译后的代码产物，如：

这段 ts 代码

```ts
const a = {
  c: undefined,
}

const b = a?.c?.d
```

会被编译为如下 js 代码

```js
"use strict"

var _a$c

const a = {
  c: undefined,
}
const b =
  a === null || a === void 0
    ? void 0
    : (_a$c = a.c) === null || _a$c === void 0
    ? void 0
    : _a$c.d
```

### 将对象属性类型关联起来

对象中有多个属性是联合类型，其中 `a` 属性和 `b` 属性是有关联的，`a` 为 `1` 时，`b` 为 `string`，`a` 为 `2` 时，`b` 为 `number`
我们通常是这样定义的

```ts
const obj: {
  a: 1 | 2
  b: string | number
} = {
  a: 1,
  b: "1.2"
}
```

那么使用时，会造成需要用断言来再次限定 `b` 的范围的情况，如下代码段所示

```ts
if (obj.a === 1) {
  const [left, right] = (obj.b as string).split(".")
}
// 如果你偷懒，那可能又变成了这样的情况
if (obj.a === 1) {
  const [left, right] = (obj.b as any).split(".")
}
```

有没有什么办法能让我们不再 `as` 一次呢？有

```ts
const obj: {
  a: 1
  b: string
} | {
  a: 2
  b: number
} = {
  a: 1,
  b: "1.2"
}
// 你会发现这样定义了以后，不需要再次进行断言限定 obj.b 的范围
if (obj.a === 1) {
  const [left, right] = obj.b.split(".") // 校验通过
}
```

如果我们把这样的方法应用到函数（也可以用重载实现）传参或组件传参，有意思的是它还能限定传参的范围，
函数组件实现：

![](funciton-components-params-1.png)

错误的传参，`a` 与 `b` 的类型不匹配，校验不通过

![](funciton-components-params-2.png)

正确的传参，校验能通过

![](funciton-components-params-3.png)

注意：你不能将 `props` 解构出来，会导致两者的关系丢失

```ts
const { a, b } = props // 错误，a 和 b 的类型关系丢失
```

是否使用联合类型需要辩证的看待，在任何时候都用上述方法定义可能会造成一些臃肿

### 巧用类型保护避免断言

在 `typescript` 中，常用的类型保护为 `typeof` 、`instanceof`、和 `in` 关键字
掌握上述关键字较为容易，可通过文档了解
还有一个关键字 `is` （类型谓词）是 `typescript` 提供的，是另一种“类型保护”（这种说法助于理解）