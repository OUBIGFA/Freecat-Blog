---
title: 
_01: 🔹 文章标题：不填写则自动使用文件名称
date: 2026-06-03
_02: 🔹 发布日期：发布或显示的时间
tag:
 - free
_03: 🔹 标签分类：用于文章归类和搜索
cover: https://i.pinimg.com/1200x/c6/5f/ac/c65facfb40e09748ba750102fe97a986.jpg
_04: 🔹 封面图片：文章在列表和顶部的展示图
show_image_captions: false
_05: 🔹 显示图注：是否在文章中显示图片下方的说明文字
description:
_06: 🔹 文章摘要：不填写则自动截取文章内容
pinned: false
_07: 🔹 置顶文章：是否将此文章固定在首页顶部
show: true
_08: 🔹 显示文章：是否在全站展示此文章
---

下面两份教程会手把手带你把网站登记到 Google 和 Bing 两家搜索引擎，让别人能在搜索结果里找到你。

整篇示例用的网址都是 \`https\://freecat-blog.pages.dev\`，你照着做的时候，把它换成你自己的网址即可。

\> 准备工作：先确认你的网站能在浏览器里正常打开。例如把 \`https\://freecat-blog.pages.dev\` 粘贴到浏览器地址栏，能看到你的博客首页，就可以开始了。

\---

\## 一、Google Search Console（让 Google 找到你）

\### 第 1 步：打开官方网址，登录账号

1\. 打开浏览器，访问：\`https\://search.google.com/search-console/\`

2\. 页面会跳到登录界面，用你的 \*\*Google 账号\*\*（也就是 Gmail 邮箱）登录。

&#x20;  \- 如果没有 Google 账号，点登录框下面的"创建账号"先注册一个。

3\. 登录成功后，会看到一个写着"欢迎使用 Search Console"的页面，中间有一个"开始"按钮，点它。

\### 第 2 步：添加你的网站

1\. 进入主界面后，会出现"选择资源类型"的弹窗，里面有两个方框：

&#x20;  \- \*\*左边\*\*：网域（Domain）

&#x20;  \- \*\*右边\*\*：网址前缀（URL prefix）

2\. \*\*请选右边的"网址前缀"\*\*（小白用这个最简单，不用碰 DNS 设置）。

3\. 在输入框里，\*\*完整粘贴\*\*你的网址，包含 \`https\://\`：

&#x20;  \`\`\`

&#x20;  https\://freecat-blog.pages.dev

&#x20;  \`\`\`

4\. 点下方蓝色的"继续"按钮。

\### 第 3 步：验证你是网站的主人

Google 会让你证明这个网站是你的。会弹出几种"验证方法"，\*\*推荐选第一种"HTML 标记"\*\*（HTML tag）。

1\. 在弹窗里找到"HTML 标记"那一行，点开它。

2\. 你会看到一段类似下面的代码（你的实际内容会不一样，\*\*不要直接抄这段\*\*，要复制你自己页面上的那一段）：

&#x20;  \`\`\`html

&#x20;  \<meta name="google-site-verification" content="abc123XXXXXXXXXXXXXXXXXXXXXXXXXXX" />

&#x20;  \`\`\`

3\. 点这段代码右侧的"\*\*复制\*\*"按钮，先放在一边。

4\. 暂时不要关这个 Google 页面，先去网站项目里粘贴这段代码。

\### 第 4 步：把验证代码贴到网站里

打开本项目里的这个文件：

\`\`\`

all/src/partials/head-base.html

\`\`\`

在文件里找到 \`\<meta charset="utf-8" />\` 这一行（大概在文件的中上部），在它的\*\*正下方另起一行\*\*，把你刚才复制的那段代码粘贴进去。粘贴完应该长这样（中间的 content 内容是你自己复制的，不是示例）：

\`\`\`html

\<meta charset="utf-8" />

\<meta name="google-site-verification" content="abc123XXXXXXXXXXXXXXXXXXXXXXXXXXX" />

\<meta content="width=device-width, initial-scale=1.0" name="viewport" />

\`\`\`

保存文件。

\### 第 5 步：把改动发布到线上

1\. 把项目里的改动提交（commit）并推送（push）到 GitHub。

2\. Cloudflare Pages 会自动重新构建网站，大约 1～2 分钟后线上就更新好了。

3\. 你可以在浏览器里打开 \`https\://freecat-blog.pages.dev\`，按 \`Ctrl + U\` 查看网页源代码，搜索 \`google-site-verification\`，能搜到说明已经生效。

\### 第 6 步：回到 Google 点"验证"

1\. 回到刚才那个还没关掉的 Google Search Console 页面。

2\. 点弹窗底部的"\*\*验证\*\*"按钮。

3\. 提示"已验证所有权"，恭喜，第一步完成了。

\### 第 7 步：提交网站地图（Sitemap），帮 Google 找到所有文章

1\. 在 Search Console 左侧菜单里，找到并点击"\*\*站点地图\*\*"（Sitemaps）。

2\. 在"添加新的站点地图"那一栏，只需要填写 \`sitemap.xml\`：

&#x20;  \`\`\`

&#x20;  sitemap.xml

&#x20;  \`\`\`

&#x20;  完整路径会自动变成：\`https\://freecat-blog.pages.dev/sitemap.xml\`

3\. 点"\*\*提交\*\*"按钮。

4\. 状态显示"成功"就完成了。Google 会在接下来几天到几周内陆续把你的文章收录进搜索结果。

\---

\## 二、Bing 站长平台（让必应、ChatGPT 等找到你）

\> 小提示：Bing 的数据被 ChatGPT、Copilot 等很多 AI 工具使用，加入 Bing 之后，AI 也能更容易找到你的博客。

\### 第 1 步：打开官方网址，登录账号

1\. 浏览器打开：\`https\://www\.bing.com/webmasters/\`

2\. 点页面上的"\*\*立即开始\*\*"（Get started）按钮。

3\. 登录方式可以从这三个里选一个，都行：

&#x20;  \- \*\*Microsoft 账号\*\*（微软账号，没有可以注册一个）

&#x20;  \- \*\*Google 账号\*\*

&#x20;  \- \*\*Facebook 账号\*\*

建议用 \*\*Google 账号\*\* 登录，因为下一步可以直接把 Google Search Console 里的信息一键导入。

\### 第 2 步：添加你的网站（两条路任选一条）

登录后会进入"添加网站"页面，给你两条路：

\#### 路线 A（最快，推荐）：从 Google Search Console 导入

\> 前提：你已经完成上面那份 Google 教程，并且用 Google 账号登录 Bing。

1\. 左边那块大方框写着"\*\*导入\*\*"（Import）。

2\. 点蓝色"\*\*导入\*\*"按钮。

3\. 会弹出一个 Google 授权页面，点"\*\*继续\*\*"或"\*\*允许\*\*"。

4\. Bing 会列出你在 Google Search Console 里的所有网站，勾选 \`https\://freecat-blog.pages.dev\`，点"\*\*导入\*\*"。

5\. 几秒钟后就完成，\*\*不需要再次验证\*\*，跳到第 5 步提交 Sitemap 即可。

\#### 路线 B：手动添加

如果不想用导入，可以手动加：

1\. 右边那块方框写着"\*\*手动添加站点\*\*"（Add your site manually）。

2\. 在输入框里填入：

&#x20;  \`\`\`

&#x20;  https\://freecat-blog.pages.dev

&#x20;  \`\`\`

3\. 点"\*\*添加\*\*"按钮。

4\. 接着按下面第 3、第 4 步去验证。

\### 第 3 步：选择验证方式（手动添加才需要）

页面会让你选验证方式，\*\*推荐选"Meta 标签"\*\*（HTML Meta Tag），和 Google 那种一样最简单。

1\. 找到"Meta 标签"那一项，点开。

2\. 会显示一段代码，例如（同样以你自己页面上的为准）：

&#x20;  \`\`\`html

&#x20;  \<meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />

&#x20;  \`\`\`

3\. 点右边的"\*\*复制\*\*"按钮。

\### 第 4 步：把验证代码贴到网站里（手动添加才需要）

和 Google 教程的第 4 步一模一样，打开：

\`\`\`

all/src/partials/head-base.html

\`\`\`

在 \`\<meta charset="utf-8" />\` 这一行\*\*正下方\*\*新起一行，粘贴你刚刚复制的那段。粘贴完大概长这样（如果你之前 Google 那段也加了，就两段都留着）：

\`\`\`html

\<meta charset="utf-8" />

\<meta name="google-site-verification" content="abc123XXXXXXXXXXXXXXXXXXXXXXXXXXX" />

\<meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />

\<meta content="width=device-width, initial-scale=1.0" name="viewport" />

\`\`\`

保存 → 提交 → 推送 → 等 Cloudflare Pages 部署完（1～2 分钟）。

然后回到 Bing 页面，点"\*\*验证\*\*"按钮。提示"验证成功"即完成。

\### 第 5 步：提交网站地图（Sitemap）

1\. 登录 Bing 站长平台主界面后，左侧菜单里点"\*\*站点地图\*\*"（Sitemaps）。

2\. 点右上角的"\*\*提交站点地图\*\*"按钮。

3\. 弹窗里填入你网站的完整 Sitemap 地址：

&#x20;  \`\`\`

&#x20;  https\://freecat-blog.pages.dev/sitemap.xml

&#x20;  \`\`\`

&#x20;  \> 注意：和 Google 不一样，Bing 这里要填\*\*完整网址\*\*，不是只填 \`sitemap.xml\`。

4\. 点"\*\*提交\*\*"。

5\. 看到列表里出现这一条、状态是"成功"，就大功告成。

\---

\## 三、验收清单

完成上面两份教程后，你的网站应该达到下面这个状态。逐项对照检查一下：

\- \[ ] 浏览器打开 \`https\://freecat-blog.pages.dev\` 能正常访问

\- \[ ] 网页源代码里能搜到 \`google-site-verification\`（代表 Google 验证已上线）

\- \[ ] 网页源代码里能搜到 \`msvalidate.01\`（如果走的是 Bing 手动添加；用导入方式则不会有）

\- \[ ] Google Search Console 显示"已验证所有权"

\- \[ ] Google Search Console 的站点地图列表里有 \`sitemap.xml\`，状态"成功"

\- \[ ] Bing 站长平台首页能看到 \`https\://freecat-blog.pages.dev\`

\- \[ ] Bing 站长平台的站点地图列表里有 \`https\://freecat-blog.pages.dev/sitemap.xml\`，状态"成功"

全部打勾，就说明你的网站已经正式被两大搜索引擎收录追踪。接下来正常写博客就行，新文章一般几天到几周内就会出现在搜索结果里。

\---

\## 四、常见问题

\*\*问：验证一直失败怎么办？\*\*

\- 先确认 Cloudflare Pages 已经构建完成（去 Cloudflare 后台看"Deployments"是不是显示绿色"Success"）。

\- 在浏览器里打开你的网站，按 \`Ctrl + Shift + R\` 强制刷新，再按 \`Ctrl + U\` 查看源代码，搜索 \`google-site-verification\` 或 \`msvalidate.01\`，确认那段代码真的出现在页面里。

\- 出现了再回平台点验证，一般就能过。

\*\*问：网址前缀和网域有什么区别？我该选哪个？\*\*

\- "网址前缀"只需要把验证代码贴进网页里，小白选这个。

\- "网域"需要去你买域名的地方修改 DNS 解析记录，门槛高。除非你想一次性验证整个域名（包括所有子域名），否则不需要碰它。

\*\*问：Sitemap 提交后多久能看到文章被收录？\*\*

\- Google 一般几天到 2 周，Bing 一般 1～4 周。新站需要耐心，期间不用反复重新提交。

\*\*问：要不要把这两段 meta 代码删掉？\*\*

\- \*\*不要删\*\*。删掉之后两个平台会判定你"失去所有权"，可能把你的网站从后台移除。这两段代码永久留在 \`head-base.html\` 里就好，对网站没有任何副作用。
