---
site_url:
_01: 网站正式域名，用于生成 Sitemap、Canonical、Open Graph 链接、RSS 和 llms.txt，例如 https://example.com
site_description: Always maintain a strong curiosity and be willing to explore a world of freedom.
_02: 网站 SEO 摘要，用于首页、归档页、关于页、社交分享和 AI 摘要文件。
site_language: zh-CN
_03: 网站语言代码，例如 zh-CN、en、ja、ko。
site_author: FreeCat
_04: 默认作者名称，用于文章页和结构化数据。
site_author_url:
_05: 作者主页链接，可留空；填写时建议使用完整网址。
site_author_sameas:
_06: 作者社交主页列表（YAML 数组），用于 Schema.org Person.sameAs，帮助 Google 识别作者身份。示例见下方注释。
site_default_image: /image/freecat.png
_07: 默认分享图片；页面或文章没有封面图时使用。
allow_ai_crawlers: false
_08: 是否在 robots.txt 中允许 Google、OpenAI、Claude、Perplexity 等搜索和 AI 爬虫抓取。
enable_llms_txt: true
_09: 是否生成 /llms.txt，方便 AI 搜索和检索系统理解网站内容。
---

<!--
site_author_sameas 填写示例（取消注释并改为自己的链接）：
site_author_sameas:
  - https://github.com/your-handle
  - https://x.com/your-handle
  - https://www.linkedin.com/in/your-handle
-->
