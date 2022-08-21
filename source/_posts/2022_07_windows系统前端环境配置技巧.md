---
title: windows系统前端环境配置技巧
date: 2022-07-10 00:27:26
tags:
  - windows
category:
  - 技术
  - 分享
---

## 安装node

普通方式安装 node 会比较麻烦

windows 上面我们可以用 `nvm-windows` 来装 node，这样可以在多个 node 版本中切换，也不会有配置全局包环境变量的烦恼

首先下载安装 `nvm-windows` （如果原来安装了 node ，需要卸载干净）

见文档：[https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)

下载地址：[https://github.com/coreybutler/nvm/releases](https://github.com/coreybutler/nvm/releases)

```shell
nvm install [node_version] # 安装对应版本的 node （12.22.1 / 14.17.1）

nvm use [node_version] # 切换到该版本的 node

nvm current # 当前的node版本，如果提示该版本未安装，则不存在该版本的node
nvm list # 当前所有已下载的 node 版本

node -v # 查看当前 node 版本
npm -v # 查看当前 npm 版本
```
<!-- more -->

## vscode 终端

vscode 打开的终端权限较低，需要在桌面图标点击属性 -> 兼容性 -> 以管理员身份运行此程序 -> 应用

## 执行第三方命令

通过 npm 安装的全局包，默认不能在 vscode 的终端中运行，需要配置 power-shell 策略

```shell
PS C:\Windows\system32> set-ExecutionPolicy RemoteSigned

执行策略更改
执行策略可帮助你防止执行不信任的脚本。更改执行策略可能会产生安全风险，如 https:/go.microsoft.com/fwlink/?LinkID=135170
中的 about_Execution_Policies 帮助主题所述。是否要更改执行策略?
[Y] 是(Y)  [A] 全是(A)  [N] 否(N)  [L] 全否(L)  [S] 暂停(S)  [?] 帮助 (默认值为“N”): Y
```

## git 

git push 每次都要输入账号密码的解决方案：

```shell
git config --global credential.helper store
```

查看 git 所有设置

```shell
git config --list
```

git 设置 user.name 和 user.email

```shell
# 当前本地仓库生效
git config user.name "newName"
git config user.email "newEmail"
# 全局生效
git config --global user.name "your user name"
git config --global user.email "your user email"
# 修改
git config --global --replace-all user.name "your user name"
git config --global --replace-all user.email "your user email"
```