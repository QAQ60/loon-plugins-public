# loon-plugins

个人代理工具插件集合。

## 文件说明

| 文件 | 适用工具 | 说明 |
| --- | --- | --- |
| `kaoshibao.plugin` | Loon 3.5.1+ | 考试宝 VIP / 付费题库 / 搜题识图解锁 |
| `kaoshibao.sgmodule` | Shadowrocket 小火箭 | 同上，功能一致 |
| `scripts/kaoshibao.js` | — | 插件实际执行的 JS，两个配置共用 |

原 `lcks.plugin`（驾校一点通）已删除。它和考试宝插件改的是同一个接口
`ksbapi.jxedt.com/user/userInfo/get`，两者同时开启会互相覆盖；而且它会把昵称改成
「李春」、UID 改成 88888888，副作用比考试宝这版大。现在由考试宝插件统一处理。

## 订阅地址

Loon（插件）：

```
https://ghfast.top/https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/kaoshibao.plugin
```

小火箭（模块）：

```
https://ghfast.top/https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/kaoshibao.sgmodule
```

## ⚠️ 关于「Loon 必须开抓包」

这是最容易踩的坑，先说明白：

**Loon 的「抓包」开关就是 MITM 总开关。** 关掉它，Loon 不再解密 HTTPS，
任何 `http-response` 脚本都不会被触发 —— 不只是本插件，所有插件都一样。
表现就是「装了，完全没效果，也没有任何报错」。

所以：

- **Loon：必须保持抓包开启**，否则本插件（以及任何改写类插件）都不工作。
- **小火箭：没有这个限制**，`requires-body=1` 独立生效，关闭抓包照样改写。

Loon 官方没有提供「不开抓包也能跑响应体脚本」的选项，这不是配置写错，
也不是脚本问题，属于 Loon 的设计。想要免抓包就用小火箭模块。

## 接口覆盖

插件按 host + path 精确分发，未识别的接口**原样放行**，不会误伤埋点或统计请求。

| 域名 | 处理的接口 | 动作 |
| --- | --- | --- |
| `ksbapi.jxedt.com` | `user/userInfo/get`、`getExtra` | 伪造 VIP 字段、到期时间 2099 |
| | `user/userInfo/isJxtUser` | 置 1 |
| | `user/identityVerification/check` | 置已认证 |
| | `coupon/receiveTips`、`getExpireInfo` | 隐藏领取提示 |
| | `popup/get`、`popupAd/get`、`banner/get` | 清空弹窗/横幅 |
| | `user/paper/list`、`user/record/paperView` | 价格归零、解锁下载 |
| | `help/common/getConfig` | 打开识图自动裁切 |
| `gw-api.jxedt.com` | `app/config` | 免费搜题次数 → 9999、关广告 SDK、强开搜题 |
| `search-api.ksedt.com` | `api/question/v2/*` | 搜题次数放宽、识图状态置可用 |
| `richmanrules.ksedt.com` | `serverConfig/*/adConfig.json` | 清空广告 SDK 初始化配置 |
| `kaoshiapi.ksedt.com` | `kaoshi/*` | 考试次数放宽 |
| `api.ankianki.com` / `api.kaoshibao.com` / `search-api.yisouti.com` | 旧域名，保留兼容 | 同上 |

> 之前版本漏了 `gw-api.jxedt.com` 的实际改写：该接口响应体约 8KB，
> Loon 侧解析失败后走放行分支，导致「免费搜题次数」一直是真实值 3。
> v2 改了 body 解析策略，已修复。

## 排障

1. 把 `scripts/kaoshibao.js` 顶部的 `var DEBUG = false;` 改成 `true`，
   每次改写都会弹通知，能直接看出是「没命中」「body 为空」还是「解析失败」。
2. 通知里出现 **「响应体为空」** → Loon 没开抓包，或 MITM 证书未安装/未信任。
3. 通知里出现 **「解析失败」** → 接口改版，把通知里的 body 片段发出来即可定位。
4. 一条通知都没有 → 脚本根本没执行：检查 MITM `hostname` 是否包含目标域名、
   脚本 CDN 是否可达（jsDelivr 在国内偶有不稳定，可换 `ghfast.top` 前缀）。

MITM 证书安装：Loon → 设置 → 证书管理 → 生成并安装描述文件
→ iOS 设置 → 通用 → 关于本机 → 证书信任设置 → 打开完全信任。

## 修改记录

- 2026-10-18（v2）：响应体解析加固（剥离拼接的 HTTP 头、BOM、控制字符）；
  补全 `gw-api.jxedt.com`、`richmanrules.ksedt.com`、`search-api.ksedt.com`、
  `kaoshiapi.ksedt.com`；未识别接口改为原样放行；通知默认静默 + DEBUG 开关；
  小火箭模块补回 `banner/get` 拦截。
- 2026-10-18：从 Quantumult X 配置转为 Loon 插件；补充 `ksbapi.jxedt.com`、
  `search-api.ksedt.com`、`gw-api.jxedt.com`；新增小火箭模块。

## 风险声明

脚本通过篡改响应体伪造会员字段，属于绕过付费权益，违反服务条款，
存在账号风控风险，接口加签后即失效。仅供格式研究与个人学习，请支持正版。
