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
  [P in keyof T]?: T[P]
}
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

2.白色区域：类型别名 `K` (或者其他别名)，它会被依次绑定到联合类型的每个属性

3.蓝色区域：`in` 关键字

4.橙色区域：由 number、symbol 或 string 的字面量组成的 `联合类型`，它包含了要迭代的属性名的集合，也可能直接是 number、symbol 或 string 三种类型，当然这种写法与 `{ [key: string]: ResultType }` 的写法相同

5.粉色区域：属性的结果类型

> TS 4.1 以上可以在橙色区域后使用 as 操作符重新映射映射类型中的键，它的作用目标是白色区域的键；除了这 5 个部分，下文中还会提到属性修饰符 readonly 和 ?

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
type IndexType = {
    [key: string]?: string // 错误的写法
}
```

但在映射类型中，`?` 的写法是可以的

```ts
type MappingType = {
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

如果字符串 `"dogName"` 代表一个[字面量类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)，那么下面的这种写法就与 `T[P]` 是相似的

```ts
type DogNameKey = "dogName"
type DogName = Dogs[DogNameKey]
```

对于源码的 `[P in keyof T]` 部分中的 `P`，在 `in` 操作符的作用下会是联合类型中的某一个具体的字面量类型

而 `T` 是原始的（被传入的）索引类型，`T[P]` 也就访问到了 `P` 索引对应的具体的类型了

- 使用场景举例

  1. 对象的扩展运算符，比如我们实现基于 `useReducer` 实现一个简单的 "`setState`"

```ts
type State = {
  loading: boolean
  list: Array<any>
  page: number
}
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
}
function testFunction(params: Partial<Params>) {
  const requiredParams: Params = {
    param1: params.param1 ?? "",
    param2: params.param2 ?? 0,
    param3: params.param3 ?? [],
  }
  return requiredParams
}
```

### Required

_让所有属性都变成必选的_

- 源码

```ts
/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

- 源码解析

TS 在 2.8 版本改进了对[映射类型修饰符的控制](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers)，[映射修饰符-文档](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers)

在这个版本以后，可以通过在映射类型的属性修饰符（`readonly` 或 `?`）前面增加 `-` 或 `+` 前缀，表示应删除或添加该修饰符，也就是上一章节中的 `Partial` 也的实现也可以长这样

```ts
type Partial<T> = {
  [P in keyof T]+?: T[P]
}
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

- 使用场景举例

与 `Partial` 相反的场景

### Readonly

_将所有属性变为只读_

- 源码

```ts
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

- 源码解析

与 `Partial` 和 `Required` 的实现基本相同，不同的是它的属性修饰符为 [readonly](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties)，无修饰符前缀

`readonly` 修饰符会让被修饰的属性变为只读的（不能重写 re-written），但不能作用于该属性的子属性

- 使用场景举例

  1. 参考 Object.freeze 的声明
  2. 某些项目中定义的常量，防止在后续维护中，不小心在其他位置做了修改，可以使用 `Readonly`

### Pick

_从 T 类型选择一组属性构造新的类型_

- 源码

```ts
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
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

- 使用场景举例

  1. 某个位置需要全部的属性，其他位置仅需要部分属性的情况，如上文的 `Dogs` 例子
  2. 参考 [lodash](https://lodash.com.cn/docs/chunk).pick 的声明和实现
  3. 二次封装第三方组件，仅向外暴露部分参数的情况

### Record

- 源码

_基于一个联合类型构造一个新类型，其属性键为 K，属性值为 T_

```ts
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T
}
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

- 使用场景举例

  1. 通过 Record 构造索引类型 `Record<string, string>` 得到 `{ [key: string]: string }`
  2. 在策略模式中使用

```ts
type DogsRecord = Record<
  "dogKind1" | "dogKind2",
  (currentAge: number) => number
>
function getRestAgeByCurrentAgeAndKinds(
  kind: "dogKind1" | "dogKind2",
  currentAge: number
) {
  // 计算不同类型的狗的可能的剩余年龄
  const dogsRestAge: DogsRecord = {
    dogKind1: function (currentAge: number) {
      return 20 - currentAge
    },
    dogKind2: function (currentAge: number) {
      return 15 - currentAge
    },
  }
  return dogsRestAge[kind](currentAge)
}
getRestAgeByCurrentAgeAndKinds("dogKind1", 1)
```

### Exclude

_从 T 的联合类型成员中排除可分配给类型 U 的所有联合成员来构造类型_

- 源码

```ts
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T
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

条件类型的 extends 与在 泛型中的 extends 含义不同，后者代表的是约束，而前者是判断（可分配），判断 extends 左侧类型是否可分配给右侧类型（判断方法大概就是右侧要的左侧有就可以，没有就不行，满足结构性兼容即可），如果可以则是冒号左边的类型，否则为右边的类型（与 js 的 `true ? 1 : 2` 用法类似）

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

- 使用场景举例

  1. 与映射类型配合使用，参考 `Omit` 的实现

### Extract

_从 T 的联合类型成员中提取可分配给类型 U 的所有联合成员来构造类型_

- 源码

```ts
/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never
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

- 使用场景举例

  1. 与映射类型配合使用，参考 `Omit` 的实现

```ts
// 提取 T 类型的部分（或全部）键构造一个新类型
type Include<T extends object, U extends keyof any> = {
  [Key in Extract<keyof T, U>]: T[Key]
}
// 或
type Include<T, K extends keyof any> = Pick<T, Extract<keyof T, K>>
```

### Omit

_删除 T 类型中与 K 的所有联合类型成员有交集的键构造一个新类型_

- 源码

```ts
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
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

- 使用场景举例

  1. 对 HTML 元素进行组件封装时，用它替换默认的属性类型

```ts
import _ from "lodash"
import React from "react"

type InputSize = "large" | "middle" | "small"
type InputName = "first-name-input" | "last-name-input" | "address-input"
type CoverAttr = "size" | "name"
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, CoverAttr> {
  size?: InputSize
  name?: InputName
}

const Input: React.FC<InputProps> = (props) => {
  const classNames = `${props.className} ${props.size}`
  const omitProps = _.omit(props, ["size", "name"])

  return <input {...omitProps} className={classNames} />
}

Input.defaultProps = {
  size: "middle",
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
const wash = (dog: Dogs) => {
  /** 洗狗 */
}
// 登记的狗
const queue = new Set<string>([])

function dogsCleanRegister(dog: Dogs) {
  queue.add(dog.dogName)

  return function washTicket(dogNeedCheckInfo: Omit<Dogs, "dogName">) {
    if (
      dogNeedCheckInfo.dogAge === dog.dogAge &&
      dogNeedCheckInfo.dogKind === dog.dogKind
    ) {
      wash(dog)
      queue.delete(dog.dogName)
    } else {
      throw new Error("凭证和狗狗不对应")
    }
  }
}
// 我用自己的狗登记
const myDog = {
  dogName: "小明",
  dogAge: 5,
  dogKind: "柯基",
}

const goToWash = dogsCleanRegister(myDog)

// 我拿别人的狗去洗
const myBrothersDog = {
  dogName: "大明",
  dogAge: 6,
  dogKind: "哈士奇",
}

// 校验失败
goToWash(myBrothersDog) // '凭证和狗狗不对应'
```

### NonNullable

_新类型不可为空_

- 源码

```ts
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T
```

- 源码解析

`NonNullable` 中也用到了分布条件类型，如果泛型类型 `T` 为联合类型，则其每个联合类型成员中可被分配给 `null | undefined` 的类型也就是（`never、null 和undefined`）会被剔除

如下所示：

```ts
// 狗狗名字的实际情况，流浪狗可能没人起名字即为 null，刚出生的狗可能还没来的及起名字即为 undefined
type DogsName = 'husky' | 'corgi' | null | undefined

// 到商店洗狗时，不允许没有名字的狗
type NonNullableDogsName = NonNullable<DogsName> // 得到 type NonNullableDogsName = "husky" | "corgi"
```

另外，当传入的参数不为联合类型时，除 `null` 和 `undefined`，都会得到传入类型本身

```ts
// any
type NonNullableAny = NonNullable<any> // any，any 的条件类型比较特殊，会得到两个分支类型的联合类型
// unknown
type NonNullableUnknown = NonNullable<unknown> // unknown
// never
type NonNullableNever = NonNullable<never> // never
// null
type NonNullableNull = NonNullable<null> // never
```

- 使用场景举例

  1. 过滤掉 null 类型和 undefined 类型

```ts
// strictNullChecks 模式
// 函数类型的定义见 Parameters 章节
// 洗动物的方法，记载了需要提供的信息，虽然有方法，但可能没有工作人员，这时候是未定义
interface WashFunctions {
  washDogs?: (params: { dogName: string; dogAge: number }) => void
  washCats?: (params: { catName: string; catAge: number }) => void
}
// 假设要从洗动物的方法中自动生成表单信息给顾客填写
// 需求，提取出参数类型
// Parameters 用于提取函数类型的参数列表类型，详见下一章节
// Parameters 仅能传入函数类型
type ParamsByCallbackMap = {
  [Key in keyof WashFunctions]-?:
      Parameters<NonNullable<WashFunctions[Key]>>[0]
}
// 得到
/**
  *type ParamsByCallbackMap = {
  *   washDogs: {
  *       dogName: string;
  *       dogAge: number;
  *   };
  *   washCats: {
  *       catName: string;
  *       catAge: number;
  *   };
  *}
  */
```

### Parameters

_基于函数类型 T 的参数类型构造一个元组类型_

- 源码

```ts
/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

- 源码解析

了解 `Parameters` 的原理之前，首先得知道，函数的类型如何进行定义

1. 最常见且简单的方式，使用类型别名（[函数类型表达式 function-type-expressions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions)）

```ts
type Func1 = (...args: string[]) => string
type Func2 = (arg1: string, arg2: number) => string
type Func3 = (arg1: string, arg2: number, ...args: Array<number>) => string
const arrowFunc: Func3 = (
  arg1: string, 
  arg2: number, 
  ...args: Array<number>
) => arg1 + [arg2, ...args].reduce((preTotal, current) => preTotal + current, 0)
```

2. 使用接口进行定义（下面代码中的 `Func3` 语法为 [调用签名 call-signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures)）

```ts
// Func['func1'] 和 Func['func2'] 为函数类型
interface Func {
  func1(arg: number): number
  func2(arg: string): number
}
const func: Func = {
  func1(arg: number) {
    return arg
  },
  func2: (arg: string) => Number(arg)
}
// Func3 即为函数类型
interface Func3 {
  (arg: number): string
}
const func3: Func3 = (arg: number) => {
  return arg.toString()
}
```

3. 使用接口进行重载（实际上是接口的合并）

```ts
interface Func {
  (arg: number): string
  (arg: string): string
}
const func: Func = (arg: number | string) => {
  return arg.toString()
}
```
4. 使用 declare 进行类型定义（[contextual-typing](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#contextual-typing)）

```ts
declare function Func(...args: string[]): string
const func: typeof Func = (...args: string[]) => {
  return args.join('')
}
```

5. 使用函数声明进行重载（[函数重载 function-overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)）

```ts
function func4(...args: string[]): string
function func4(...args: number[]): string
function func4(...args: (string | number)[]) {
  return args.join('')
}
```

> 摘自文档：从具有多个调用签名的类型（例如重载函数的类型）进行推断时，将从最后一个签名进行推断。无法基于参数类型列表执行重载解析

6. 其他方式（见下文，或参考[官方文档](https://www.typescriptlang.org/docs/handbook/2/functions.html)）

`Parameters` 泛型 `T` 的约束为 `(...args: any) => any`（注：`Function` 类型没有内容和签名，不能分配给它），上述5种定义函数类型的方式，都可以分配到该类型

因此都可以作为参数传给 `Parameters`，`Parameters` 的实现也使用了条件类型，如果泛型 `T` 可以分配给 `(...args: infer P) => any`，则为 `P` 类型

`infer` 关键字见[在条件类型中推断](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)，`infer` 的作用是让 TS 自己推断，并将推断的结果存储到一个类型变量中，`infer` 只能用于 `extends` 语句中

几个用它进行推导的例子

```ts
type Example1 = Array<number> extends Array<infer T> ? T : never // number
type Example2 = { a: string } extends { a: infer T } ? T : never // string
```

看到上面两个例子，可能 Parameters 源码你已经能看懂了

但是问题来了，TS 的子类型是基于 `结构子类型` 的，只要结构可以兼容，就是子类型，一般来讲，在条件类型中，`extends` 左侧类型可分配给右侧类型，那么左侧类型就是右侧类型的子类型

如果左侧类型是一个对象类型，在下面的例子中，只有 Example3 中，左侧是不可分配给右侧的，因为它缺少了 b 属性

对象类型中，子类型中必须包含源类型所有的属性和方法（可多但是不能少）

```ts
type Example1 = { a: string } extends { a: string } ? true : false // true
type Example2 = { a: string; b: number } extends { a: string } ? true : false // true
type Example3 = { a: string; } extends { a: string; b: number } ? true : false // false
```

如果左侧类型是一个联合类型，在下面的例子中，只有 Example2 中，左侧是不可分配给右侧的，因为 `'b'` 不能分配给 `'a'`

联合类型中，子类型必须仅有源类型中的部分或全部成员（可以少但是不能多）

```ts
type Example1 = 'a' extends 'a' ? true : false // true
type Example2 = 'a' | 'b' extends 'a' ? true : false // false
type Example3 = 'a' extends 'a' | 'b' ? true : false // true
```
那么，某个函数类型的子类型是什么样的呢？

了解这一点之前，你需要知道[协变](https://baike.baidu.com/item/%E5%8D%8F%E5%8F%98)和逆变这样的概念在 TS 中也存在

对于函数类型来说，函数参数的类型兼容是反向的，称之为 逆变 ，返回值的类型兼容是正向的，称之为 协变

> 参考 [你可能不知道的 TypeScript 高级技巧](https://juejin.cn/post/6844904037922373639)

**函数参数：我可以仅使用你传给我的一部分（或全部）属性或方法**

还是洗狗的例子，带狗来店里进行清洗的客户需要向我们店的员工说明狗的信息，但是不管你说多少信息，店员只使用年龄和品种

```ts
// 店员获取狗的信息
function staffGetDogInfo(params: { dogAge: number; dosKind: string }): void {
    document.write(params.dogAge + params.dosKind) // 登记信息，写在纸上
}
// 客户说狗的信息，要有个人做“听他说”这件事，也就是参数 receiveAction 方法
function customerSayDogInfo(receiveAction: (params: { dogAge: number; dosKind: string; dogName: string }) => any) {
    const dogInfo = {
        dogAge: 1,
        dosKind: "husky",
        dogName: "狗蛋",
    }
    receiveAction(dogInfo)
}
// ts 类型校验通过，staffGetDogInfo 可以分配给 customerSayDogInfo 的参数类型 receiveAction
customerSayDogInfo(staffGetDogInfo)
```

示例中仅展示单一参数的情况，对于参数个数，这个规则也是类似的，你可以多给我几个参数，但我可以不用

总结起来就是，两个函数类型做比较，函数参数少（或参数数量相等）的且对应位置参数需要的属性/方法少的（不超过另一个类型对应位置参数需要的属性/方法数量，但注意联合类型和对象类型是反着的，联合类型的成员要比对应位置参数类型的联合类型成员多），在不考虑函数返回值的情况下，是函数子类型

**函数返回值：我要的你必须给我，可以多但是一个都不能少**

继续使用上面的例子，我们把场景改造下，但还是让参数的类型仍然满足函数子类型的规则，除了店员需要的信息，客户还会说一些不需要的，店员记录完以后，会给一个回执

客户要知道的就是，什么时候开始洗，什么时候洗完，谁来给我的狗洗

```ts
// 店员获取狗的信息，登记后给回执
function staffGetDogInfo(params: { dogAge: number; dosKind: string }): {
  washPersonName: string,
  washStartTime: string,
  washEndTime: string,
  payedMoney: number,
  isVip: boolean
} {
    document.write(params.dogAge + params.dosKind) // 登记信息，写在纸上
    // 返回回执
    return {
      washPersonName: 'staff Alice',
      washStartTime: '2021/5/25 20:00:00',
      washEndTime: '2021/5/25 20:30:00',
      payedMoney: 100,
      isVip: true
    }
}
// 客户说狗的信息，要有个人做“听他说”这件事，也就是参数 receiveAction 方法
// 得到回执后，看回执上面的结束时间，过多久再回来
function customerSayDogInfo(
  receiveAction: (
    params: { dogAge: number; dosKind: string; dogName: string }
  ) => { washEndTime: string }
) {
    const dogInfo = {
        dogAge: 1,
        dosKind: "husky",
        dogName: "狗蛋",
    }
    const receipt = receiveAction(dogInfo)
    setTimeout(() => {
      // 回来取狗
    }, Number(new Date(receipt.washEndTime)) - Number(new Date()))
}
// ts 类型校验通过，staffGetDogInfo 可以分配给 customerSayDogInfo 的参数类型 receiveAction
customerSayDogInfo(staffGetDogInfo)
```

结合上面两个例子，容易得到：**两个函数类型做比较，函数参数少（或参数数量相等）的且对应位置参数需要的属性/方法少的（不超过另一个类型对应位置参数需要的属性/方法数量，但注意联合类型和对象类型是反着的，联合类型的成员要比对应位置参数类型的联合类型成员多），且函数返回值类型中含有的属性或方法要多于另一个函数类型的时候（注意联合类型是成员更少的），该类型是函数子类型**

`extends` 左右两侧为函数类型时，会得到哪个分支的类型，就显而易见了

- 使用场景

  1. 高阶函数，不使用泛型的情况下，某些场景可以用 Parameters 提取出传入的函数的参数类型

### ConstructorParameters

_从构造函数类型 T 的参数类型构造元组或数组类型（如果 T 不是函数，则为 never）_

- 源码

```ts
/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
```

- 源码解析

`ConstructorParameters` 的源码与 `Parameters` 的源码极其相似，只是在函数类型前多了一个 `new`

在函数类型前面写一个 `new` 关键字的语法在 TS 中被称为[构造签名 Construct Signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#construct-signatures)

构造签名一般用在 JS 运行环境中自带的构造函数的声明（现有 API），或在 `.d.ts` 声明文件中使用

如果你写了一个构造函数，请不要使用构造签名进行类型定义，因为你很难定义出来

其他情况，你可以将它作为一个约束类型来使用（比如定义函数参数的类型必须为一个构造函数），而不是直接用于函数或类的类型声明

`ConstructorParameters` 的使用也与 `Parameters` 相似

```ts
class Dog {
  private dogAge: number
  private isMale: boolean
  private dogKind: string
  constructor(isMale: boolean, dogKind: string) {
    this.dogAge = 0
    this.isMale = isMale
    this.dogKind = dogKind
  }
}
type DogGaveBirthNeedInfo = ConstructorParameters<typeof Dog> // 得到 [boolean, string] 类型
```

### ReturnType

_基于函数类型 T 的返回值类型构造一个新类型_

- 源码

```ts
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

- 源码解析

与 `Parameters` 源码不同的是，其 `infer` 的 `R` 在函数类型的返回值位置

```ts
function washDog() {
  return {
    dogName: 'linlin',
    dogAge: 20,
    dogKind: 'husky'
  }
}
type WashTicket = ReturnType<typeof washDog> 
/*
 * 会的到这样的类型，也就是函数 washDog 返回值的类型
 *type WashTicket = {
 *  dogName: string
 *  dogAge: number
 *  dogKind: string
 *}
*/ 
```

- 使用场景举例

  1. 高阶函数，不使用泛型的情况下，某些场景可以用 ReturnType 提取出传入的函数的返回值类型


### InstanceType

_基于一个构造函数类型 T 的返回值构造一个新类型_

- 源码

```ts
/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
```

- 源码解析

`InstanceType` 与 `ReturnType` 的区别是它多了构造签名，与 `ConstructorParameters` 的区别是它推断的不是参数类型，而是返回值类型

```ts
class Dog {
  private dogAge: number
  private isMale: boolean
  private dogKind: string
  constructor(isMale: boolean, dogKind: string) {
    this.dogAge = 0
    this.isMale = isMale
    this.dogKind = dogKind
  }
}
type DogGaveBirthNeedInfo = InstanceType<typeof Dog> // 得到 Dog 类型
```

也许你会疑问，为什么还得到 Dog 本身了？

请看下图

![](class-type-example.jpg)

`class` 定义的类本身也是一种类型，它的实例的类型可以用它本身来进行描述

如 `Dog['dogAge']` 能得到实例的私有属性 `dogAge` 的类型 `number`

### Uppercase

_将字符串的字面量类型转为大写_

`Uppercase` 的实现为编译器内置，[TS 4.1 新增](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types)，可以模板字符串类型配合使用，文档见：[内置字符串操作类型 Intrinsic String Manipulation Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#intrinsic-string-manipulation-types)，参考 [commit](https://github.com/microsoft/TypeScript/commit/fbce4f6c989e4296ab43873ffc78e9c17809cac9)，下同

- 源码

```ts
/**
 * Convert string literal type to uppercase
 */
type Uppercase<S extends string> = intrinsic;
```

- 用法

```ts
type DogName = "LinLin"
type UppercaseDogName = Uppercase<DogName> // 得到 "LINLIN"
```

如果传入的类型为联合类型，则会得到一个新类型，其每个成员都会转为大写（二十六个字母）

如果传入的类型为 `any` 或者是 `string`，则会得到它们本身

### Lowercase

_将字符串的字面量类型转换为小写_

`Lowercase` 的实现为编译器内置

- 源码

```ts
/**
 * Convert string literal type to lowercase
 */
type Lowercase<S extends string> = intrinsic;
```

- 用法

```ts
type DogName = "LinLin"
type LowercaseDogName = Lowercase<DogName> // 得到 "linlin"
```

### Capitalize

_将字符串的字面量类型首字母转换为大写_

`Capitalize` 的实现为编译器内置

- 源码

```ts
/**
 * Convert first character of string literal type to uppercase
 */
type Capitalize<S extends string> = intrinsic;
```

- 用法

```ts
type DogName = "linlin"
type CapitalizeDogName = Capitalize<DogName> // 得到 "LinLin"
```

### Uncapitalize

_将字符串的字面量类型首字母转换为小写_

`Uncapitalize` 的实现为编译器内置

- 源码

```ts
/**
 * Convert first character of string literal type to lowercase
 */
type Uncapitalize<S extends string> = intrinsic;
```

- 用法

```ts
type DogName = "LinLin"
type UncapitalizeDogName = Uncapitalize<DogName> // 得到 "linlin"
```

- 使用场景

  1. 上述四个字符串操作类型，可与模板字符串类型配合使用，实现高级的类型定义


### ThisType

_增强对象字面量类型中 this 的类型_

- 源码

```ts
/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }
```

除了在对象字面量类型中使用（需要启用 `--noImplicitThis`），其余位置使用都是一个空接口，具体可参考[文档 ThisType](https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype)


## 非内置可自行实现的 Utility Types

**下面的哪些工具类型你用过？你自己还写过哪些工具类型呢？评论区分享一下吧**


### DeepPartial

```ts
type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends object
      ? DeepPartial<T[Key]>
      : T[Key]
}
```

### ReadonlyPartial

```ts
type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P]
}
```

### ReadWrite

_或叫 Mutable，移除只读修饰符，可读可写_

```ts
type ReadWrite<T> = {
  -readonly [P in keyof T]: T[P]
}
```

### GetPromiseType

_提取 Promise 的泛型参数_

```ts
type GetPromiseType<P extends Promise<any>> = P extends Promise<infer Params>
  ? Params
  : never
```

可以与 `ReturnType` 结合使用，提取异步函数的返回值

### ChangeRecordType

_将对象中所有属性都设置为 T，第一个参数是 keyof object，如果没有传第二个参数，则将所有属性值转为 undefined_

```ts
type ChangeRecordType<K extends string | number | symbol, T = undefined> = {
  [P in K]?: T
}
```

### Values

_构造传入类型每个值的联合类型，参考 Object.values_

```ts
type Values<T> = T[keyof T]
```

### Include

_提取 T 类型的部分（或全部）键构造一个新类型，与 Omit 作用相反_

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

_生成可以为空的联合类型_

```ts
type Nullable<T extends keyof any> = T | null | undefined
```

### Proxify

```ts
type Proxify<T> = {
 [P in keyof T]: { 
   get(): T[P]
   set(v: T[P]): void
 }
}
```

### SumAggregate

_并集_

```ts
type SumAggregate<T, U> = T | U
```

### Diff

_差异_

```ts
type Diff<T, C> = Exclude<T, C> | Exclude<C, T>
```

### Flatten（TupleToUnion）

_元组转联合类型_

```ts
type Flatten<T> = T extends Array<infer U> ? U : never
// 写法2
type Flatten<T extends any[]> = T[number]
```

### GetterSetterPreFix

_为现有属性添加上 set 和 get 前缀_

```ts
type GetterSetterPreFix<T> = {
    [Key in keyof T as Key extends string ? `get${Uppercase<Key>}` : never]: {
        (): T[Key];
    }
} & {
    [Key in keyof T as Key extends string ? `set${Uppercase<Key>}` : never]: {
        (val: T[Key]): void;
    }
} & T
```

### ExcludeValues

_剔除掉类型 T 中，满足值可分配给 V 的属性名，并构造一个新类型_

```ts
type ExcludeValues<T, V> = {
    [Key in keyof T as T[Key] extends V ? never : Key]: T[Key]
}
```

### PointSplit

_构造一个描述对象类型可访问的属性链的字符串联合类型_

```ts
type PointSplit<
    T,
    A = {
        [Key in keyof T]: T[Key] extends string ? never : T[Key]
    },
    B = {
        [Key in keyof A]: A[Key] extends never
            ? never
            : A[Key] extends object
            ? `${Extract<Key, string>}.${Extract<keyof A[Key], string>}` | (PointSplit<A[Key]> extends infer U ? `${Extract<Key, string>}.${Extract<U, string>}` : never)
            : never
    }
> = T extends object ? Exclude<keyof A | Exclude<Values<B>, never>, never> : never
```

如图所示

![](point-split-example.jpg)