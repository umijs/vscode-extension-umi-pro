<h1 align="center">Umi Pro</h1>
<p align="center">
    <a href="https://travis-ci.org/DiamondYuan/umi-pro" target="_blank">
      <img src="https://img.shields.io/travis/DiamondYuan/umi-pro/master.svg?style=flat-square" alt="Build Status">
    </a>
    <a href="https://codecov.io/gh/DiamondYuan/umi-pro" target="_blank">
      <img src="https://img.shields.io/codecov/c/github/DiamondYuan/umi-pro/master.svg?style=flat-square" alt="Codecov">
    </a>
    <a href="https://github.com/DiamondYuan/umi-pro/blob/master/LICENSE">
     <img src="https://img.shields.io/github/license/Diamondyuan/umi-pro.svg">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=DiamondYuan.umi-pro" target="_blank">
      <img src="https://img.shields.io/visual-studio-marketplace/v/DiamondYuan.umi-pro.svg">
    </a>
</p>

## 安装

直接在 vs-code 商店搜索 `umi` 或者直接访问 [网页版商店](https://marketplace.visualstudio.com/items?itemName=DiamondYuan.umi-pro)

![](https://user-images.githubusercontent.com/9692408/57303307-a351b580-710f-11e9-8789-e5091b3bacb8.png)

## 功能

- action type 自动补全
- 悬浮显示 action 源码
- 点击跳转到 action 源码所在位置

## 可配置项

| 配置项           | 可选值                        |
| ---------------- | ----------------------------- |
| `umi_pro.quotes` | `single`,`double` ,`backtick` |

## model 注册

> 详情可参考 [umi 官方文档](https://umijs.org/zh/guide/with-dva.html#model-%E6%B3%A8%E5%86%8C)

model 分两类，一是全局 model，二是页面 model。全局 model 存于 `/src/models/` 目录，所有页面都可引用；**页面 model 不能被其他页面所引用**。

规则如下：

- `src/models/**/*.js` 为 global model
- `src/pages/**/models/**/*.js` 为 page model
- global model 全量载入，page model 在 production 时按需载入，在 development 时全量载入
- page model 为 page js 所在路径下 `models/**/*.js` 的文件
- page model 会向上查找，比如 page js 为 `pages/a/b.js`，他的 page model 为 `pages/a/b/models/**/*.js` + `pages/a/models/**/*.js`，依次类推
- 约定 model.js 为单文件 model，解决只有一个 model 时不需要建 models 目录的问题，有 model.js 则不去找 `models/**/*.js`

举个例子，

```
+ src
  + models
    - g.js
  + pages
    + a
      + models
        - a.js
        - b.js
        + ss
          - s.js
      - page.js
    + c
      - model.js
      + d
        + models
          - d.js
        - page.js
      - page.js
```

如上目录：

- global model 为 `src/models/g.js`
- `/a` 的 page model 为 `src/pages/a/models/{a,b,ss/s}.js`
- `/c` 的 page model 为 `src/pages/c/model.js`
- `/c/d` 的 page model 为 `src/pages/c/model.js, src/pages/c/d/models/d.js`
