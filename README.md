# Crab
🦀️轻巧的Node.js定时爬虫框架（项目文档待完成）。

该框架是一个Node.js定时爬虫，基于[Koa2](https://github.com/koajs/koa)和[Request](https://github.com/request/request)。数据库使用sqlite3，在这里数据库仅仅用于保存爬虫任务等数据。要将数据转移到其他位置，请在crab.config.js中自定义。

与Python的Scrapy爬虫框架不同的是，Crab仅仅用于定时爬虫任务，比如说定时获取某位明星的微博粉丝等数据。Crab支持完全自定义爬虫规则及保存数据规则，提供一些特殊的钩子函数来满足需求。

## 相关项目

- [crab-admin](https://github.com/ZhelinCheng/crab-admin)【待开发】：Crab爬虫的管理后台前端项目。
- [crab-cli](https://github.com/ZhelinCheng/crab-cli)【待开发】：快速创建一个最新的Crab项目，如果不用它，你也可以直接克隆本项目。

## 起步

安装cli工具：

```
// 当前Cli工具还未开发，如要使用该项目，请直接克隆。
npm i -g crab-cli
```

创建新项目并安装依赖：
```
crab create my-project && cd ./my-project && npm i 
```

构建：
```
npm run build
```

开发：
```
npm run dev
```

启动：
```
npm run start
```
