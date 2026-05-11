# Android 打包说明

当前闪学实现为零依赖 PWA，可以直接用于 Web 预览和静态部署。Android 原生包建议后续采用两条路线之一：

## 路线 A：Expo/React Native 正式客户端

当需要完整原生能力、推送通知、文件系统、OCR/相机深度集成时，将当前 PWA 的产品逻辑迁移到 Expo。可参考但不得修改 `F:\cursor\OCKI\ocki-mobile` 的以下文件：

- `package.json` 中的 `web`、`android`、`typecheck`、`verify:release` 脚本结构。
- `scripts/with-android-sdk.cjs` 的仓库本地 Android SDK 注入方式。
- `scripts/build-android-apk.ps1` 的 JDK/ANDROID_HOME/Gradle 打包流程。
- `app.json`、`eas.json` 的 Expo Android 配置形态。

复制时必须只读 OCKI，所有改动落在 `F:\codex\闪学`。

## 路线 B：PWA WebView/TWA

当 MVP 先验证学习闭环时，将 `dist/` 部署为 HTTPS 站点，再用 Trusted Web Activity 或 Android WebView 包装。优势是快，缺点是原生文件、通知和后台任务能力较弱。

## 当前可执行命令

```powershell
npm.cmd run dev
npm.cmd run build
```

`npm.cmd run build` 会生成 `dist/`，可部署到任意静态站点服务。
