---
title: 'TypeScript进阶, 如何避免 any'
date: 2021-05-08 11:59:06
category:
- 技术
- 分享
tags:
- TypeScript
---

## 为什么会出现 `any`

+ 不知道如何准确的定义出类型，`TS` 报错了，用 `any` 能解决，便用 `any` 了
+ 觉得定义类型浪费时间，项目经理催的紧，工期紧张，`any` 更方便

## 频繁使用 `any` 的弊端

+ 不利于良好的编码习惯
+ 不利于项目的后续维护
+ 会出现很多本可避免的 `bug`

<!-- more -->

## 不使用 `any` 的好处

+ 良好的代码提示
+ 强大的静态类型检查
+ 可读性和可维护性


**所以，我们要对 AnyScript 说不！**

## TS 容易出现 `any` 的场景梳理

### 给 window 全局对象增加属性

常常能见到这样的写法

```typescript
(<any>window).obj = {}
// 或
(window as any).obj = {}
```

这样做，在使用时和赋值时都需要断言一次，非常麻烦，并且使用时也不能得到代码提示

正确的做法应该是

1. 在项目全局的 `xxx.d.ts` 文件中配置如下代码

```typescript
interface Window {
    obj: {}
}
```

2. 在需要给 window 赋值的文件目录下级新建一个 `@types` 文件夹，并在其中新建 `index.d.ts` 文件，添加如下代码

```typescript
interface Window {
    obj: {}
}
```
方法2也会在全局的 window 上增加 obj 这一声明，所以更推荐用方法1，方法1也能一眼看出项目中 window 中添加了什么属性