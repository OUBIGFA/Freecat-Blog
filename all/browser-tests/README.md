先运行 npm run preview，再在另一终端运行 npm run test:browser。

测试使用无窗口浏览器，覆盖桌面和手机尺寸。Windows 使用已安装的 Edge；其他平台先运行 npx playwright install chromium。

失败记录保存在仓库根目录的 .test/browser-tests/。
