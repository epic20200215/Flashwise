# 闪学云端与大模型接入需求表

更新日期：2026-05-11

当前 App 是本地优先 PWA：Cards、Notes、History、Quiz、Progress、CSV 导出都已实装在浏览器本地。下面这些能力不能靠前端本地安全完成，必须接入云服务器、数据库或第三方 API 后再上线。

## 需求表

| 能力 | 当前产品状态 | 需要你准备 | 我接下来能实现 |
| --- | --- | --- | --- |
| 云端账号与同步 | 产品内显示“未登录，本地模式” | 腾讯云 CVM 公网 IP、系统、SSH 用户名；域名；是否已备案 | 后端 API、用户表、登录态、History 云同步 |
| 数据库 | 本地 `localStorage` | TencentDB PostgreSQL/MySQL，或允许我在 CVM 上用 Docker 部署 PostgreSQL | 用户、资料、卡片、Notes、答题记录、订阅状态的数据模型 |
| 文件/图片/视频存储 | 本地只读文本文件和图片预览 | COS 私有 Bucket、地域、访问策略 | 上传资料、图片、视频音频文件，生成临时上传/下载 URL |
| 大模型制卡 | 当前为本地规则生成，不调用模型 | 混元、DeepSeek 或其他 OpenAI 兼容模型 API Key；预算上限 | 真实 AI 制卡、来源片段约束、JSON Schema 校验、失败重试 |
| OCR 拍照识别 | 当前需要手动补充图片文字 | 腾讯云 OCR 开通和 CAM 权限 | 图片上传后自动提取文字，再进入制卡/Notes |
| ASR/视频转写 | 当前需要手动粘贴字幕或笔记 | 腾讯云 ASR 或视频平台字幕方案；音频文件大小/时长策略 | 视频/音频转文字任务队列、转写结果入 History |
| 公共卡组 | 产品内显示未配置，不展示假卡组 | 后台审核规则、内容安全服务、运营账号 | 发布、审核、搜索、下架、举报、公共卡组市场 |
| 好友/学习小组/排行榜 | 产品内显示未配置，不展示假好友 | 账号体系、隐私规则、未成年人策略 | 小组、邀请、共享卡组、好友榜、关闭社交开关 |
| 短信/微信登录 | 未接入 | 腾讯云短信签名和模板；微信开放平台应用 | 手机验证码登录、微信登录、账号绑定 |
| 推送通知 | 未接入 | TPNS 应用、Android/iOS 包名和证书 | 复习提醒、任务完成通知、召回推送 |
| 内容安全与合规 | 文档已有清单，产品未接云审核 | 文本/图片/音频/视频审核服务，隐私政策、用户协议、ICP备案/APP备案 | 上传审核、AI 输出审核、举报处理、合规页和日志 |

## 你需要先操作的步骤

1. 腾讯云账号完成实名认证，确认你购买的一年 CVM 是中国大陆地域还是境外地域。
2. 如果服务面向中国大陆并绑定域名，先完成 ICP 备案或接入备案。未备案域名解析到腾讯云中国大陆服务器会被拦截。
3. 在 CVM 安全组开放 `80`、`443`；`22` 只允许你的 IP 或临时开放。推荐系统：Ubuntu 22.04/24.04 LTS。
4. 准备域名，把 `api.your-domain.com` 和 `app.your-domain.com` 的 A 记录指向 CVM 公网 IP。
5. 开通 COS，创建私有 Bucket，例如 `flashwise-prod-你的appid`，地域尽量和 CVM 相同。
6. 选择数据库方案：推荐 TencentDB PostgreSQL；低成本内测可以先在 CVM Docker 部署 PostgreSQL。
7. 开通大模型服务。若选腾讯混元，优先使用 OpenAI 兼容接口，准备 `HUNYUAN_API_KEY`。
8. 开通 OCR、ASR、文本内容安全；若要审核上传文件，再开通 COS 内容审核。
9. 在 CAM 创建子用户或角色，只授予闪学需要的 COS/OCR/ASR/混元/短信/内容安全权限。不要使用主账号密钥。
10. 把密钥放到本机 `.env.production.local` 或云端 Secret Manager，不要发到聊天里、不要提交到 Git。

## 需要给我的信息

| 信息 | 格式 | 注意 |
| --- | --- | --- |
| CVM 公网 IP | `x.x.x.x` | 不要发服务器密码 |
| SSH 用户名 | `ubuntu` / `root` | 推荐密钥登录 |
| SSH 私钥位置 | 本机文件路径 | 只给路径，不贴私钥内容 |
| 域名 | `flashwise.example.com` | 说明备案状态 |
| 数据库方案 | `TencentDB PostgreSQL` / `CVM Docker PostgreSQL` | 如果是 TencentDB，给内网地址和库名 |
| COS 信息 | Bucket、Region、APPID | 密钥另放 env |
| 模型供应商 | 混元 / DeepSeek / OpenAI 兼容 | 给模型名和预算上限 |
| OCR/ASR/内容安全 | 是否开通 | 我会按已开通服务接入 |

## 推荐环境变量

```env
APP_ORIGIN=https://app.your-domain.com
API_ORIGIN=https://api.your-domain.com
DATABASE_URL=postgresql://flashwise:password@host:5432/flashwise
JWT_SECRET=replace-with-random-32-bytes

TENCENT_SECRET_ID=replace-in-secret-manager
TENCENT_SECRET_KEY=replace-in-secret-manager
TENCENT_REGION=ap-guangzhou
COS_BUCKET=flashwise-prod-1234567890
COS_REGION=ap-guangzhou

HUNYUAN_API_KEY=replace-in-secret-manager
HUNYUAN_MODEL=hunyuan-turbos-latest
OCR_ENABLED=true
ASR_ENABLED=true
TMS_ENABLED=true
SMS_ENABLED=false
TPNS_ENABLED=false
```

## 官方资料

- [腾讯云 CVM 自定义配置 Linux 云服务器](https://cloud.tencent.com/document/product/213/10517)
- [腾讯云 ICP 备案概述](https://cloud.tencent.com/document/product/644/18907)
- [腾讯云 COS 控制台快速入门](https://cloud.tencent.com/document/product/436/38484)
- [腾讯云 TencentDB PostgreSQL 快速入门](https://cloud.tencent.com/document/product/409/7527)
- [腾讯混元快速入门](https://cloud.tencent.com/document/product/1729/97730)
- [混元 OpenAI 兼容接口调用示例](https://cloud.tencent.com/document/product/1729/111007)
- [腾讯云 OCR 通用印刷体识别](https://cloud.tencent.com/document/product/866/33526)
- [腾讯云 ASR 产品说明](https://cloud.tencent.cn/product/asr)
- [腾讯云 CAM 访问管理](https://cloud.tencent.com.cn/document/product/598)
- [文本内容安全服务](https://cloud.tencent.com/document/product/1124/51860)
- [COS 内容审核](https://cloud.tencent.com/document/product/436/45435)
- [腾讯云短信文档](https://cloud.tencent.com/document/product/382)
- [移动推送快速入门](https://cloud.tencent.com/document/product/548/37240)
