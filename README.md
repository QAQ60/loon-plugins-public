# loon-plugins

个人 Loon 插件集合。

## 插件列表

| 文件 | 说明 | 状态 |
|---|---|---|
| `lcks.plugin` | 驾校一点通 `ksbapi.jxedt.com/user/userInfo/get` 响应体改写（由 Quantumult X 版 `lcks.conf` 转换） | 可用，依赖第三方 JS |
| `kaoshibao.plugin` | 考试宝（api.ankianki.com / api.kaoshibao.com）VIP 与付费题库解锁，含 banner 屏蔽 | 可用，脚本已自托管在 `scripts/kaoshibao.js` |

### 考试宝插件说明

- 上游 `Yu9191/Rewrite` 账号已被删除，原 `kaoshibao.js` 地址 404，插件改为引用本仓库 `scripts/kaoshibao.js`，不再依赖第三方。
- 接口域名：`api.ankianki.com`（旧）与 `api.kaoshibao.com`（新）解析到同一后端 `fe-jx-v4.op.jxedt.com`，插件同时覆盖两者。
- 相比原脚本修复了 `body` 为空时 `$done` 被调用两次的问题，并用 IIFE 包裹避免顶层 `return` 在部分引擎下报错。

订阅地址：

```
https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/kaoshibao.plugin
```

## 安装

**方式一：文件导入**

下载 `lcks.plugin`，在 Loon「配置 → 插件 → 从文件导入」中选中它。

**方式二：URL 添加（公开镜像仓库）**

Loon「配置 → 插件 → 从 URL 添加」，填入：

```
https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/lcks.plugin
```

raw 访问不稳定时换 jsDelivr 镜像：

```
https://cdn.jsdelivr.net/gh/QAQ60/loon-plugins-public@master/lcks.plugin
```

> 本仓库（`loon-plugins`）为私有源，`loon-plugins-public` 是面向 Loon 订阅的公开镜像，两者内容一致。

**方式三：单条重写（最轻量）**

在 Loon「配置 → 重写 → 新建」：

- 类型：`http-response`
- 正则：`^https?://ksbapi\.jxedt\.com/user/userInfo/get`
- 脚本：`https://raw.githubusercontent.com/lichuntu/js/main/lcksb.js`
- 勾选「需要 Body」

## 前置条件

1. 开启 Loon 的 MITM 开关。
2. 安装并信任 Loon 的根证书。
3. `ksbapi.jxedt.com` 在 MITM hostname 列表中（插件里已用 `%APPEND%` 追加）。

## 说明与风险

- 脚本由第三方作者 lichun 提供，本仓库只做 Quantumult X → Loon 的格式转换，未修改 JS 逻辑。
- 脚本会无差别覆盖昵称（改为「李春」）、`public_uid`（88888888）、性别等字段，属于原脚本写死的副作用。
- 该脚本通过篡改响应体伪造会员字段，属于绕过 App 付费权益，违反其用户协议，存在被风控、封号或权益冻结的风险；接口一旦增加签名校验即失效。
- 仅供格式研究与个人学习，请支持正版服务。

## 变更记录

- 2026-10-18：由 `lcks.conf`（Quantumult X）转换生成 Loon 插件格式。
