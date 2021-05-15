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

<!-- more -->

`keyof` 理解起来较为简单，索引类型查询操作符，就是将一个 索引类型 的 key 提取为联合类型，如

```ts
interface Dogs {
    dogName: string
    dogAge: number
    dogKind: string
}
type DogsKey = keyof Dogs // 等同于 type DogsKey = "dogName" | "dogAge" | "dogKind"
```

`in` 关键字是理解这段源码的关键，TS 的官方文档中，给出了[定义](typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)：`key remapping in mapped types`，也就是映射类型

它的语法往往是如下形式：

```ts
// OldType 为一个联合类型
type NewType = { [K in OldType]: NewResultType }
```

![](key-mapping-type-example.jpg)

它大致包含 5 个部分

1.红色区域：用于承载它的类型别名
2.白色区域：变量 `K` (或者其他别名)，它会被依次绑定到联合类型的每个属性
3.蓝色区域：`in` 关键字
4.橙色区域：由 number、symbol 或 string 的字面量组成的 `联合类型`，它包含了要迭代的属性名的集合，也可能直接是 number、symbol 或 string 三种类型，当然这种写法与 `{ [key: string]: ResultType }` 的写法相同
5.粉色区域：属性的结果类型

> TS 4.1 以上可以在橙色区域后使用 as 操作符重新映射映射类型中的键，它的作用目标是白色区域的键

假如在上述代码中，OldType 为 `type OldType = "key1" | "key2"`，那么 NewType 等同于

```ts
type NewType = {
    key1: NewResultType
    key2: NewResultType
}
```

你可以在 TS 官网中看到类似的例子。

在索引类型中，这样的写法([属性修饰符](https://www.typescriptlang.org/docs/handbook/2/objects.html#property-modifiers)：`?`)是不行的

```ts
type MapedType = {
    [key: string]?: string // 错误的写法
}
```

但在映射类型中，`?` 的写法是可以的

```ts
type MapedType = {
    [key in OldType]?: NewResultType // 正确的写法
}
```

上面的代码会得到一个这样的类型

```ts
type NewType = {
    key1?: NewResultType | undefined
    key2?: NewResultType | undefined
}
```

再来看属性的结果类型，源码中对结果的处理是这样的：`T[P]`，也就是[索引访问](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

索引访问能通过索引访问到其对应的具体类型，举例：

```ts
interface Dogs {
    dogName: string
    dogAge: number
    dogKind: string
}

type DogName = Dogs["dogName"] // 得到 string 类型
```

如果字符串 `"dogName"` 代表一个字面量类型，那么下面的这种写法就与 `T[P]` 是相似的

```ts
type DogNameKey = "dogName"
type DogName = Dogs[DogNameKey]
```

对于源码的 `[P in keyof T]` 部分中的 `P`，在 `in` 操作符的作用下会是联合类型中的某一个具体的字面量类型

而 `T` 是原始的（被传入的）索引类型，`T[P]` 也就访问到了 `P` 索引对应的具体的类型了

+ 使用场景

对象的扩展运算符

