# loon-plugins

个人代理工具插件集合。

## 文件说明

| 文件 | 适用工具 | 说明 |
|---|---|---|
| `kaoshibao.plugin` | Loon 3.5.1+ | 考试宝 VIP / 付费题库 / 搜题识图解锁 |
| `kaoshibao.sgmodule` | Shadowrocket 小火箭 | 同上，功能一致 |
| `lcks.plugin` | Loon | 驾校一点通 userInfo 改写 |
| `scripts/kaoshibao.js` | — | 考试宝插件实际执行的 JS，插件里引用它 |

## 订阅地址

Loon（插件）：

```
https://ghfast.top/https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/kaoshibao.plugin
```

小火箭（模块）：

```
https://ghfast.top/https://raw.githubusercontent.com/QAQ60/loon-plugins-public/master/kaoshibao.sgmodule
```

## 接口说明

考试宝与驾校一点通属同一家，共用后端：

| 域名 | 用途 |
|---|---|
| `ksbapi.jxedt.com` | 用户信息、VIP 状态、题库、考试次数（考试宝实际使用的入口） |
| `api.ankianki.com` / `api.kaoshibao.com` | 历史域名，保留兼容 |
| `search-api.ksedt.com` | 搜题 / 识图 / OCR |
| `gw-api.jxedt.com` | 全局配置，含免费搜题次数 `qstskill.times` |
| `search-api.yisouti.com` | 旧搜题接口，保留兼容 |

插件里出现 `jxedt` 域名是正常的，不是拿错了驾校一点通的配置。

## 已知限制

- **Loon 3.5.0 不执行本插件脚本**：实测 3.5.0 上 `http-response` 脚本关闭抓包时完全不触发，手动新建脚本同样无效。请升级到 3.5.1 及以上。
- **Loon 需要开启抓包**：在部分版本上，关闭抓包后脚本无法获取响应体，表现为“装了但没效果”。
- **小火箭没有上述限制**，`requires-body=1` 独立生效，推荐用小火箭模块。

## 修改记录

- 2026-10-18：从 Quantumult X 配置转为 Loon 插件；补充 `ksbapi.jxedt.com`、`search-api.ksedt.com`、`gw-api.jxedt.com`；脚本加入 JSON 容错（Loon 会把响应头拼进 body）；新增小火箭模块。

## 风险声明

脚本通过篡改响应体伪造会员字段，属于绕过付费权益，违反服务条款，存在账号风控风险，接口加签后即失效。仅供格式研究与个人学习，请支持正版。
