---
title: 玩转ReactHook的技巧，送给还不熟悉它的你
date: 2023-01-19 16:02:21
tags:
---

## hook 之闭包双刃剑

1. 闭包在hook中的应用

让我们来写一个React组件来演示使用Hooks是如何产生闭包的

```js
import React, { useState, useCallback } from 'react'
const Component = () => {
    const [data1, setData1] = useState(1)
    const [data2, setData2] = useState(1)

    const handleData1ButtonClick = useCallback(() => {

    }, [])

    return <div>
        <button>{data1}</button>
        <button>{data2}</button>
    </div>
}
```

## hook 的整洁之道

## hook 之组件 hook 化