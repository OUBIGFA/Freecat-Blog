---
site_url: https://freecat-blog.pages.dev
_01: 必填：填写你自己的正式域名，例如 https://example.com；不要填文章地址、子路径或预览域名。
site_description: Always maintain a strong curiosity and be willing to explore a world of freedom.
_02: 网站 SEO 摘要，用于首页、归档页、关于页、社交分享和 AI 摘要文件。
site_language: zh-CN
_03: 网站语言代码，例如 zh-CN、en、ja、ko。
site_author: FreeCat
_04: 默认作者名称，用于文章页和结构化数据。
site_author_url: https://freecat-blog.pages.dev
_05: 作者主页链接，可留空；填写时建议使用完整网址。
site_author_sameas:
_06: 作者社交主页列表（YAML 数组），用于 Schema.org Person.sameAs，帮助 Google 识别作者身份。示例见下方注释。
site_default_image: /image/freecat.png
_07: 默认分享图片；页面或文章没有封面图时使用。若 site_网站属性.md 的 hero_avatar 已填写，构建时会自动优先使用头像。
google_html_marker: <meta name="google-site-verification" content="SYFsSowdYtQ4XyZC1rsuoK8zHEfDe2CDd4MWoRZXnMo" />
_08: Google Search Console 的 HTML 标记；直接粘贴 Google 提供的整段 <meta name="google-site-verification" ... />，可留空。
bing_html_marker:
_09: Bing 站长平台的 Meta 标签；直接粘贴 Bing 提供的整段 <meta name="msvalidate.01" ... />，可留空。
allow_ai_crawlers: false
_10: 是否允许 AI 爬虫；false 禁止这些爬虫，Google 和 Bing 普通网页搜索不受影响。
enable_llms_txt: true
_11: 是否生成 /llms.txt，方便 AI 搜索和检索系统理解网站内容。
---

<!--
site_author_sameas 填写示例（取消注释并改为自己的链接）：
site_author_sameas:
  - https://github.com/your-handle
  - https://x.com/your-handle
  - https://www.linkedin.com/in/your-handle
-->

## 上线后检查收录

1. 将上方 **site_url** 改成自己的正式域名，提交改动并等待部署完成。
2. 打开 **你的域名/robots.txt** 和 **你的域名/sitemap.xml**，确认里面的域名和文章地址正确。
3. 在 [Google Search Console](https://search.google.com/search-console) 验证同一个域名，提交 **sitemap.xml**。
4. 用「网址检查」检查一篇完整文章地址，点击「测试实际网址」，确认允许抓取、允许编入索引，渲染页面包含文章正文，再点击「请求编入索引」。
5. 在「网页索引」查看未收录原因；若有验证码、403、登录要求或禁止索引的响应头，先到托管平台解除对应限制。

**同一博客只选一个正式域名。** 使用自定义域名时，在托管平台将旧域名永久重定向到它，并更新 site_url。

文章默认允许收录；文章开头设置 **noindex: true** 会禁止收录，**show: false** 会停止发布。搜索页和连续播放页面不提交给搜索引擎。

构建会检查文章正文、收录指令、规范地址、归档链接和站点地图；检查失败时停止构建。普通阅读保持独立文章页面，点击播放音乐后支持跨页连续播放。

**部署通过不等于 Google 已收录。** 抓取、收录和排名由 Google 决定；提交后以 Search Console 的结果为准，不需要反复提交同一网址。

参考（2026-09-29 核对）：[JavaScript 与索引](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[分页发现](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)、[规范网址](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)。
