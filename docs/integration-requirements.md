# 闪学云端与大模型接入需求表

更新日期：2026-05-11

当前应用是本地优先的网页应用：记忆卡、笔记、历史记录、测验、进度、表格导出都已实装在浏览器本地。下面这些能力不能靠前端本地安全完成，必须接入云服务器、数据库或第三方接口后再上线。

## 需求表

| 能力 | 当前产品状态 | 需要你准备 | 我接下来能实现 |
| --- | --- | --- | --- |
| 云端账号与同步 | 产品内显示“未登录，本地模式” | 腾讯云云服务器公网地址、系统、远程登录用户名；域名；是否已备案 | 后端接口、用户表、登录态、历史记录云同步 |
| 数据库 | 本地浏览器存储 | 腾讯云数据库，或允许我在云服务器上部署数据库 | 用户、资料、卡片、笔记、答题记录、订阅状态的数据模型 |
| 文件/图片/视频存储 | 本地只读文本文件和图片预览 | 腾讯云对象存储私有存储桶、地域、访问策略 | 上传资料、图片、视频音频文件，生成临时上传和下载地址 |
| 大模型制卡 | 当前为本地规则生成，不调用模型 | 混元或其他兼容模型服务密钥；预算上限 | 真实大模型制卡、来源片段约束、结构化校验、失败重试 |
| 拍照识别 | 当前需要手动补充图片文字 | 腾讯云文字识别服务和访问权限 | 图片上传后自动提取文字，再进入制卡或笔记 |
| 语音转写 | 当前需要手动粘贴字幕或笔记 | 腾讯云语音识别或视频平台字幕方案；音频文件大小和时长策略 | 视频/音频转文字任务队列、转写结果入历史记录 |
| 公共卡组 | 产品内显示未配置，不展示假卡组 | 后台审核规则、内容安全服务、运营账号 | 发布、审核、搜索、下架、举报、公共卡组市场 |
| 好友/学习小组/排行榜 | 产品内显示未配置，不展示假好友 | 账号体系、隐私规则、未成年人策略 | 小组、邀请、共享卡组、好友榜、关闭社交开关 |
| 短信/微信登录 | 未接入 | 腾讯云短信签名和模板；微信开放平台应用 | 手机验证码登录、微信登录、账号绑定 |
| 推送通知 | 未接入 | 移动推送应用、安卓/苹果包名和证书 | 复习提醒、任务完成通知、召回推送 |
| 内容安全与合规 | 文档已有清单，产品未接云审核 | 文本/图片/音频/视频审核服务，隐私政策、用户协议、网站备案/应用备案 | 上传审核、大模型输出审核、举报处理、合规页和日志 |

## 你需要先操作的步骤

1. 腾讯云账号完成实名认证，确认你购买的一年云服务器是中国大陆地域还是境外地域。
2. 如果服务面向中国大陆并绑定域名，先完成网站备案或接入备案。未备案域名解析到腾讯云中国大陆服务器会被拦截。
3. 在云服务器安全组开放网页访问端口；远程登录端口只允许你的网络地址或临时开放。推荐系统：乌班图长期支持版。
4. 准备域名，把应用域名和接口域名的解析记录指向云服务器公网地址。
5. 开通对象存储，创建私有存储桶，地域尽量和云服务器相同。
6. 选择数据库方案：推荐腾讯云数据库；低成本内测可以先在云服务器上部署数据库。
7. 开通大模型服务。若选腾讯混元，准备对应的调用密钥。
8. 开通拍照识别、语音转写、文本内容安全；若要审核上传文件，再开通对象存储内容审核。
9. 在访问管理里创建子用户或角色，只授予闪学需要的对象存储、拍照识别、语音转写、混元、短信、内容安全权限。不要使用主账号密钥。
10. 把密钥放到本机环境配置文件或云端密钥管理服务，不要发到聊天里、不要提交到代码仓库。

## 需要给我的信息

| 信息 | 格式 | 注意 |
| --- | --- | --- |
| 云服务器公网地址 | 地址文本 | 不要发服务器密码 |
| 远程登录用户名 | 用户名 | 推荐密钥登录 |
| 远程登录私钥位置 | 本机文件路径 | 只给路径，不贴私钥内容 |
| 域名 | 你的正式域名 | 说明备案状态 |
| 数据库方案 | 腾讯云数据库 / 云服务器自建数据库 | 如果是腾讯云数据库，给内网地址和库名 |
| 对象存储信息 | 存储桶、地域、账号编号 | 密钥另放环境配置 |
| 模型供应商 | 混元或其他兼容模型 | 给模型名和预算上限 |
| 拍照识别/语音转写/内容安全 | 是否开通 | 我会按已开通服务接入 |

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
