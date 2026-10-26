# 国网工作票助手：客户演示原型

这是一个用于客户沟通和界面演示的前端原型，不是正式工作票系统。

## 在线演示

首次部署完成后，客户可通过以下地址访问：

<https://sunchen-lz.github.io/guowang-work-ticket-demo/>

## 演示范围

原型包含工作票生成、资料管理、规则审核、模板管理、历史记录和本地设置等页面。演示数据只存在当前浏览器会话中，刷新后会恢复初始状态。

正式本地模型、客户资料解析、生产存储、审核权限和原始 Word/OFD/WPS 模板渲染尚未接入。选择文件只登记文件名和大小，不读取正文；导出内容是演示 JSON，不是正式工作票。请勿在公开演示中录入真实作业、人员或客户资料，也不要将演示结果用于现场作业。

## 本地运行

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173
```

运行测试和生产构建：

```sh
npm test
npm run test:sites
npm run build
```

## 发布

GitHub Actions 在 `main` 分支更新后运行测试、构建并部署 `dist/client` 到 GitHub Pages，也可在 Actions 页面手动触发。首次部署前，请在仓库的 **Settings → Pages** 中将构建来源设为 **GitHub Actions**。

Vite 会从 Pages 配置读取站点路径，因此项目仓库和用户主页仓库都能使用正确的静态资源地址。
