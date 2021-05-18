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

_将传入的 T 类型所有属性置为可选_

- 源码

```ts
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

- 源码解析

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

`in` 关键字是理解这段源码的关键，TS 的官方文档中，给出了[定义](typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)：`key remapping in mapped types`，也就是[映射类型](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

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

> TS 4.1 以上可以在橙色区域后使用 as 操作符重新映射映射类型中的键，它的作用目标是白色区域的键；除了这 5 个部分，下文中还会提到属性修饰符 readonly 和 ?

假如在上述代码中，OldType 为 `type OldType = "key1" | "key2"`，那么 NewType 等同于

```ts
type NewType = {
  key1: NewResultType
  key2: NewResultType
};
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
};
```

上面的代码会得到一个这样的类型

```ts
type NewType = {
  key1?: NewResultType | undefined
  key2?: NewResultType | undefined
};
```

再来看属性的结果类型，源码中对结果的处理是这样的：`T[P]`，也就是[索引访问](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

索引访问能通过索引访问到其对应的具体类型，举例：

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}

type DogName = Dogs["dogName"]; // 得到 string 类型
```

如果字符串 `"dogName"` 代表一个[字面量类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)，那么下面的这种写法就与 `T[P]` 是相似的

```ts
type DogNameKey = "dogName"
type DogName = Dogs[DogNameKey]
```

对于源码的 `[P in keyof T]` 部分中的 `P`，在 `in` 操作符的作用下会是联合类型中的某一个具体的字面量类型

而 `T` 是原始的（被传入的）索引类型，`T[P]` 也就访问到了 `P` 索引对应的具体的类型了

- 使用场景

  1. 对象的扩展运算符，比如我们实现基于 `useReducer` 实现一个简单的 "`setState`"

```ts
type State = {
loading: boolean
list: Array<any>
page: number
};
const [state, setState] = useReducer(
(state: State, nextState: Partial<State>) => {
  return { ...state, ...nextState }
},
{
  loading: false,
  list: [],
  page: 0,
}
)
// 使用
setState({ page: 1 })
```

  上面的代码中 nextState 被传入后，会与原 state 做合并操作，nextState 并不需要含有 State 类型的所有键，故使用 Partial 进行类型的定义

  2. 都是非必传参但使用参数时如果没有传则会初始化参数

```ts
interface Params {
 param1: string
 param2: number
 param3: Array<string>
};
function testFunction(params: Partial<Params>) {
 const requiredParams: Params = {
  param1: params.param1 ?? '',
  param2: params.param2 ?? 0,
  param3: params.param3 ?? []
 }
 return requiredParams
}
  ```

### Required

*让所有属性都变成必选的*

- 源码

```ts
/**
 * Make all properties in T required
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

- 源码解析

TS 在 2.8 版本改进了对[映射类型修饰符的控制](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers)，[映射修饰符-文档](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers)

在这个版本以后，可以通过在映射类型的属性修饰符（`readonly` 或 `?`）前面增加 `-` 或 `+` 前缀，表示应删除或添加该修饰符，也就是上一章节中的 `Partial` 也的实现也可以长这样

```ts
type Partial<T> = {
  [P in keyof T]+?: T[P];
};
```

也就是说 `-?` 的写法会去除可选属性这一属性修饰符，达到让每个属性都变为必选的目的

同时依据文档描述，`--strictNullChecks` 模式下，如果属性是包含了 undefined 的联合类型，那么 `Required` 也会将 undefined 移除

```ts
interface TestNullCheck {
  // 如果没有 number 类型，仅有 undefined 类型，则会保留 undefined
  testParam?: number | undefined
}

type Test = Required<TestNullCheck> // 得到 { testParam: number }
```

- 使用场景

与 `Partial` 相反的场景

### Readonly

*将所有属性变为只读*

- 源码

```ts
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

- 源码解析

与 `Partial` 和 `Required` 的实现基本相同，不同的是它的属性修饰符为 [readonly](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties)，无修饰符前缀

`readonly` 修饰符会让被修饰的属性变为只读的（不能重写re-written），但不能作用于该属性的子属性

- 使用场景

  1. 参考 Object.freeze 的声明
  2. 某些项目中定义的常量，防止在后续维护中，不小心在其他位置做了修改，可以使用 `Readonly`

### Pick

*从 T 类型选择一组属性构造新的类型*

- 源码

```ts
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

- 源码解析

使用 `Pick` 的时候，需要传递两个泛型参数，第一个参数为一个[对象类型](https://www.typescriptlang.org/docs/handbook/2/objects.html)（或映射类型），第二个参数为第一个参数的键（属性）组成的联合类型（或单个字面量类型），`Pick` 构造的新类型中，属性为第二个参数中的联合类型的所有联合类型成员

示例：

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}
// 联合类型
type NameAndAge = Pick<Dogs, "dogName" | "dogAge"> // { dogName: string; dogAge: number }

// 单个字符串类型
type DogKind = Pick<Dogs, "dogKind"> // { dogKind: string; }
```

在 `Pick` 的实现中，引入了新的语法，泛型（自行查阅[文档](https://www.typescriptlang.org/docs/handbook/2/generics.html)）、[extends](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)

`extends` 在 TS 中，不同的位置使用有不同的含义，在这里是约束（Generic Constraints）的含义，extends 左侧类型一定要满足可分配给右侧类型

`keyof T` 的写法在前文中已经讲到（另外泛型参数中，靠后的参数的 extends 子句能使用靠前参数的类型别名），T 是一个对象类型，那么 `keyof T` 是一个由 string 或 number （没有 symbol）组成的联合类型，因此 `K` 是 `T` 的所有属性名构成的联合类型的子类型

`in` 映射类型可参考 `Partial` 章节，在 `Pick` 中，`K` 会被迭代，`P` 是在每次迭代中都是某个字面量类型，也是 `T` 的某一个属性名，通过索引访问 `T[P]` 能得到该属性名对应的具体类型，最后 `Pick` 得到一个新的对象类型

- 使用场景

  1. 某个位置需要全部的属性，其他位置仅需要部分属性的情况，如上文的 `Dogs` 例子
  2. 参考 [lodash](https://lodash.com.cn/docs/chunk).pick 的声明和实现
  3. 二次封装第三方组件，仅向外暴露部分参数的情况

### Record

- 源码

*基于一个联合类型构造一个新类型，其属性键为 K，属性值为 T*

```ts
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

- 源码解析

`Record` 源码的含义较为容易理解，即将 K 中的每个属性，都转为 T 类型

使用起来就是

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}

type KeyofDogs = keyof Dogs // "dogName" | "dogAge" | "dogKind"

type StringDogs = Record<KeyofDogs, string>
// StringDogs 与下面的类型相同
type StringDogs = {
  dogName: string
  dogAge: string
  dogKind: string
}
```

但你可能对于 `keyof any` 不太理解

```ts
type KeyofAny = keyof any
// 等同于
type KeyofAny = string | number | symbol
```

被上述代码中 `KeyofAny` 约束的类型可以是如下类型

```ts
type A = "a"
type B = "a" | "b"
type C = "a" | "b" | string
type D = "a" | 1
type E = "a" | symbol
type F = 1
type G = string
type H = number
type I = symbol
type J = symbol | 1
```

也就是 由 `symbol` 、`number` 或 `string` 排列组合形成的联合类型、或字面量类型、或字面量类型组成的联合类型

至于 `keyof unknown`、`keyof never`，它们得到的结果都是 `never`

- 使用场景

    1. 通过 Record 构造索引类型 `Record<string, string>` 得到 `{ [key: string]: string }`
    2. 在策略模式中使用

 ```ts
 type DogsRecord = Record<"dogKind1" | "dogKind2", (currentAge: number) => number>;
 function getRestAgeByCurrentAgeAndKinds(kind: "dogKind1" | "dogKind2", currentAge: number) {
     // 计算不同类型的狗的可能的剩余年龄
     const dogsRestAge: DogsRecord = {
         dogKind1: function(currentAge: number) {
             return 20 - currentAge
         },
         dogKind2: function(currentAge: number) {
             return 15 - currentAge
         }
     }
     return dogsRestAge[kind](currentAge)
 }
 getRestAgeByCurrentAgeAndKinds("dogKind1", 1)
 ```

### Exclude

*从 T 的联合类型成员中排除可分配给类型 U 的所有联合成员来构造类型*

- 源码

```ts
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;
```

- 源码解析

使用 Exclude 的例子

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}

type KeyofDogs = keyof Dogs // "dogName" | "dogAge" | "dogKind"

type KeysWithoutKind = Exclude<KeyofDogs, "dogKind"> // "dogName" | "dogAge"
```

在 `Exclude` 的源码中，引入了新的语法，[条件类型 Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

条件类型的 extends 与在 泛型中的 extends 含义不同，后者代表的是约束，而前者是判断（可分配），判断 extends 左侧类型是否可分配给右侧类型，如果可以则是冒号左边的类型，否则为右边的类型（与 js 的 `true ? 1 : 2` 用法类似）

在上面的例子中，你可能会想，`KeyofDogs` 并不能分配给 `"dogKind"` 类型，会得到 `T` 类型，也就是 `KeyofDogs` 类型本身，但实际的结果是 `"dogName" | "dogAge"`，从 `KeyofDogs` 中移除了 `"dogKind"` 类型

从已有的条件我们并不能看出 Exclude 的原理是什么，TS 对条件类型有一种特殊情况，也就是[分布条件类型 Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)，其定义是**当条件类型作用于泛型类型时，并且这个泛型类型是联合类型，那么它就是分布式条件类型**

泛型类型很好理解，即 `type Example<T> = T` 中的 `T` 就是一个泛型类型

源码中的 `T extends U ? never : T`， `T` 是一个泛型类型，同时这也是一个条件类型，满足分布条件类型的定义，会由联合类型 `T` 中的每个联合类型成员依次与 `extends` 右侧类型进行比对，上面代码中的 `KeyofDogs` 是一个联合类型，传入 `Exclude` 后，变为了一个泛型类型 `T`，`"dogName" | "dogAge" | "dogKind"` 会依次与 `"dogKind"` 进行比对，只有 `"dogKind"` 可以分配给 `"dogKind"`，但得到的类型为 `never`，其他两个无法分配给 `"dogKind"`，得到它们本身的字面量类型 `"dogName"` 和 `"dogAge"`，它们组成的联合类型 `"dogName" | "dogAge"` 就是最终的结果

**其他场景：**

如果 Exclude 第一个参数不是联合类型会怎么样？

```ts
type ExampleA = Exclude<1, 2> // 会走正常的条件类型，1 不能分配给 2，会得到第一个泛型参数的类型，也就是字面量类型 1

type ExampleB = Exclude<{ 2: string }, 2> // 原理同上方注释，也是传入的第一个泛型参数的类型 { 2: string }
```

- 使用场景

  1. 与映射类型配合使用，参考 `Omit` 的实现

### Extract

*从 T 的联合类型成员中提取可分配给类型 U 的所有联合成员来构造类型*

- 源码

```ts
/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;
```

- 源码解析

在 `Exclude` 章节我们讲到了分布条件类型，`Extract` 的作用和 `Exclude` 正好相反，在 `Exclude` 中，会依次将 `T` 中的联合类型成员与类型 `U` 对比，如果其可以分配给类型 `U`，则得到该类型

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}

type KeyofDogs = keyof Dogs // "dogName" | "dogAge" | "dogKind"

type KeysOnlyKind = Extract<KeyofDogs, "dogKind"> // "dogKind"
```

- 使用场景
  
  1. 与映射类型配合使用，参考 `Omit` 的实现

```ts
// 提取 T 类型的部分（或全部）键构造一个新类型
type Include<T extends object, U extends keyof any> = {
  [Key in Extract<keyof T, U>]: T[Key]
}
// 或
type Include<T, K extends keyof any> = Pick<T, Extract<keyof T, K>>;
```

### Omit

*删除 T 类型中与 K 的所有联合类型成员有交集的键构造一个新类型*

- 源码

```ts
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

`Omit` 源码借助了 `Pick` 和 `Exclude`，`Pick` 会构造一个基于第一个参数，且属性为第二个参数（联合类型）的联合类型成员的类型

第一个参数为 `T`，其第二个参数是 `Exclude<keyof T, K>`，`Exclude` 第一个参数为 `keyof T`，即 `T` 的所有键构成的联合类型

`K` 是外部传入 `Omit` 的泛型类型，也会作为第二个参数传给 `Exclude`，由 `Exclude` 得到一个 `keyof T` 剔除掉与 `K` 交集的部分形成的联合类型

这样 `Pick` 生成的新类型的键就会仅包含由 `Exclude` 得到的联合类型中的联合类型成员

最终 `Omit` 会**删除 `T` 类型中与 `K` 的所有联合类型成员有交集的键构造一个新类型**

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}

type DogsWithoutKind = Omit<Dogs, "dogKind"> // { dogName: string; dogAge: number; }
```

- 使用场景

  1. 对 HTML 元素进行组件封装时，用它替换默认的属性类型

```ts
import _ from "lodash"
import React from 'react'

type InputSize = "large" | "middle" | "small"
type InputName = "first-name-input" | "last-name-input" | "address-input"
type CoverAttr = "size" | "name"
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, CoverAttr> {
  size?: InputSize
  name?: InputName
}

const Input: React.FC<InputProps> = props => {
  const classNames = `${props.className} ${props.size}`
  const omitProps = _.omit(props, ["size", "name"])
  return <input {...omitProps} className={classNames} />
}

Input.defaultProps = {
  size: "middle"
}
```
  2. 对第三方 UI 组件二次封装时，替换其参数
  3. 其他（组件，函数，对象等）向使用者提供时，省略一些已处理的参数

```ts
interface Dogs {
  dogName: string
  dogAge: number
  dogKind: string
}
/* 
 * 狗狗清洗登记，登记狗狗名字（假设狗狗名字独一无二）后返回一张凭证
 * 凭借凭证和狗狗的种类、年龄（设年龄不变大）到清洗处清洗
 */
const wash = (dog: Dogs) => { /** 洗狗 */ }
// 登记的狗
const queue = new Set<string>([])

function dogsCleanRegister(dog: Dogs) {
  queue.add(dog.dogName)
  return function washTicket(dogNeedCheckInfo: Omit<Dogs, "dogName">) {
    if (dogNeedCheckInfo.dogAge === dog.dogAge && dogNeedCheckInfo.dogKind === dog.dogKind) {
      wash(dog)
      queue.delete(dog.dogName)
    } else {
      throw new Error('凭证和狗狗不对应')
    }
  }
}
// 我用自己的狗登记
const myDog = {
  dogName: "小明",
  dogAge: 5,
  dogKind: "柯基"
}
const goToWash = dogsCleanRegister(myDog)
// 我拿别人的狗去洗
const myBrothersDog = {
  dogName: "大明",
  dogAge: 6,
  dogKind: "哈士奇"
}
// 校验失败
goToWash(myBrothersDog) // '凭证和狗狗不对应'
```

### NonNullable

*新类型不可为空*

- 源码

```ts
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T;
```


## 非内置可自行实现的 Utility Types

**下面的哪些工具类型你用过？你自己还写过哪些工具类型呢？评论区分享一下吧**

### ReadonlyPartial

```ts
type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P]
}
```

### ReadWrite

```ts
type ReadWrite<T> = {
  -readonly [P in keyof T]: T[P] 
}
```

### GetPromiseType

*提取 Promise 的泛型参数*

```ts
type GetPromiseType<P extends Promise<any>> = P extends Promise<
  infer Params
>
  ? Params
  : never
```

可以与 `ReturnType` 结合使用，提取异步函数的返回值

### ChangeRecordType

*将对象中所有属性都设置为 T，第一个参数是 keyof object，如果没有传第二个参数，则将所有属性值转为 undefined*

```ts
type ChangeRecordType<K extends string | number | symbol, T = undefined> = {
    [P in K]?: T
}
```

### Values

*构造传入类型每个值的联合类型，参考 Object.values*

```ts
type Values<T> = T[keyof T]
```

### Include

*提取 T 类型的部分（或全部）键构造一个新类型，与 Omit 作用相反*

```ts
// 写法1
type Include<T extends object, U extends keyof any> = {
  [Key in Extract<keyof T, U>]: T[Key]
}
// 写法2 (映射类型重映射 4.1 新增语法) 
type Include<T extends object, U extends keyof any> = {
  [Key in keyof T as Key extends U ? Key : never]: T[Key]
}
// 写法3
type Include<T, K extends keyof any> = Pick<T, Extract<keyof T, K>>
```

### Nullable

*生成可以为空的联合类型*

```ts
type Nullable<T extends keyof any> = T | null | undefined
```