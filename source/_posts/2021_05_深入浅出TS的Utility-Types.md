---
title: 深入浅出TS的 Utility Types
date: 2021-05-15 09:30:34
category:
  - 技术
  - 分享
tags:
  - TypeScript
---

## 什么是 Utility Types

TS 内置的 [实用类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)，用于类型转换

把它理解透彻将会对你的 TS 水平有很大提升

本文将从实现、用法和场景三个方面对每个内置 Utility Type 进行说明

## 内置 Utility Types

### Partial

*将传入的 T 类型所有属性置为可选*

+ 源码

```ts
/**
 * Make all properties in T optional
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

+ 源码解析

Partial 仅接收一个泛型参数 T，

`keyof` 理解起来较为简单，就是将一个 `object type` 的 key 提取为联合类型，如

```ts
interface Dogs {
    dogName: string
    dogAge: number
    dogKind: string
}
type DogsKey = keyof Dogs // "dogName" | "dogAge" | "dogKind"
```

`in` 关键字是理解这段代码的关键，TS 的官方文档中，给出了[定义](typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)：`key remapping in mapped types`