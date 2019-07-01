<h1 align="center">Umi Pro</h1>
<p align="center">
    <a href="https://travis-ci.org/umijs/vscode-extension-umi-pro" target="_blank">
      <img src="https://img.shields.io/travis/umijs/vscode-extension-umi-pro/master.svg?style=flat-square" alt="Build Status">
    </a>
    <a href="https://codecov.io/gh/umijs/vscode-extension-umi-pro" target="_blank">
      <img src="https://img.shields.io/codecov/c/github/umijs/vscode-extension-umi-pro/master.svg?style=flat-square" alt="Codecov">
    </a>
    <a href="https://github.com/umijs/vscode-extension-umi-pro/blob/master/LICENSE">
     <img src="https://img.shields.io/github/license/umijs/vscode-extension-umi-pro.svg">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=DiamondYuan.umi-pro" target="_blank">
      <img src="https://img.shields.io/visual-studio-marketplace/v/DiamondYuan.umi-pro.svg">
    </a>
</p>

## 安装

直接在 vs-code 商店搜索 `umi pro` 或者直接访问 [网页版商店](https://marketplace.visualstudio.com/items?itemName=DiamondYuan.umi-pro)

![](https://user-images.githubusercontent.com/9692408/57577593-072c0380-74ad-11e9-9151-44b5c4eb7550.png)

## 功能

<table>
	<tr>
		<th width="50%">
			路由文件跳转
		</th>
		<th width="50%">
			路由自动补全
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1557886736475-8853ac0b-b7c9-47b9-8060-501adc3511e6.gif">
		</td>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1557886780467-b5213b8b-8a6a-4bac-a716-3190c8ac56b3.gif">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Action 悬浮提示
		</th>
		<th width="50%">
	    Action 引用查看
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1558838255157-73d69de4-1a31-47e2-a275-9394e3d70d3a.gif">
		</td>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1558414327055-61f42a2f-a1cb-466d-aa02-be8bac3d1d24.gif">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Action 点击跳转
		</th>
		<th width="50%">
	    Action 自动补全
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1558838471127-3898f773-43d6-4615-961e-f3f3d4eafd21.gif">
		</td>
		<td>
			<img src="https://cdn.nlark.com/yuque/0/2019/gif/113971/1558838707622-d6d8bf18-f979-44ff-a058-72462cebef64.gif">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Locale 点击跳转
		</th>
		<th width="50%">
	    Locale 自动补全
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>docs/demo.gif
			<img src="https://github.com/umijs/vscode-extension-umi-pro/raw/master/images/goto.gif" />
		</td>
		<td>
			<img src="https://github.com/umijs/vscode-extension-umi-pro/raw/master/images/completion.gif" />
		</td>
	</tr>
</table>

## 可配置项

| 配置项 | 类型 | 作用 |
| --- | --- | --- |
| `umi_pro.quotes` | `single`,`double` ,`backtick` | 引号类型 |
| `umi_pro.router_config_path` | string | 路由配置文件的路径 |
| `umi_pro.autoGenerateSagaEffectsCommands` | boolean | 是否开启 saga effects 自动补全 |
| `umi_pro.locale` | string | 多语言提示以哪个语言的内容为准，默认`zh-CN.js` |

## model 读取规则

> 详情可参考 [umi 官方文档](https://umijs.org/zh/guide/with-dva.html#model-%E6%B3%A8%E5%86%8C)
