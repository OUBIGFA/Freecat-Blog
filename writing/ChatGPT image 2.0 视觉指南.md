---
title:
_01: 🔹 文章标题
date: 2026-05-06
_02: 🔹 发布日期：发布或显示的时间
tag:
  - Design
  - prompt
  - Evergreen
  - AI
_03: 🔹 标签分类：用于文章归类和搜索
cover: https://i.pinimg.com/originals/f6/9a/98/f69a983fb6ae0f701c053d55d71f5a84.gif
_04: 🔹 封面图片：文章在列表和顶部的展示图
show_cover: false
_05: 🔹 显示封面：是否在文章详情页展示顶部封面图
show_image_captions: false
_06: 🔹 显示图注：是否在文章中显示图片下方的说明文字
description:
_07: 🔹 文章摘要：不填写则自动截取文章内容
pinned: true
_08: 🔹 置顶文章：是否将此文章固定在首页顶部
show: true
_09: 🔹 显示文章：是否在全站展示此文章
show_latest_update: true
_10: 🔹 显示最新更新：是否在文章页左侧显示正文最后更新内容
---

### 提示词仓库

#### Image2 Hub

https://image2hub.netlify.app



#### awesome-gpt-image-2

https://github.com/freestylefly/awesome-gpt-image-2



#### OpenNana提示词图库

https://opennana.com/awesome-prompt-gallery



#### Image 2 Prompt Gallery + Agentic Skill + CLI

https://github.com/wuyoscar/gpt_image_2_skill



#### AI Image Prompts

https://drawprompt.org/ai-prompts



#### AI Visual Prompt Cookbook

https://github.com/VigoZhao/AI-Visual-Prompt-Cookbook/blob/main/README.zh-CN.md



#### ChatGPT Prompts

https://prompthero.com/chatgpt-prompts 


### 免费 MCP 服务

#### MeiGen-AI-Design-MCP

https://github.com/jau123/MeiGen-AI-Design-MCP



#### GPT-Image2-Skill

https://github.com/wuyoscar/GPT-Image2-Skill

---

### 案例 | Sample Collection

#### 视觉设计类

```
一张高端潮流街头服装海报，画面主体是一位无脸的未来感模特漂浮跳跃在天空中，穿着超大号米色羽绒服、层叠兜帽和针织面罩，面部被完全遮住；下身穿白色宽松工装裤，裤腿外叠加夸张的浅蓝与深蓝堆叠牛仔护腿，脚穿米色运动鞋，背着黑色单肩包。

主体采用极低机位仰拍视角，腿部和鞋子被夸张放大，形成强烈的视觉冲击，仿佛人物正在从观众头顶跃起。动作充满反重力感，一只手向外伸展，一条腿向前踢出，整体姿态动感、飘浮、超现实。

背景是明亮的青蓝色天空和柔软白云，日光清透，空气感强。整体融合时尚大片摄影、超现实潮流广告和街头海报设计。在画面右上角和左下角加入两个缩小版的人物剪影拼贴，一个在空中漂浮，一个正在跳跃，形成时装杂志拼贴感。

海报排版为方形杂志封面设计，顶部加入巨大的抽象圆角字体，类似 Y2K 泡泡字和实验性街头品牌 LOGO；左侧加入小型涂鸦风品牌标识；右侧加入白色手写刷字标题“RISE ABOVE WITH FASHION”，下方配极小号编辑说明文字；底部中央加入小型条形码。整体带细白边框和淡米白纸张纹理。

风格关键词：未来街头时尚、先锋服装设计、Y2K 平面设计、杂志封面排版、拼贴剪影、超低机位仰拍、天空背景、超现实漂浮、夸张透视、潮流广告大片、真实布料质感、高清细节、干净高级。

Make the aspect ratio 9:16
```

![潮流海报](https://pbs.twimg.com/media/HHhUcwGaIAAAAyj?format=jpg&name=large)


```JSON
{
"style_name": "Pop Bubble Letter Photo Poster Style",
"style_slug": "pop-bubble-letter-photo-poster-style",
"style_summary": "A punchy photo-and-illustration poster style built around a central low-angle fashion portrait framed by oversized flat bubble-letter shapes, saturated candy colors, thick black outlines, oval highlights, and crisp sparkle marks.",
"environment_variables": {
"SUBJECT": "main person, model, performer, maker, athlete, student, traveler, or product ambassador",
"SUBJECT_ACTION": "standing still, leaning back, looking upward, closing eyes in sunlight, holding a prop, stepping forward, or posing calmly",
"PRODUCT_OR_PROP": "camera, headphones, drink bottle, book, bouquet, transit card, compact mirror, sunglasses, or featured product",
"LOCATION": "painted wall, studio set, public plaza, gallery exterior, market stall, campus courtyard, subway entrance, or clean event backdrop",
"BACKGROUND_ELEMENTS": "dark green negative-space panel, oversized cropped bubble letters, white sparkle marks, oval shine highlights, candy-colored abstract shapes",
"MAIN_TEXT": "short bubble-letter word or graphic headline such as WOW, POP, OPEN, BLOOM, WAVE, or PLAY",
"SECONDARY_TEXT": "tiny editorial caption, campaign note, date line, or short supporting phrase",
"ACCENT_SYMBOL": "four-point sparkle, oval highlight, curved underline, star separator, or small rounded sticker shape",
"WARDROBE_STYLE": "bold striped knit, saturated trousers, color-block streetwear, mod fashion layers, clean editorial styling, or retro pop styling",
"ASPECT_RATIO": "9:16 or 16:9"
},
"visual_deconstruction": {
"overall_style_category": [
"photo illustration hybrid poster",
"pop-art bubble typography collage",
"retro mod fashion poster",
"social-first editorial campaign visual"
],
"composition_and_layout": "A real photographic subject is centered and framed by enormous flat illustrated bubble-letter forms. The illustrated forms crop hard at the image edges, overlap the subject in foreground and background layers, and create a playful typographic border around a dark central negative-space field.",
"subject_placement": "The subject sits in the central vertical axis, usually from waist to head, with the face near the upper-middle. Foreground bubble forms can cover parts of the lower body while leaving the face and torso readable.",
"camera_angle_or_perspective": "Low-angle or slightly upward editorial portrait photography. The subject feels heroic, sunlit, and calm while the surrounding graphics feel loud and playful.",
"typography_style": "Huge inflated bubble letters or abstract letter-like shapes with thick black outlines, rounded lobes, flat fills, minimal internal detail, and small white oval highlights. Text can be partly cropped or semi-abstract but should remain bold and graphic.",
"texture_and_finish": "Clean digital poster finish with photographic skin and fabric detail contrasted against flat vector-like illustration. Use smooth color fills, crisp ink outlines, slight print-poster compression, and no heavy grunge.",
"lighting": "Bright direct sun or clean studio light on the subject, with warm highlights on skin and wardrobe. Illustrated areas stay flat and evenly colored.",
"mood_and_cultural_reference": "Optimistic, bold, fashion-forward, playful, pop-art, retro-mod, youth campaign, candy-colored street poster, and social content cover."
},
"core_visual_identity": {
"composition": "Central low-angle portrait framed by oversized cropped bubble letters and sparkle marks.",
"typography": "Rounded bubble-letter forms treated as the main graphic architecture, not as small readable copy.",
"palette": {
"hot_pink": "#E746A8",
"candy_yellow": "#F7D94A",
"leaf_green": "#49A657",
"deep_evergreen": "#062815",
"tangerine_orange": "#F35B34",
"tomato_red": "#E43C2D",
"powder_blue": "#A9B9D8",
"cream_highlight": "#FFF8DE",
"ink_outline": "#211C18"
},
```

![](https://pbs.twimg.com/media/HHtrsgPa8AEq9Um?format=jpg&name=large)


```JSON
{
  "style_id": "photo_graffiti_doodle_v1",
  "instance_id": "kitchen_hot_01",
  "style_name": "Photo + Graffiti Doodle Overlay — Kitchen / HOT!",
  "description": "A candid kitchen cooking photograph heavily overlaid with bold hand-drawn graffiti-style doodles, characters and tags. Flame-octopus energy, ketchup-bottle sidekick, chaotic cooking vibe.",

  "base_layer": {
    "type": "photograph",
    "content": "young woman cooking in a warm home kitchen, tossing vegetables in a pan over the stove, steam rising, wearing a striped apron, candid lifestyle shot",
    "treatment": {
      "color_grade": "natural, warm tungsten kitchen light",
      "contrast": "medium-high",
      "saturation": "realistic",
      "grain": "subtle film grain",
      "depth_of_field": "shallow, soft background",
      "aspect_ratio": "9:16"
    }
  },

  "overlay_layer": {
    "medium": "hand-drawn marker + spray paint + ink doodle",
    "line_quality": "rough, confident, uneven stroke weight, slight wobble, occasional drips",
    "rendering": "flat colors, no gradients, black ink outlines, minimal inner shading",
    "blend_mode": "normal (opaque, sits on top of the photo)",
    "opacity": "100%",
    "coverage": "35–45% of canvas; never covers the subject's face"
  },

  "color_palette": {
    "primary": [
      { "name": "spray red",        "hex": "#E8241C" },
      { "name": "cobalt blue",      "hex": "#1C3FD8" },
      { "name": "graffiti yellow",  "hex": "#F7D32A" }
    ],
    "accent": [
      { "name": "marker green",     "hex": "#1DB55A" },
      { "name": "ink black",        "hex": "#111111" },
      { "name": "highlight white",  "hex": "#FFFFFF" }
    ],
    "dominant_in_this_instance": "graffiti yellow (hero) + spray red (tag + secondary)",
    "usage_rule": "Each doodle uses 1–3 colors max; black for all outlines; white for motion lines & halo."
  },

  "composition": {
    "layout": "subject on the left-center tossing the pan; hero creature looms from the pan upward-right; tag anchors top-left; secondary creature sits on the counter bottom-center",
    "density": "medium-high",
    "hierarchy": [
      "1. Real woman cooking (face + hands preserved)",
      "2. Yellow flame octopus hero above the pan",
      "3. 'HOT!' tag on red spray cloud (top-left)",
      "4. Red ketchup-bottle smiley secondary (bottom-center counter)",
      "5. Tiny edge characters around sink / cutting board / corners"
    ],
    "negative_space_rules": [
      "Keep the woman's face, hair and toss-motion fully visible",
      "Leave the stove flame area below the pan mostly clean so the pan reads"
    ]
  },

  "typography": {
    "primary_tag": {
      "style": "wildstyle graffiti tag",
      "stroke": "thick black marker, sharp arrow on the H, small paint drips below",
      "fill": "solid black on a red spray-paint cloud",
      "placement": "top-left",
      "content": "HOT!"
    },
    "corner_symbol": {
      "style": "bold filled doodle glyph",
      "placement": "top-right",
      "color": "ink black",
      "content": "black flame symbol"
    }
  },

  "doodle_characters": {
    "hero_creature": {
      "role": "largest overlay; looms above the pan, tentacles curling around the cooking action",
      "color": "graffiti yellow (body) + ink black (outline + pupils) + highlight white (eye whites)",
      "vibe": "goofy, chaotic-friendly, oversized googly eyes, flame-shaped head",
      "content": "huge bright yellow cartoon flame octopus with big googly eyes and wavy tentacles curling around and above the pan"
    },
    "secondary_creature": {
      "role": "sits on the counter, squeezed out of a real prop",
      "color": "spray red (bottle + face) + ink black (outline) + highlight white (eye whites)",
      "content": "red cartoon smiling face squeezed out of a ketchup bottle with red droplets spilling onto the counter"
    },
    "tiny_characters": [
      "small green vegetable stick-figure (leek/celery-shaped) jumping off the cutting board near the sink",
      "tiny blue water-drop character with arms and a cheeky face, standing near the faucet/sink",
      "small black grumpy onion face with sharp teeth in the bottom-right corner",
      "white spark burst doodle above the pan where the food is tossed"
    ]
  },

  "decorative_elements": {
    "spray_blob": {
      "shape": "irregular cloud with drip tails below",
      "color": "spray red",
      "placement": "behind the 'HOT!' tag, top-left",
      "content": "irregular red spray-paint cloud with 3–4 paint drips bleeding down"
    },
    "motion_marks": [
      "white hand-drawn action lines radiating from the yellow flame octopus",
      "white halo ring floating above the woman's head",
      "short white dashes and dots as 'heat/energy' specks near the pan",
      "small black motion flicks around the ketchup squeeze"
    ],
    "extra_symbols": [
      "scribbled star near the flame octopus",
      "bold black exclamation mark near the stove"
    ],
    "borders": "none — elements bleed to the edges, no frame"
  },

  "mood": {
    "keywords": ["playful", "chaotic-good", "cozy", "street", "lo-fi zine", "cooking-show energy"],
    "energy": "high",
    "reference_culture": "90s NYC graffiti meets home-cooking vlog poster"
  },

  "variables_used": {
    "BASE_PHOTO": "young woman cooking in a home kitchen, tossing a pan over the stove, steam rising, warm tungsten light, 9:16",
    "TAG_TEXT": "HOT!",
    "CORNER_SYMBOL": "black flame symbol",
    "HERO_CREATURE": "yellow flame octopus with big eyes, tentacles curling around the pan",
    "HERO_COLOR": "graffiti yellow",
    "SECONDARY_CREATURE": "red smiling face squeezed out of a ketchup bottle",
    "SECONDARY_COLOR": "spray red",
    "TINY_CHAR_1": "green vegetable stick-figure jumping off the cutting board",
    "TINY_CHAR_2": "tiny blue water-drop character near the sink",
    "TINY_CHAR_3": "small black grumpy onion face",
    "TINY_CHAR_4": "white spark burst above the pan",
    "SPRAY_SHAPE": "irregular red spray cloud",
    "SYMBOL_1": "scribbled star",
    "SYMBOL_2": "black exclamation mark"
  },

  "final_prompt": "A candid vertical 9:16 photograph of a young woman cooking in a warm home kitchen, tossing vegetables in a pan over the stove, steam rising, warm tungsten light, subtle film grain, shallow depth of field. Heavily overlaid with bold hand-drawn graffiti doodles in red, cobalt blue, yellow, green and black, flat marker colors with rough confident black ink outlines, no gradients. In the top-left: a wildstyle graffiti tag reading 'HOT!' in thick black marker with sharp arrows and small drips, sitting on an irregular red spray-paint cloud. A huge bright yellow cartoon flame octopus with big googly eyes and wavy tentacles curls around and above the pan, with white action lines radiating outward and a white halo ring around the woman's head. A red cartoon smiling face squeezes out of a ketchup bottle on the counter with red droplets. Scattered tiny doodles: a green vegetable stick-figure jumping off the cutting board, a tiny blue water-drop character near the sink, a small black grumpy onion face with teeth, a white spark burst above the pan. A bold black flame symbol in the top-right corner. Elements bleed to the edges, no frame, zine street-art aesthetic, playful chaotic high-energy cooking vibe. The woman's face remains fully visible."
}
```

![现实+涂鸦](https://pbs.twimg.com/media/HGhEc4DWMAAdZqS?format=jpg&name=large)


```json
{
  "style_name": "Neon Kinetic Typographic Poster",
  "style_summary": "A dramatic outdoor editorial poster style combining low-angle lifestyle photography, oversized warped neon typography, film grain, and high-energy youth-culture campaign design.",
  "environment_variables": {
    "SUBJECT": "main human figure or object",
    "SUBJECT_ACTION": "dynamic action performed by the subject",
    "PRODUCT_OR_PROP": "object held, worn, used, or displayed by the subject",
    "LOCATION": "outdoor environment or contextual scene",
    "BACKGROUND_ELEMENTS": "sky, hills, architecture, crowd, stage lights, roads, rocks, grass, clouds, dust, or other secondary scenery",
    "MAIN_TEXT": "large repeated headline word or phrase",
    "SECONDARY_TEXT": "small repeating line of text",
    "ACCENT_SYMBOL": "small separator icon such as diamond, dot, slash, star, or warning mark",
    "PRIMARY_GRAPHIC_COLOR": "electric neon yellow",
    "PHOTO_COLOR_TONE": "warm sunlit natural tones with blue sky contrast",
    "WARDROBE_STYLE": "streetwear, outdoor fashion, sportswear, festival outfit, or editorial styling",
    "CAMERA_ANGLE": "extreme low-angle wide-angle perspective",
    "ASPECT_RATIO": "9:16 vertical poster or 16:9 horizontal banner"
  },
  "composition": {
    "layout_type": "poster-like photographic composition with typographic border system",
    "subject_position": "subject placed in the lower center or slightly off-center, shot from below so the body extends upward into the frame",
    "typography_position": "massive headline typography placed around the edges and behind the subject, cropped by the canvas boundaries",
    "text_scale": "headline letters should be extremely large, often too large to fully fit within the image",
    "text_behavior": "letters may stretch, shear, warp, curve, compress, or bend around the composition",
    "depth_layering": "photographic subject appears in front of some typography while other text sits behind or around the subject",
    "negative_space": "open sky or clean background areas should help the neon typography remain readable",
    "cropping": "aggressive cropping of letters, limbs, props, and background edges is encouraged",
    "motion_feel": "composition should feel unstable, kinetic, loud, and in motion"
  },
  "typography": {
    "headline_font_style": "ultra-bold condensed display type, custom warped lettering, sharp cuts, italic slant, stretched vertical forms",
    "secondary_font_style": "thin uppercase sans-serif, geometric, spaced, minimal, repeated horizontally",
    "headline_treatment": "neon solid fill, no outline, very high contrast against sky or landscape",
    "secondary_text_treatment": "small repeating uppercase text line separated by accent symbols",
    "letterform_character": "angular, athletic, distorted, aggressive, poster-scale",
    "readability_rule": "headline may be partially cropped but must remain visually recognizable as graphic language"
  },
  "color_palette": {
    "primary_graphic": "#F1FF00",
    "secondary_graphic": "#EFFF00",
    "sky_blue": "#4BB6E8",
    "sunlit_skin_or_fabric": "#D98B52",
    "earth_green": "#4F7F32",
    "deep_shadow": "#111111",
    "highlight_white": "#F6F1DA"
  },
  "photographic_direction": {
    "camera": "wide-angle lens, close to the ground, tilted upward",
    "lighting": "hard natural sunlight, warm highlights, deep shadows, outdoor exposure",
    "texture": "visible film grain, slight print noise, mild dust, analog editorial finish",
    "lens_effect": "subtle distortion from wide lens, exaggerated limbs or props near camera",
    "mood": "raw, confident, youthful, energetic, sun-drenched"
  },
  "graphic_elements": {
    "primary_type": "huge neon headline words",
    "secondary_type_band": "small repeating uppercase phrase running horizontally",
    "separator_symbols": "small neon accent symbols between repeated words",
    "edge_usage": "letters and symbols should extend beyond the canvas edges",
    "overlay_rule": "graphics can partially cover background, but should not hide the key face, action, or product unless intentionally editorial"
  },
}
```

![视觉海报](https://pbs.twimg.com/media/HHdpfwQaYAAaDWX?format=jpg&name=large)


```
生成一张超高分辨率、印刷级别、具有收藏价值的主题海报。用户会在结尾输入一个主题词，它可以是城市、地点、人物、品牌、节日、文化概念、物件、情绪、建筑、自然元素或任意名词。请围绕这个主题词建立完整视觉系统。

画面以巨型从主题词抽取出来的视觉元素为核心。

背景设置一条横向剪影式装饰带，可根据主题自然生成相应元素：轮廓、图形、线条、符号、交通、建筑、植物、器物、抽象结构、程序化几何或其他相关视觉片段。它不是孤立装饰，而应与主体在色彩、节奏、密度和气质上完全统一，共同构成完整的版式张力。

整体风格兼具高端编辑设计、中世纪现代、瑞士平面设计与扁平几何插画的气质。构图克制，留白讲究，线条准确，边缘利落，画面安静但具有吸引力。色彩逻辑必须建立在“明亮、柔和、低饱和”的基础上，整体气质清透、轻盈、优雅、精致，避免沉闷、厚重、灰暗或脏浊。以奶白、雾粉、浅蓝、薄荷绿、砂岩、浅灰这一类色相为基础组织画面，也可以延展出柔和杏色、鼠尾草绿、粉蜡橙、淡芥末、灰玫瑰、浅雾紫等相近体系，但所有颜色都应保持低饱和、高级、通透、有空气感。

配色不要走单色压暗路线，也不要落入自然主义的蓝天白云默认方案。应采用一种更聪明的综合色彩编排：以浅亮底色为画面基底，以温柔而克制的综合色组建层次，再以少量更明确的强调色作为视觉锚点。强调色可以略微跳出，但仍需保持审美约束，像一枚点醒画面的按钮，而不是喧宾夺主。整体色彩关系应具有电影感与设计感，明亮但不刺眼，柔和但不寡淡，低饱和但不无聊，丰富但不杂乱，轻盈却不发飘，复古却不陈旧。

暗部必须被严格控制，只作为局部结构、轮廓、节奏或视觉支点使用，不能大面积压低画面情绪。阴影应偏轻、偏薄、偏干净，不制造沉重戏剧感。整幅作品应更接近一种经过精密校准的明亮世界：温柔、清醒、聪明、讲究，并具有让人想收藏的视觉愉悦。

整体效果应达到博物馆级、收藏级海报水准，既有识别度，也有大师级的色彩判断与形式完成度。除非明确要求，海报中不要出现任何文字信息。

若无额外要求，默认画幅比例为 1:1。

主题词：
```

| ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月13日_16_02_34.png) | ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月13日_16_02_00.png) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |


```JSON
{
  "style_name": "Soft Analog Future Editorial Poster",
  "folder_name": "soft-analog-future-editorial-poster-style",
  "style_summary": "A quiet analog-future editorial poster style using warm cream paper, oversized black neo-grotesk typography, strict grid rules, retro technology still life, pale-blue translucent interface panels, botanical foreground accents, and tiny bilingual information design.",
  "overall_style_category": [
    "soft editorial technology poster",
    "analog-future campaign art",
    "Swiss-inspired magazine cover",
    "speculative institutional advertisement"
  ],
  "environment_variables": {
    "SUBJECT": "main person, field, discipline, audience, or symbolic focus",
    "SUBJECT_ACTION": "what the system helps the subject do or understand",
    "PRODUCT_OR_PROP": "retro-future device, workstation, instrument, archive object, display, console, or product-like prop",
    "LOCATION": "studio, archive desk, greenhouse lab, civic model room, classroom, clinic, observatory, or quiet workspace",
    "BACKGROUND_ELEMENTS": "paper texture, thin rules, metadata blocks, issue date, numbered list, botanical details, translucent UI panel, dotted halftone, small crosshair marks",
    "MAIN_TEXT": "large poster headline",
    "SECONDARY_TEXT": "small bilingual caption, numbered benefit list, issue/date label, or editorial microcopy",
    "ACCENT_SYMBOL": "thin line, plus sign, bracketed number, crosshair star, dotted square, or small separator",
    "WARDROBE_STYLE": "if people appear: quiet utilitarian studio clothing, lab coat, soft workwear, or minimal neutral layers",
    "ASPECT_RATIO": "9:16 or 16:9"
  },
  "composition": {
    "grid": "strict editorial grid with generous margins, top rule, corner metadata, lower information band, and large negative space",
    "headline": "oversized black neo-grotesk headline, usually left or upper-left, stacked in short lines",
    "hero_object": "single tactile retro-future technology object staged in the lower-right or lower half",
    "interface": "pale-blue translucent panel floating over or near the hero object",
    "botanical_layer": "delicate blue and green foreground flowers or stems crossing the device edge",
    "microcopy": "small bilingual labels, issue/date blocks, bracketed numbered lists, and compact captions"
  },
  "typography": {
    "headline": "heavy black neo-grotesk sans-serif, tight and modern, very large relative to the page",
    "supporting_text": "small editorial sans-serif, sparse, carefully aligned, often bilingual",
    "graphic_text": "numbered list labels, date blocks, issue marks, plus signs, and section captions",
    "avoid": "handwriting, decorative display fonts, script, dense paragraphs, logo-like marks"
  },
  "color_palette": {
    "paper_base": ["#f3ecdd", "#efe5d4", "#e7ddcb"],
    "main_ink": ["#050505", "#1c1b18", "#34312c"],
    "device_material": ["#d8d0bf", "#c7beac", "#9d978c"],
    "interface_blue": ["#2f71c7", "#78aee8", "#cfe1f4"],
    "botanical": ["#1e64b7", "#3656a9", "#7b86bf", "#6e7f3b", "#c3ae69"],
    "rules_and_microcopy": ["#6d675f", "#827b72", "#b9b0a3"]
  },
  "image_treatment": {
    "medium": "poster-like editorial still life with realistic product depth and illustrated/painted botanical overlay",
    "texture": "warm paper grain, subtle scan noise, matte plastic, soft shadows, lightly aged print finish",
    "lighting": "soft diffused daylight with quiet screen glow",
    "mood": "calm, literate, humane, optimistic, precise, contemplative"
  },
  "graphic_elements": [
    "thin horizontal rules",
    "corner issue/date metadata",
    "tiny bilingual captions",
    "bracketed numbered lists",
    "small plus signs",
    "crosshair stars",
    "dotted halftone blocks",
    "translucent blue UI panel",
    "delicate botanical foreground"
  ],
  "do": [
    "Use a strict editorial grid and large quiet margins.",
    "Anchor the image with one huge black sans-serif headline.",
    "Stage one retro-future device or workstation as a tactile object.",
    "Add pale-blue translucent UI details sparingly.",
    "Use botanical forms to soften the technological subject.",
    "Keep microcopy precise, tiny, and aligned.",
    "Use warm paper grain and gentle shadows."
  ]
}
```

![海报](https://pbs.twimg.com/media/HHEfB1zbEAAzYR7?format=jpg&name=large)


```
以知名建筑【建筑名称】为场景，制作一个高端的极简主义的海报 海报中心是建筑的插画形式的表达，背景是一个单词，以巨大加粗的设计风格描述的英文字体，需要与建筑相匹配，周边是一些小字，用于描述建筑的设计哲学 整体以一种极其高端的艺术海报形式呈现 用色搭配克制不张扬，与建筑有一些搭配组合，例如恰好构成了建筑的一些构件或作为建筑的整体向外的一部分延展
```

![海报](https://pbs.twimg.com/media/HHoWAl1aQAAQ5tG?format=jpg&name=large)


```JSON
{
  "style_name": "Plush City Festival Mobile Poster",
  "style_summary": "A bright mobile event poster style combining real city landmarks, soft fuzzy mascot characters, rounded app-card UI framing, bold white festival typography, date/location text, and friendly tourism-campaign energy.",
  "environment_variables": {
    "EVENT_NAME": "festival, fair, public event, or seasonal campaign name",
    "CITY_OR_DISTRICT": "city, neighborhood, district, park, harbor, library, plaza, or market area",
    "PRIMARY_MASCOT": "large plush or fuzzy mascot character",
    "SECONDARY_MASCOT": "smaller companion mascot, plush animal, toy pet, or childlike character",
    "MASCOT_ACTION": "running, waving, floating, guiding, dancing, holding a prop, or entering the city scene",
    "LANDMARKS": "recognizable city buildings, towers, stores, plaza, street, civic architecture, or destination icons",
    "SKY_AND_WEATHER": "bright blue sky, soft clouds, sunny weather, clear atmosphere",
    "GROUND_PLANE": "crosswalk, plaza, street, park path, waterfront walkway, or open event ground",
    "DATE_RANGE": "large event dates",
    "LOCATION_TEXT": "small location label",
    "CTA_TEXT": "short mobile call to action",
    "TOP_MICRO_TEXT": "small top label or festival series text",
    "APP_UI_ELEMENTS": "back arrow, three-dot menu, bottom sheet, rounded card, handle icon",
    "COLOR_ACCENTS": "mascot colors, clean sky blue, white typography, dark gray footer, soft civic neutrals",
    "ASPECT_RATIO": "9:16 vertical mobile poster or 16:9 horizontal event banner"
  },
  "composition": {
    "layout_type": "mobile app event card poster with rounded corners",
    "main_card": "large rounded top visual card occupying most of the frame",
    "headline_position": "big centered headline in the upper sky area",
    "headline_scale": "large enough to read instantly on a phone screen",
    "mascot_position": "mascots run or float in the lower-middle foreground, overlapping the city street or plaza",
    "landmark_position": "landmarks sit behind the mascots, arranged like a cheerful city panorama",
    "date_position": "large date range placed in the lower-right visual area or along the bottom card edge",
    "location_position": "small location text placed lower-left",
    "bottom_sheet": "white rounded mobile bottom panel with handle icon and CTA text",
    "depth_layering": "sky behind headline, landmarks in middle, mascots in foreground, UI text on top"
  }
}
```

```JSON
Office Sprint Day

{
  "CASE_NAME": "Office Sprint Day",
  "EVENT_NAME": "OFFICE SPRINT DAY",
  "CITY_OR_DISTRICT": "a sunny downtown business district",
  "PRIMARY_MASCOT": "a giant fuzzy teal laptop mascot with a smiling face and soft keyboard belly",
  "SECONDARY_MASCOT": "a small yellow plush memo note carrying a coffee cup",
  "MASCOT_ACTION": "walking briskly across a plaza toward a glass office lobby while waving",
  "LANDMARKS": "modern glass office towers, coworking cafe storefront, digital clock sign, transit entrance",
  "SKY_AND_WEATHER": "bright blue morning sky with clean white clouds",
  "GROUND_PLANE": "wide office plaza with crosswalk stripes and polished stone paving",
  "DATE_RANGE": "4.29(Wed) - 5.03(Sun)",
  "LOCATION_TEXT": "Central Business Plaza, Tower Gate",
  "CTA_TEXT": "Join Workday",
  "TOP_MICRO_TEXT": "WORK CITY GUIDE"
	}
```

![海报](https://pbs.twimg.com/media/HG10fxuWcAAjCUv?format=jpg&name=large)


```
A complete single 3D illustration, exaggerated artistic editorial illustration style, not storyboard, not a collage layout. The subject is an exaggerated cartoon character with a tiny head, round chubby body, extremely elongated limbs, oversized hands and oversized shoes, off-balance center of gravity, frozen mid-air in a dramatic jumping pose, with strong tension and comedic energy. Overall form looks like a soft sculpture toy round, chunky, bouncy, exaggerated not anatomically correct. Materials are matte soft rubber, fuzzy fabric, knitted texture, plasticine feel, with fine fiber details, slight grain, hand-sculpted touch avoid glossy plastic toy look, avoid translucent glass look, avoid high reflections. High-saturation dopamine color palette, bold color clashes, large flat color blocks, bright but not over-glowing. Clean white background, minimal space, only a soft oval shadow on the ground, no complex scene. Floating abstract graphic elements around the character: stars, squiggle lines, balls, cubes, icons, symbols all rendered as soft rubber or paper props to enhance motion and design feel. Soft studio lighting, global illumination, soft shadows, low contrast, clean commercial render. C4D / Blender 3D illustration, stylized soft sculpture, matte clay material, fuzzy fabric texture, knitted surface detail, playful editorial 3D illustration, high quality.

Theme: a SaaS-hoodie product designer floating with a laptop, surrounded by dashboard UI cards, charts and task widgets, hero illustration for a SaaS landing page
```

| ![](https://pbs.twimg.com/media/HImHDMbaIAAbJ7b?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HImHDjjbAAAlvEk?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
A high-fashion surrealist advertising poster for Crocs. The scene is set in a minimalist, monochrome light blue studio with a semi-reflective floor.

The central focus is an oversized, giant white Croc clog positioned on its heel at a diagonal angle, serving as a backrest. A fashion model with long dark hair, dressed in a clean, all-white coordinated sweatshirt and wide-leg trousers, leans her entire back against the giant shoe in a relaxed, leaning posture. She is facing right in profile, looking ahead with a serene expression, and wearing standard-sized white Crocs.

In the background, the word "CROCS" is written in massive, bold, white condensed sans-serif typography, partially occluded by the giant shoe and the model to create a sense of depth. At the top right, "Designed with ChatGPT"

At the bottom center, a white sans-serif tagline reads: "Made for comfort, worn for confidence. Because life feels better when your feet stop complaining." The lighting is soft, cool, and even, casting gentle shadows and a soft reflection of the subjects on the glossy blue floor. The overall aesthetic is clean, modern, and high-concept.

Make the aspect ratio 3:4
```

![](https://pbs.twimg.com/media/HGu_Pw-WYAA9J46?format=jpg&name=large)


```
Avant-garde sports fashion advertisement, oversized tennis racket positioned like monumental sculpture, female athlete seated casually on the strings as if a suspended lounge, giant word “PRECISION” in bold typography behind, crisp white studio backdrop, reflective court-like floor, luxury sportswear editorial aesthetic, cinematic lighting, ultra-clean composition, 1:1
```

![](https://pbs.twimg.com/media/HGvrV0HagAA0Co4?format=jpg&name=large)


```
动态的豪华商业广告海报，特色是超现实3D渲染的充满活力的年轻女性，以上传的女性面部作为参考，穿着高级亮橙色设计师服装、豪华配饰以及时尚的金色墨镜，自信地从一个巨大的金色智能手机屏幕中爆发出色。她的姿势有力且时尚，一只运动鞋通过强烈的强制透视戏剧性地穿过数字显示屏，踏入现实。

构图在前台强调她白色豪华运动鞋，带有纹理口香糖鞋底，通过电影般的广角镜头失真和浅景深增强。漂浮的闪亮3D社交媒体图标、金色几何元素和豪华品牌图形环绕着她，营造出高端影响者营销美学。

明亮的摄影棚灯光营造出充满活力的优质促销氛围，金属金色手机边缘的丰富反射与哑光织物质地形成对比。主导的橙色、白色和金色调色板传递出超现代豪华X / Twitter 广告氛围。干净的白色背景上带有大胆的编辑排版、优质软件品牌元素、优雅的UI图形、漂浮的互动图标以及时尚的二维码区域。

超现实8K品质、电影般的阴影、精致的商业艺术指导、豪华女性能量、时尚营销美学、现代社交媒体品牌、闪亮反射以及高端数字广告风格。

宽高比：3:4。
```

| ![](https://pbs.twimg.com/media/HHxiwtoaEAA6iRI?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHo6IPSbMAEtZLY?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Vintage French New Wave movie poster, inspired by 1960s Jean-Luc Godard cinema, monochrome portrait of a rebellious woman holding a cigarette, messy bangs, confident expression, torn paper collage layout, distressed paper texture, retro typography, bold red blue and black color blocks, old newspaper clippings, cinematic Paris street photography, grainy black-and-white aesthetic, film strip elements, romantic noir atmosphere, high contrast lighting, handmade poster design, worn edges, analog film texture, artistic European arthouse vibe, layered mixed-media composition, 1960s magazine print style, dramatic and stylish composition, ultra detailed, vintage print imperfections.
```

| ![](https://pbs.twimg.com/media/HHxMZjJa4AAbtCj?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHxMZjJbsAEvitM?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
根据{少妇白洁}自动生成一张 收藏版史诗叙事海报，

巨大优雅的{白洁}人物侧脸剪影作为外轮廓，剪影内部自动生长出最契合该主题的完整世界观、标志性场景、角色关系、象征符号、关键建筑、生物、道具与氛围。

整体不是普通拼贴，而是高级的剪影轮廓填充式叙事合成，带有双重曝光式联想，但强化为电影级叙事表达与空间调度。

电影海报风格 + 东方现实主义美学融合，强调真实物理光影、镜头语言、空间纵深与叙事层级。

光影采用电影级侧逆光与局部暖光点缀，冷暖对比克制真实，加入体积光与轻雾增强空间感。

材质表现为真实质感（建筑、丝绸、肌肤、石材），避免纯绘画笔触感，

保留柔和空气透视，但优化为电影级景深与焦点控制。

轻微胶片颗粒，边缘飞白与刷痕改为电影式柔和融合过渡，

大面积留白，版式克制高级，安静、宏大、克制、宿命感强的东方电影叙事。

所有元素必须强绑定主题，一眼识别，不要杂乱，不要硬拼贴，不要模板化背景，不要廉价奇幻素材。
```

![](https://pbs.twimg.com/media/HGtVJCKakAArjGZ?format=jpg&name=large)


```
Prompt 1:
Close-up portrait of a character exhaling vapor that transforms into geometric shapes, futuristic sunglasses, layered textures and bold styling, clean studio background, BIG TEXT: 'EXHALE THE NOISE' in distorted bold font with slightly blurred edges, small text: 'quiet mode on', add stickers like glitch lines, dots, small symbols and soft sparkles, high-gloss lighting trendy campaign vibe.

Prompt 2:
Dynamic portrait of a character blowing bubble gum that morphs into a glossy abstract shape, wearing a bold patterned jacket with expressive eyes hidden behind tinted glasses, minimal background, BIG TEXT: 'BLOW THE LIMIT' in wide serif with slightly distorted baseline, small text: 'expand slowly', add graphic overlays like circles, crosses, thin scribbles and sticker-like icons, clean but energetic composition.

Prompt 3:
Close-up fashion shot of a character biting a translucent candy cube, reflective visor glasses, layered streetwear with bold textures, playful attitude, clean studio background with floating geometric shapes around the face, BIG TEXT: 'TASTE THE SIGNAL' in bold condensed font slightly overlapping the face, small text: 'sweet / system', add stickers like sparkles, arrows, micro icons and glitch accents, sharp lighting high contrast editorial look.

Prompt 4:
3D character with spiky hair and oversized jacket, holding a drink with floating cubes around. Playful attitude, slightly tilted pose. Headline: 'SPILL THE ENERGY' (condensed bold font, slightly warped). Subtext: 'shake / don’t mix'. Add graphic stickers: splashes, circles, crosses, abstract shapes. Bright, glossy lighting, modern youth aesthetic.
```

| ![](https://pbs.twimg.com/media/HHt9xJzX0AMi51H?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HHt9xJxX0AAtWUs?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![](https://pbs.twimg.com/media/HHt9xJzWMAMhkMo?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HHt9xJxXgAYm02k?format=jpg&name=medium) |


```
这些并非单纯的视觉元素，而是以拼贴形式排列的“意义碎片”，为观者留下解读的空间。
尤为独特的是文字与图像之间的关系：文字本身成为视觉要素，与照片或主题同等存在，共同构建整体的节奏感。

此外，动物、建筑、人物等多元元素在同一画面中共存，营造出一种现实与神话交织的独特氛围，仿佛瞬间截取都市中无数故事的片段。

将此类代码引入设计，即可实现“碎片化意义并重构”的视觉表达，这正是描绘信息与时空交错之现代神话的 sref 代码。
```

![](https://pbs.twimg.com/media/HHr61bRakAA2uKK?format=jpg&name=small)


```
你不是普通海报设计师。

你是「复古地下乐队海报视觉导演 + 丝网印刷质感设计师 + 粗暴主义字体排版系统」。

你的任务是：
根据用户输入的一个主题词 / 名字 / 中文词 / 英文单词，并结合用户是否上传人物图像，生成一张具有复古朋克音乐海报气质的高冲击力视觉海报。

这张海报的核心不是“人像加文字”，而是：

「巨型文字成为空间，人物像油墨残影一样从字母或汉字之间穿出来。」

--------------------------------------------------

【用户输入】

1. 主视觉文字：
{Freddie Mercury/Queen}

2. 人物参考图：
{可选}

3. 如果用户输入的是名人姓名：
若系统具备联网检索能力，请先检索该人物的公开形象特征，包括：
标志性发型、脸型轮廓、常见姿态、代表性服装、时代气质、职业身份、代表作品或公众印象。
不要直接复制某一张具体照片，而是提炼其公开形象符号，生成一张概念化复古海报。

4. 小字注释：
系统根据主题自动生成 2–4 组短小文字，中英文搭配。
若主视觉为中文，可搭配少量英文小字；若主视觉为英文，可搭配少量中文注释。

--------------------------------------------------

【画面风格】

生成一张 1:1 方形复古音乐海报，整体像 80s–90s 地下乐队巡演海报、朋克杂志封面、独立唱片封套、复印店传单、丝网印刷海报。

画面必须具有：
- 粗糙油墨感
- 双色 / 三色印刷感
- 高对比剪影
- 半调网点颗粒
- 纸张纤维纹理
- 轻微套印错位
- 复印机噪点
- 海报折痕与旧纸质感
- 边缘轻微磨损

不要做成干净的现代平面设计。
不要做成光滑的商业摄影。
不要做成普通字体海报。
要有一种「印坏了反而更高级」的地下文化质感。

--------------------------------------------------

【字体规则】

主视觉文字必须是画面最大元素，占据画面 70%–85% 的空间。

如果是英文：
使用极粗、极窄、压缩感强的无衬线大写字体，类似复古巡演海报字体，字母巨大、垂直、有压迫感。

如果是中文：
使用极粗黑体 / 块面字体 / 压缩字体，字体必须像建筑一样撑满画面。

文字不是贴在背景上的标签，而是画面的主体结构。
人物必须被文字遮挡、切割、穿插。
人物可以从字母内部、字缝、负空间里出现。

主文字必须保持可读，但允许有局部遮挡、磨损、油墨断裂。

--------------------------------------------------

【人物处理】

如果用户上传人物图像：
必须保留人物的五官结构、脸型比例、发型气质与真实身份特征。
不要网红化，不要美颜重塑，不要改变年龄、性别、种族和骨相。

但人物照片不能保持普通照片质感。
必须转化为复古丝网印刷人像：

- 高对比 posterized 处理
- 双色油墨分离
- 面部阴影被压成大块色面
- 五官边缘有粗糙颗粒
- 皮肤呈现偏色，不是正常肤色
- 可使用橘粉、肉桂色、旧报纸米色、暗红、脏桃色作为人物亮部
- 阴影可使用黑色、深蓝、暗紫
- 人物整体像旧唱片封面上的印刷人像

如果用户没有上传人物：
根据主题自动生成一个符合主题气质的人物。
例如：
音乐主题可生成人物拿吉他、麦克风、贝斯、鼓槌；
思想主题可生成人物沉默站立、低头、侧脸、被文字遮挡；
运动主题可生成人物动态动作；
情绪主题可生成人物半身剪影或模糊凝视。

人物比例不要太大。
人物高度约占画面 35%–50%。
人物不要完整占据中心。
人物必须像从文字结构里冒出来，而不是站在文字前面拍照。

--------------------------------------------------

【颜色系统】

根据用户输入的主题自动选择高冲突复古配色。

必须限制在 2–3 个主色内：

推荐组合（随机选择一下组合其一作为配色方案）：
1. 黑色背景 + 电光蓝大字 + 橘粉人像 + 米白小字
2. 深棕黑背景 + 钴蓝大字 + 脏桃色人像 + 旧纸白小字
3. 墨黑背景 + 紫蓝大字 + 暗红 / 橙色人像 + 米黄色注释
4. 暗海军蓝背景 + 奶油白大字 + 猩红人像 + 黑色阴影

颜色必须像油墨印刷，而不是数码渐变。
允许轻微套印偏移，让蓝色和橘色边缘出现错位感。

--------------------------------------------------

【小字排版】

在画面右下角、左下角或边缘加入少量小字，让海报更像真实巡演海报 / 杂志封面 / 唱片封套。

小字内容由系统根据主题自动生成。
风格要短、硬、冷，不要鸡汤，不要解释过多。

例如：
- POETRY TOUR
- LIVE SESSION
- FIELD NOTES
- NO. 03
- ARCHIVE PRINT
- ONE NIGHT ONLY
- SYSTEM OF MEMORY
- HUMAN NOISE
- 2026 LIMITED EDITION

小字必须与主视觉文字形成层级差异：
主字巨大粗暴，小字克制、窄长、像票根信息。

--------------------------------------------------

【构图要求】

画面要有强烈平面冲击力。

构图逻辑：
- 背景为深色粗糙纸面
- 主文字巨大，占满画面
- 人物被嵌入文字结构中
- 文字压住人物局部
- 人物局部越过文字边缘
- 主文字、人物、小字之间形成遮挡关系
- 画面四周可有轻微圆角边框、旧贴纸边缘、磨损黑框

整体要像一张被贴在地下酒吧墙上的老海报。
不是精致广告，而是有态度、有噪音、有现场感的视觉传单。

--------------------------------------------------

【质感关键词】

retro punk gig poster,
underground music poster,
screen print texture,
risograph print,
xerox zine aesthetic,
distressed ink,
halftone dots,
posterized portrait,
two-color overprint,
misregistered ink,
brutalist typography,
huge condensed bold letters,
rough paper grain,
vintage concert flyer,
independent record cover,
raw graphic design,
high contrast duotone portrait,
grainy photocopy texture.

--------------------------------------------------

【禁止项】

不要现代商业海报。
不要干净渐变。
不要 3D 字体。
不要赛博霓虹。
不要奢侈品广告感。
不要光滑高清人像。
不要卡通插画。
不要 AI 塑料感。
不要过度装饰。
不要复杂背景。
不要让人物完全盖住大字。
不要让主文字不可读。
不要生成无意义乱码小字。
不要使用太多颜色。
不要把人物变成普通摄影写真。

--------------------------------------------------

【最终输出】

生成一张复古朋克丝网印刷风格海报。加强复古丝网印刷感。人物不要像真实照片，要处理成高对比双色油墨人像，肤色明显偏橘粉或脏桃色，阴影压成黑色和深蓝色块。主文字继续放大，占满画面，让人物从字母或汉字缝隙里穿出来，被文字遮挡和切割。增加半调网点、纸张颗粒、复印机噪点、套印错位和旧海报磨损感。

主视觉文字：
{用户输入文字}

人物：
{上传人物图像 / 系统自动生成 / 名人公开形象概念化}

画面必须呈现：
巨型字体压迫感 + 人像偏色油墨处理 + 字体遮挡穿插 + 粗糙纸张颗粒 + 复古地下巡演海报气质。

将宽高比设为 9:16
```

![](https://pbs.twimg.com/media/HG_-G_UacAAkkhy?format=jpg&name=large)


```
你要生成的不是普通插画，也不是简单把一个单词放大后贴在画面上的字效海报，而是一张“基于词语含义自动构建视觉隐喻”的高级概念海报。

你的核心任务是：
用户会提供一个字、一个词、一个词组、一个短句，或一组字母。你需要先真正理解这个文字内容的表层含义、情绪气质、隐含象征、文化联想、心理感受与语义张力，再把这些理解转译成一张极简、强概念、强传播力、强视觉记忆点的图形艺术海报。

这张海报必须让人一眼就感受到这个词语“为什么是这样被表达的”，而不是只看到漂亮画面却无法理解词义。画面要做到“文字本身就是主题，图像是对文字的深化表达，二者共同组成一个完整的视觉句子”。

一、先理解词语，再生成画面
在动手生成之前，先智能分析用户输入内容，包括但不限于：
1. 这个词语最核心的字面含义是什么。
2. 这个词语在情绪上偏向温柔、冷峻、危险、孤独、浪漫、压迫、希望、纯真、欲望、秩序、冲突、疏离、自由、沉默、毁灭、重生等哪种倾向。
3. 这个词语是否具有双关、反差、张力、隐喻、悖论、社会性、哲学性或情感深度。
4. 这个词语最适合被转译成哪一种视觉逻辑：人物关系、物体关系、动作关系、空间关系、对比关系、象征关系、冲突关系、秩序关系、荒诞关系、诗意关系等。
5. 如果这个词语较抽象，不要直接做空洞抽象图案，而要找到能够承载其含义的具体视觉载体。
6. 如果这个词语较具体，也不要只做字面插图，而要通过构图、尺度、关系、反差与氛围，让它变得更有思想和记忆点。

二、画面构图逻辑
整体画面必须极简、明确、有概念感，构图要干净而有力量，不能杂乱，不能像普通商业插画，不能堆砌太多元素。

优先采用以下构图思路：
1. 大字作为画面的核心骨架。用户输入的文字、单词或词组应成为画面中的主视觉文字主体，通常以大尺寸出现，占据画面重要区域，具有强识别性与压迫感。
2. 图像元素不是随意摆放，而是要与文字产生关系。它们可以站在字前、嵌入字中、与字形成互动、切割字形、借字的空间形成叙事，或在视觉上与字构成强烈对照。
3. 整体元素数量要克制。通常控制在少量关键主体之内。宁可少而准，也不要多而散。
4. 画面要有明确主次关系：文字是第一视觉层，图像叙事是第二视觉层，细小说明文字是第三视觉层。
5. 留白要聪明，不是空，而是让画面更有呼吸感、更有判断力、更有设计感。
6. 构图应尽量稳定、简洁、好读，并具备“海报感”，而不是像一张普通插画截图。

三、图像表达逻辑
根据词语的意义，自动选择最有代表性的视觉表达方式。图像表达应遵循以下原则：
1. 优先选择能够浓缩词义的单一强画面，而不是平铺直叙。
2. 可以通过人物之间的关系、人物与物体的关系、尺度反差、方向关系、距离关系、遮挡关系、动作瞬间等方式表达词义。
3. 画面应具有隐喻性，但不能晦涩到完全无法理解。
4. 表达要巧妙，要有“看到后会心一击”的感觉，让观众觉得画面和这个词是高度绑定的。
5. 不要仅仅追求美感，更要追求“准确地说出了这个词的感觉”。
6. 如果词义具有冲突性、悖论性或反差感，可以通过画面中的对立元素强化这种张力。
7. 如果词义更偏诗意、情感、记忆、哲思，可以使用更含蓄、更留白、更克制的图像策略。

四、视觉风格要求
整体风格为高级图形艺术海报，具有拼贴感、丝网印刷感、石版印刷感或版画式质感，但不要做得过脏过乱。要保留一种清晰、克制、硬朗、概念化的印刷纸张气质。

风格要求：
1. 具有强烈平面设计感，而不是普通三维插画。
2. 画面应有干净统一的色彩逻辑，颜色数量不宜过多。
3. 可使用高饱和主背景色配合大面积浅色文字，形成强对比。
4. 质感可带有细微颗粒、纸张纹理、印刷噪点、轻微做旧感，但整体仍需清爽、利落、高级。
5. 人物或物体细节要清楚，但整体仍然服从平面海报的统一调性。
6. 不要做成廉价模板，不要出现低级拼贴感，不要做成广告页，不要做成普通电商排版。

五、文字排版逻辑
1. 用户输入的文字内容必须作为核心标题，大且醒目。
2. 如果用户输入的是英文单词或字母组合，保留原文，确保字形强烈、清晰、具有视觉冲击力。
3. 如果用户输入的是中文词语或短句，可以根据整体设计决定是否直接使用中文大字，或采用更适合的方式排布，但必须保证其是画面核心。
4. 可以在画面左下角、右下角或其他克制位置加入一句小型辅助短句，用来深化主题，但必须非常简洁且自然。
5. 还可以加入少量极小号的辅助信息、编号、署名等内容，仅在非常相关的情况下用来增强海报的艺术感，避免过多无关内容。
6. 所有文字都要像从画面中生长出来的一样，不能像后期随便贴上去。

六、成图目标
最终生成的海报必须满足以下结果：
1. 一眼看上去极简、强烈、完整、有高级感。
2. 能让人快速感受到这个词语的情绪和内涵。
3. 图与字之间存在强关联，形成一种聪明、准确、耐看的视觉表达。
4. 既有平面设计的理性控制，也有艺术表达的情绪力度。
5. 具有传播性、海报感、收藏感、展览感。
6. 不能只是“把词画出来”，而是要“把词的精神状态视觉化”。

七、执行原则
1. 不要机械重复固定模板，要根据用户输入智能变化。
2. 但整体仍需保持极简、概念化、强排版、强识别度的统一品质。
3. 构图要合理，画面要克制，表达要巧妙。
4. 不要过度解释，不要加入多余元素，不要让画面显得拥挤。
5. 任何视觉元素都必须服务于词语表达，不能为了好看而偏离主题。

请基于以上原则，生成一张围绕用户输入内容展开的高级概念海报。

用户输入内容：
核心文字 / 单词 / 词组 / 字母：
文字语言：
可选补充语境：
可选情绪倾向：
可选禁用元素：
```

![](https://pbs.twimg.com/media/HG2Hl48aMAAWIqc?format=jpg&name=large)


```
You are a premium graphic designer with a human feel. Create a bold and attractive poster for an upcoming Ghanaian food joint with the name “CHOP AND CLEAN MOUTH”, it should include aesthetic pictures of a plate of Waakye served the Ghanaian way and a plate of spicy indomie noodles. Do not include any glitter. The final product should appeal to clients and the mood should be a happy mood. Background should be plain with some texture and use Poppins and Bricolage Grotesque fonts
```

![](https://pbs.twimg.com/media/HGl-jQ4WwAAwvQY?format=jpg&name=900x900)


```
根据上传的照片，生成一张高质量的“Q版克隆贴纸日记照片”

【主体定位】模特拍摄场景，以真人模特为中心主体，呈现高分辨率社交媒体生活日记风格，画面需精致俏皮、布局均衡、视觉丰富不杂乱。

【Q版克隆设计】在主体周围添加5—8个Q版迷你克隆体，采用"大头小身+大而富有表现力的眼睛+干净利落数字画风"的可爱贴纸风格。每个克隆体必须与真人保持高度相似性——发型、服装、颜色完全一致，但需设计不同的模特拍摄相关动作和表情（如叉腰、戴帽子、跳起、背身、躺姿等），确保所有姿势各不相同且符合拍摄场景情境。

【视觉效果】每个Q版角色需渲染为带有白色轮廓、柔和阴影及轻微悬浮效果的贴纸样式，排列在主体周围及画面边缘，避免遮挡面部或躯干关键部位。

【涂鸦元素】添加轻盈手绘涂鸦（爱心、闪光、箭头、动态线条、圆圈），采用白色底色+淡粉色点缀，保持简洁剪贴簿日记风格，与整体画面融合自然。

【文字设计】加入5—8句符合拍摄氛围（可爱/活力/鼓舞人心）的简短手写风格英文短语，文字以白色为主，带微粉色高亮及小型装饰符号（如星星、波浪线），位置需与涂鸦元素协调，不遮挡主体。

【构图要求】真人主体居中，Q版贴纸与涂鸦元素呈放射状点缀周围，形成"主体突出、元素环绕"的均衡布局，整体呈现精致俏皮的高分辨率社交媒体生活日记风格，视觉丰富但无杂乱感。
```

![](https://pbs.twimg.com/media/HHnyrxZaQAAvJvH?format=jpg&name=large)


```
Prompt 1
Travel Market Aesthetic
Cozy travel lifestyle photography of a stylish girl exploring a colorful street souvenir market, candid side profile pose while browsing handmade items and magnets, soft natural daylight, warm earthy tones, casual chic outfit with textured cream pants and pastel handbag, dreamy vacation atmosphere, handwritten doodle overlays surrounding the subject, white sketch outlines around the body, tiny hearts, stars, arrows and journal-style notes, scrapbook travel diary aesthetic, cinematic candid composition, soft film grain, Pinterest travel-core vibe, highly detailed realistic textures, relaxed “little moments” energy, ultra aesthetic street photography,8k.

Prompt 2
 Sunny Vacation Mood
Minimal luxury vacation photography of a fashionable girl sitting near a stone fountain and palm trees, relaxed candid pose, black fitted top, textured cream pants, sunglasses and pastel blue handbag, warm sunny daylight, Mediterranean travel aesthetic, soft neutral color palette, handwritten doodle overlays and white sketch outlines around the subject, cute stars, hearts and tiny sparkles, clean Pinterest girl aesthetic, cinematic vacation mood, calm and confident energy, realistic editorial-style photography, dreamy summer atmosphere, soft shadows, ultra detailed, 8k.
```

| ![](https://pbs.twimg.com/media/HHybbzaaIAAQtfO?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHybbzlagAARCcX?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
修改废片：请观察照片中的元素，并为每个物件加上有意义的 手绘风注解。请填写照片中的物品（例：披萨、汽水［描写规则】•使用像白色笔画的细线手绘线条•一笔画风格、随性、略带不均匀感•沿着物件外围加上描边轮廓•用箭头或虚线做出视线引导［文字规则］•手写风格字体（日系可爱感）•句子简短、像自言自语的小碎念
•语气偏日记感、带一点情绪［注解生成规则】•饮料一>味道、温度、心情（例：清爽、微甜、刚刚好）•食物一>口感、好吃程度（例：松软、超好吃）•空间—>氛围（例：很放松、喜欢这种感觉）•整体一>一句总结（例：今天有点幸福~［装饰）•适度加入热气、闪光、爱心、星星、小表情等元素。不要过度装饰，保留空白空间
```

| ![](https://pbs.twimg.com/media/HHzBvGcagAA3aaJ?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHzBvGbbkAEVIdT?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
{
"style_name": "Neon Doodle Gallery Snapshot",
"style_slug": "neon-doodle-gallery-snapshot-style",
"style_summary": "A candid phone-photo style layered with chaotic neon digital marker doodles: hot-pink and cyan subject outlines, yellow monster spikes, rough handwritten captions, stars, paw prints, spiderweb corners, scribble bars, halos, plants, and student diary energy.",
"source_reference": {
"file": "user-provided reference image in current conversation",
"reusable_traits": [
"Real candid indoor snapshot as the base image.",
"Main subject viewed from behind or three-quarter view inside an art, campus, or social setting.",
"Hot-pink body contour with cyan offset glow around the subject silhouette.",
"Yellow-orange spikes, horns, rays, or fins radiating from the subject.",
"White and yellow rough handwritten marker text placed in open areas.",
"Chaotic doodle stickers including stars, paw prints, spiderwebs, abstract eyes, scribbles, halos, and plants."
],
"excluded_traits": [
"watermarks",
"usernames",
"platform logos",
"creator IDs",
"app marks",
"QR codes"
]
},
"environment_variables": {
"SUBJECT": "main person, group, student, artist, friend, commuter, shopper, or quiet candid figure",
"SUBJECT_ACTION": "looking at art, studying, walking, waiting, browsing, reacting, hiding, laughing, or holding a prop",
"PRODUCT_OR_PROP": "notebook, tote bag, coffee, phone, headphones, sketchbook, jacket, snack, poster, camera, book, or exhibition card",
"LOCATION": "art gallery, campus hallway, library, studio critique room, classroom, night market, cafe, bookstore, museum, or city wall",
"BACKGROUND_ELEMENTS": "real photo details such as wall art, labels, shelves, posters, tables, lamps, signage, crowds, fabric, shadows, and phone-camera grain",
"MAIN_TEXT": "large hand-drawn caption or emotional headline",
"SECONDARY_TEXT": "small handwritten notes, repeated words, short joke, date-like label, or study annotation",
"ACCENT_SYMBOL": "star, paw print, spiderweb, halo, abstract eye, plant, flower, underline, arrow, tally mark, or scribble",
"WARDROBE_STYLE": "casual student streetwear, oversized shirt, hoodie, tote bag, loose trousers, jacket, headphones, sneakers, or art-school layers",
"ASPECT_RATIO": "9:16 or 16:9"
},
"composition": {
"layout_type": "candid phone snapshot with loud digital marker overlay",
"base_photo": "realistic handheld image in a campus, gallery, studio, library, cafe, or night-city setting",
"subject_position": "single subject or small group placed center or right, with doodles expanding around the silhouette",
"doodle_anchor": "thick neon contour hugging the subject, with yellow-orange spikes, horns, rays, or fins radiating outward",
"text_position": "large handwritten words in upper or side negative space; secondary notes scattered near corners or over dark background areas",
"background_behavior": "specific real environment stays visible behind the marker layer",
"cropping": "imperfect handheld crop, slight tilt, phone-camera framing, social snapshot feeling"
},
"photographic_direction": {
"camera": "handheld phone-camera perspective, eye-level or slightly behind the subject, natural lens distortion",
"lighting": "gallery spotlights, fluorescent classroom light, library lamps, cafe light, night-market glow, or mixed indoor shadows",
"environment": "wall art, labels, shelves, posters, desks, signs, frames, books, display panels, crowds, bags, fabric, and shadows",
"finish": "phone-photo grain, mild blur, JPEG compression, imperfect exposure, real low-light texture",
"mood": "playful, distracted, funny, overstimulated, youthful, sarcastic, affectionate, and personal"
},
"illustration_rules": {
"line_quality": "thick digital marker lines, wobbly black outlines, rough brush edges, casual pressure variation",
"outline_system": "hot-pink primary silhouette outline with cyan offset line or glow",
"spikes": "yellow-orange triangular monster spikes, horns, rays, fins, or sunburst forms around the subject",
"symbols": "stars, paw prints, spiderweb corners, halos, abstract eyes, plants, flowers, hearts, tally marks, arrows, and scribble underlines",
"integration": "doodles sit visibly on top of the photo and may cover objects, but the photo base remains recognizable",
"texture": "digital marker, school notebook doodle, zine markup, rough social-story annotation"
},
```

| ![](https://pbs.twimg.com/media/HH2GtuEaYAE5iRg?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH2GwNraEAAYY14?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Ultra-stylized fashion editorial poster, cute Asian girl model posing confidently in center frame, glossy skin, soft makeup, long black hair with wispy bangs, trendy streetwear styling, vibrant graphic typography filling the background, retro pop-art magazine layout, playful stickers, stars, hearts, barcodes, speech bubbles, chrome elements, layered UI graphics, Japanese/Korean text accents, colorful commercial poster design, clean studio lighting, high contrast flash photography, nostalgic 2000s teen magazine vibe, editorial fashion photography mixed with graphic design, ultra detailed, sharp focus, premium print aesthetic, trendy K-fashion campaign style, 8k.
```

| ![](https://pbs.twimg.com/media/HHtHUFOaUAAYzWz?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHtHUGZbgAAPlb6?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Create a bold Y2K Japanese street-editorial collage poster with a clean high-fashion magazine aesthetic, gritty paper textures, torn magazine cutouts, distressed ink splashes, and urban Tokyo-inspired design.

Main composition: one large cinematic close-up portrait at the top with intense eye focus, natural skin texture, glossy lips, messy tied-up hair, no glasses, soft dramatic lighting, confident innocent expression, ultra-realistic fashion photography style.

Bottom composition: only 2 smaller portrait collage frames showing different facial expressions and angles, styled like ripped polaroids taped onto the poster.

Design elements: oversized bold Japanese typography, minimal English text, subtle Japanese street signs, barcode stickers, newspaper scraps, vintage grunge textures, paint strokes, film grain, tape pieces, layered paper collage effects, and premium editorial magazine layout aesthetics.

Style: edgy yet clean, modern Japanese fashion zine, cinematic shadows, sharp eye detail, RAW DSLR realism, editorial streetwear moodboard, premium graphic design, ultra detailed, 8K, balanced neutral tones, no pink aesthetic, no bubbles, no cartoon vibe.
```

| ![](https://pbs.twimg.com/media/HHsppP-WwAQMDvr?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHsppS6XQAYDSKK?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
{

  "style_name": "k-pop-apocalypse-ransom-zine-style",

  "style_summary": "A maximalist K-pop fashion zine collage style built from a central portrait cutout, crumpled monochrome paper texture, skewed ransom-note typography, loud sticker blocks, saturated lime/blue/red accents, and a bold bottom masthead band.",

  "environment_variables": {

    "SUBJECT": "main subject, performer, model, musician, dancer, stylist, or youth-culture character",

    "SUBJECT_ACTION": "looking off-frame, posing with attitude, holding a prop, leaning into the camera, or standing in a cutout portrait pose",

    "PRODUCT_OR_PROP": "compact camera, wired earbuds, lip gloss, denim jacket, cassette, charm bag, safety pin accessory, or styling prop",

    "LOCATION": "studio wall, backstage corner, bedroom mirror, subway entrance, alley poster wall, roof landing, or DIY magazine set",

    "BACKGROUND_ELEMENTS": "crumpled black paper, distressed denim texture, torn white paper edges, photocopy grain, halftone noise, tape marks, and rough scanned shadows",

    "MAIN_TEXT": "oversized warped headline or sticker headline",

    "SECONDARY_TEXT": "short editorial caption, mock issue line, styling note, lyric-like fragment, or repeated microcopy",

    "ACCENT_SYMBOL": "red star, diagonal sticker block, torn label, arrow tab, barcode stripe, or paper shard",

    "WARDROBE_STYLE": "post-apocalyptic K-pop styling, distressed denim, glossy makeup, messy hair, bright accessory accents, layered streetwear",

    "ASPECT_RATIO": "9:16 or 16:9"

  },

  "core_visual_identity": {

    "overall_style_category": [

      "K-pop fashion zine poster",

      "Y2K pop-punk collage",

      "apocalypse editorial cover",

      "ransom-note typographic magazine layout",

      "DIY street fashion flyer"

    ],

    "composition": "The subject is a large central cutout with a thick torn-paper white border. Oversized typography sits around and behind the subject, often rotated, clipped, or partially hidden. Small editorial captions fill the side margins. A saturated bottom masthead strip anchors the frame.",

    "subject_placement": "Place the subject in the lower center or center-right. Crop tightly around the head and upper torso. Let hair, shoulders, and cutout paper edges break into surrounding text blocks.",

    "camera_or_perspective": "Close portrait framing, slightly low or straight-on camera, fashion editorial gaze, off-frame glance, casual imperfect hair movement, and flash-lit skin texture.",

    "typography": "Use heavy warped sans-serif, sticker-style block letters, slanted labels, mixed scale words, and mock ransom-note layering. Main type should feel pasted, tilted, and loud rather than typeset cleanly.",

    "palette": {

      "crumpled_black": "#171717",

      "charcoal_gray": "#3A3A3A",

      "paper_white": "#F5F3EE",

      "acid_lime": "#A8F04A",

      "electric_blue": "#1713F2",

      "alert_red": "#F2053A",

      "ink_black": "#050505",

      "skin_warmth": "#F2B69B"

    },

    "graphic_elements": [

      "torn white portrait backing",

      "diagonal lime banner",

      "blue sticker tabs",

      "red star stamped across one eye or near the face",

      "black-and-white Pop-style word blocks",

      "small side editorial captions",

      "bottom masthead strip with thumbnail inset",

      "photocopy grain and paper wrinkles"

    ],

    "texture_and_finish": "The finish should look physically assembled and scanned: crumpled paper, Xerox noise, halftone speckles, uneven edges, slight print offset, rough shadows, and imperfect layer alignment.",

    "lighting": "Use hard magazine flash on the subject with glossy highlights on lips, cheeks, and accessories. Keep the background flatter, darker, and more tactile.",

    "mood": "Chaotic, playful, rebellious, fashion-forward, post-apocalyptic, pop-punk, sarcastic, youthful, and editorial."

  }

}
```

| ![](https://pbs.twimg.com/media/HHuh9BKbYAA2hnG?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHyAAkoasAATsHN?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
[product setup], minimalist product photo, clean warm studio scene, textured beige wall background, soft directional sunlight creating long shadows, simple tabletop surface, product arranged in a playful concept composition, hand drawn white line doodle overlay of [character] interacting with the product, mixed media look combining real photography and sketch illustration, high end branding feel, shallow depth of field, ultra realistic, no extra text, no watermark, 8k, 1:1
```
![](https://pbs.twimg.com/media/HH46LQ-aMAA9l64?format=jpg&name=medium)


```
Replace [OBJECT]:

 “Create a technical infographic of [OBJECT] with a 45-degree isometric 3D perspective showing the device slightly tilted to reveal depth and dimension. Combine a realistic photoreal render with black ink technical annotations on pure white background. Include: Key component labels with color-coded callout boxes Internal component visibility through transparent/cutaway sections Measurements, dimensions, and precise scale markers Material callouts and quantities Color-coded arrows for function/flow: RED (power/battery), BLUE (data/connectivity), ORANGE (thermal/processor), GREEN (sensors/haptics) Simple schematics or cross-sectional diagrams where relevant Place “OBJECT” title in a hand-drawn technical box (top-left corner). Style: Black linework (technical pen/architectural), sketched but precise. Object remains clearly visible. Educational museum-exhibit vibe. Clean composition, balanced negative space. Perspective: Isometric 3D angle—tilted to show depth, dimension, and internal architecture dramatically. Like a professional product teardown or engineering manual. Colors: ~10-15% accent density. Black dominant. White background. Output: 1080×1080, ultra-crisp, social-feed optimized.”
```

![手绘分解图](https://pbs.twimg.com/media/HHeNblVWIAAUS54?format=jpg&name=medium)


```
请根据用户最后输入的任何推荐对象，生成一张高质感推荐卡片或海报。对象可以是 App、软件、网站、GitHub 项目、一本书、一篇文章、一句话、一段文案、一道人物观点、一套菜、一份食谱、一个品牌、一个工具、一个方法，或任何值得介绍给别人的东西。

你要做的不是把用户给的信息简单排版，而是先理解它为什么值得被看见。若它属于现实存在的对象，请主动联网调查它的背景、来源、真实特点、核心价值、口碑、适用人群与边界；若它是用户提供的原创内容、观点或文案，请进行理解、提炼、重组与升华，让它变得更有营养、更有判断力、更适合被传播。

整体以苹果式克制、顶级海报设计判断力、高桥流凝练表达完成。不要罗列资料，不要写成说明书，不要堆满小字。重点是把复杂信息转化为一个清晰、有力、耐看的推荐理由，让普通人在手机上 3 秒内看懂：这是什么，为什么值得关注，适合谁，它真正打动人的地方在哪里。

画面必须优先保证手机端可读性。信息要少而准，文字要大而清楚，层级要干净，留白要有呼吸感。最终内容应自然收束为一个强主标题、一句点明价值的副标题、少量核心看点，以及若隐若现的证据、场景、评价或情绪余韵。不要把结构写死，也不要套模板。版式、图形、颜色、节奏、文字出现方式，都应从推荐对象本身的气质中自然生长。

如果对象有图标、封面、截图、菜品形态、项目视觉、品牌色或文本气质，请提取它的视觉 DNA 并延展成统一画面。若用户提供推荐语或评价，请吸收其中真实的判断与语气，不要生硬引用，而要让它成为画面里可信、温暖、有分量的一部分。

最终生成的卡片应高级、清晰、抓人、可信，有一种被认真筛选、认真理解、认真推荐过的感觉。它不是信息搬运，而是一次有审美、有判断、有升华的内容再创作。
```

![自媒体封面](https://pbs.twimg.com/media/HHh5CKEbkAEok1R?format=jpg&name=large)
![自媒体封面](https://pbs.twimg.com/media/HHh3I5ebwAA1yHc?format=jpg&name=medium)


```*
请根据用户最后输入的任何推荐对象，生成一张高质感推荐卡片或海报。对象可以是 App、软件、网站、GitHub 项目、一本书、一篇文章、一句话、一段文案、一道人物观点、一套菜、一份食谱、一个品牌、一个工具、一个方法，或任何值得介绍给别人的东西。

你要做的不是把用户给的信息简单排版，而是先理解它为什么值得被看见。若它属于现实存在的对象，请主动联网调查它的背景、来源、真实特点、核心价值、口碑、适用人群与边界；若它是用户提供的原创内容、观点或文案，请进行理解、提炼、重组与升华，让它变得更有营养、更有判断力、更适合被传播。

整体以苹果式克制、顶级海报设计判断力、高桥流凝练表达完成。不要罗列资料，不要写成说明书，不要堆满小字。重点是把复杂信息转化为一个清晰、有力、耐看的推荐理由，让普通人在手机上 3 秒内看懂：这是什么，为什么值得关注，适合谁，它真正打动人的地方在哪里。

画面必须优先保证手机端可读性。信息要少而准，文字要大而清楚，层级要干净，留白要有呼吸感。最终内容应自然收束为一个强主标题、一句点明价值的副标题、少量核心看点，以及若隐若现的证据、场景、评价或情绪余韵。不要把结构写死，也不要套模板。版式、图形、颜色、节奏、文字出现方式，都应从推荐对象本身的气质中自然生长。

如果对象有图标、封面、截图、菜品形态、项目视觉、品牌色或文本气质，请提取它的视觉 DNA 并延展成统一画面。若用户提供推荐语或评价，请吸收其中真实的判断与语气，不要生硬引用，而要让它成为画面里可信、温暖、有分量的一部分。

最终生成的卡片应高级、清晰、抓人、可信，有一种被认真筛选、认真理解、认真推荐过的感觉。它不是信息搬运，而是一次有审美、有判断、有升华的内容再创作。

——————
你要推荐：
推荐理由：
补充说明：
...
注意，这些要求信息，你不一定要按照我的框架，你自由编排即可。
```

| ![自媒体封面](https://pbs.twimg.com/media/HHg4XlcbIAAmtcc?format=jpg&name=900x900) | ![自媒体封面](https://pbs.twimg.com/media/HHg1W70aoAA4un4?format=jpg&name=900x900) |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |

##### 教程步骤图

```
本任务是：生成一张“如何做（How-to）信息图设计稿”。

⚠️ 严格要求：
输出必须是一张“信息图成品的设计描述”，而不是解释、分析或教学文字。
禁止出现讲解、说明、废话。所有内容必须服务于“画出这张图”。

你是顶级信息设计师（苹果设计体系 + 高桥流 + 顶级海报大师），
你的产出不是内容，而是——可被直接视觉化的版面。

——

在生成前，先在内部完成（不要输出）：
- 校验信息正确性（采用更优、更稳定做法）
- 将复杂内容压缩为普通人可直接执行的形式

——

【尺寸与版面原则】

- 尺寸不设限制（高度 / 宽度可自由决定）
- 优先选择“最利于阅读与理解”的版式，而非固定比例
- 允许纵向、横向或非标准结构
- 所有布局决策必须服务于：信息清晰、路径顺畅、一眼可读
- 若用户未指定尺寸，你必须主动选择最优阅读方案

——

输出必须满足以下结构（不可偏离）：

【画面标题区】
- 一句极简标题（强视觉中心）
- 一句辅助信息（可选，解释核心变量）

【主视觉流程区（画面核心）】
用“视觉路径”表达过程，而不是列步骤：
- 信息按阅读路径自然流动（从左到右 / 上到下 / 或最优路径）
- 每个节点只包含：
  - 动作（极简短语）
  - 关键条件（必须具体）
  - 可感知结果（状态/变化）

⚠️ 禁止使用：步骤1/2/3

【分化 / 结果区】
- 展示不同结果的对比（如状态差异、程度变化）
- 每个结果必须：
  - 有清晰标签
  - 有可识别特征（颜色 / 状态 / 质感等）
  - 一眼能判断差别

【关键判断信号（嵌入画面）】
- 用“可感知信号”替代抽象标准（如颜色变化、触感、声音等）
- 不解释，只呈现

【视觉层级说明（用于设计）】
- 说明视觉中心位置
- 信息流动路径
- 主次信息关系（谁先被看到，谁后出现）

——

风格要求：

- 极简，但信息密度高
- 无废话，每一行都用于“完成任务”
- 阅读路径符合人类直觉（不需要思考顺序）
- 重点信息自动成为视觉焦点
- 整体必须像“可以直接做成海报”的稿子

——

最终标准：

这不是“读的内容”，
而是——
“可以直接画出来的图”。

——

现在输入你的主题：

如何说话滴水不漏
```

![教程图](https://pbs.twimg.com/media/HHUSvJlbYAABbaW?format=jpg&name=large)

##### 纪念碑谷风格

· 素雅版本

```*
请根据用户最后输入的【主题 / 单词 / 短句】，生成一张「纪念碑谷气质」的极简超现实主义 3D 艺术海报。

核心方式：
先理解输入内容的含义、情绪与意象，再将其转译为一组具有建筑感的几何空间，而不是机械地把中文笔画直接做成立体字。若输入为中文，可提炼其核心语义，将关键词、氛围或象征元素巧妙融入主体造型、空间结构与排版中。

画面主体：
以主题语义生成纪念碑谷式的立体几何场景，形成平台、墙体、门洞、通道、桥梁、台阶、迷宫或悬浮结构。整体采用轻俯视等距视角 isometric / axonometric，画面像高级设计海报、建筑概念模型或艺术杂志封面。

色彩与质感：
整体保持高级、明亮、干净、适合印刷输出。主色以奶白、浅灰、砂岩、浅雾粉、淡蓝、薄荷绿、浅杏、柔和暖灰等低饱和浅色为主，减少大面积暗部。仅根据主题语义加入少量点亮色，精准用于局部边缘、内部空间、切面、门洞深处或微小装饰细节。材质为哑光微水泥、石膏、磨砂树脂或高级纸雕质感，光线柔和通透，层次清晰。

构图与层次：
主体仍为视觉中心，但四周需加入少量与主体同语义、同造型逻辑的呼应装饰，形成完整海报感，避免周围过空。装饰必须克制、简洁，并自然形成前景 / 中景 / 后景或主体 / 辅助 / 微装饰的层次关系，让画面更生动但不杂乱。可加入少量重复几何、悬浮小体块、细线结构、局部符号、边角呼应元素或微型景观。

氛围元素：
加入一到两个极简意境元素即可，例如微光、淡月、细枝、小鸟剪影、轻雾、花瓣、远处小体块或象征性图形，使画面更有诗意，但不要堆砌。

人物尺度：
可加入一到两个极小比例人物，作为情绪锚点，人物不超过画面高度 8%，动作安静自然，如站立、行走、眺望、穿行，不喧宾夺主。

排版要求：
可加入极少量设计感文字，如小标题、编号、年份、vol.01、竖排辅助文字或一句简短英文手写句。排版需服务画面，不可过多。

最终要求：
整体简洁、高级、轻盈、富有巧妙层次，兼具纪念碑谷式空间感、语义转译能力、海报设计感与印刷级配色控制。

用户输入主题：
太阳就站在黑夜的门口
```

· 多色版本

```*
请根据用户最后输入的【主题 / 单词 / 短句】，生成一张「纪念碑谷气质」的极简超现实主义 3D 艺术海报。

核心逻辑（关键）：
不要将中文文字强行转成立体建筑。
先理解主题语义，用“空间结构”表达情绪与隐喻；再用“中文排版”作为视觉主标题，两者协同，而不是融合变形。

空间设计：
构建纪念碑谷式几何空间（平台 / 台阶 / 门洞 / 通道 / 悬浮结构），采用等距视角。
空间必须服务主题表达，例如通过高低差、路径、遮挡、孤立、连接等关系隐喻情绪，而不是纯造型堆叠。

中文设计（重点）：
中文必须作为清晰、可读的主标题出现，并成为版面视觉核心之一。
采用“平面设计化处理”，而不是立体化：
- 可使用极简无衬线 / 细黑体 / 几何结构字形
- 可做轻微拉伸、切割、错位、留白设计
- 可与空间产生遮挡、穿插或叠加关系（而不是变成建筑）
- 保持高级、克制、可读

辅助文字：
可加入少量英文或数字信息（如 vol. / 年份 / 编号），作为版式平衡元素，但权重明显低于中文主标题。

色彩系统（优化重点）：
采用“纪念碑谷式动态配色”，但适配印刷：
- 以明亮、柔和、低饱和为基础（奶白、雾粉、浅蓝、薄荷绿、砂岩、浅灰等）
- 避免大面积深色与死黑
- 使用同色系明度变化建立空间层级（前 / 中 / 后）
- 点缀1–2处高纯度色，用于引导视觉焦点（门洞 / 边缘 / 转折处）

整体色彩需“通透、有空气感、有层次”，而不是固定配色方案。

构图与层次：
主体明确，但画面不能空：
- 在四周加入少量“同源结构的弱化延展”
- 使用重复几何、远处体块、边缘切片等方式形成构图闭环
- 建立前景 / 中景 / 后景关系，让画面有深度但不过度复杂

氛围控制：
仅允许极少量意境元素（如淡月、微光、细枝、轻雾或几何符号），点到为止，不堆砌。

人物：
可选极小比例人物（≤8%），作为尺度与情绪锚点，动作安静克制。

最终效果：
一张“空间表达主题 + 中文主导版式”的高端设计海报，具有纪念碑谷式空间语言、清晰视觉层级、克制配色与强设计感，可直接用于艺术展或设计年鉴。

用户输入主题：
千金散尽还复来

比例2:1
```

![](https://pbs.twimg.com/media/HHSSKj5awAAVO25?format=jpg&name=large)
![697](https://pbs.twimg.com/media/HHSSPfnaYAAf_MD?format=jpg&name=large)



```
城市：京都
画风：浮世绘
签名：AztecaAlpaca

**画面比例：**4:3

**提示词：**
一种合适的艺术工具（例如：画笔、调色刀、触控笔，或适合 [Painting Style] 的传统绘画工具），仿佛正处于创作之中，从左下角向右上角勾勒出一条精致、优雅的曲线。笔触之中包含著名的 [City/Country] 地标的微缩景观：精选的一组标志性地点，融合当地特有的历史与现代建筑、自然元素以及城市生活气息。整体风格结合了 [Painting Style] 与学院派海报设计：多样化的笔触与痕迹营造出三维空间感，呈现出立体的微缩景观与浅浮雕质感。[Dominant Color Tones] 为主色调，其间点缀传统的 [City/Country] 美学元素，并与现代城市天际线相互交织。画面为极简的俯视视角，主体笔触之外保留大面积留白。背景为具有纹理的纸张（高质量纤维质感），色调明亮、干净、清新（例如：纯白、明亮的天空蓝、阳光般的浅黄色，或清爽的薄荷绿），与画面主体形成清晰对比，营造纯净感。整体设计融合传统 [City/Country] 美学与现代三维艺术，具备高细节度、超写实效果、HDR，以及 8K 分辨率。

**海报文字排版要求达到大师级水准**（精致的网格系统、精确的间距控制、极其准确的字距与层级），所有字体的呈现风格需在视觉上与所选的 [Painting Style] 及绘画工具相互呼应并融为一体：

* **主标题：**“[CITY/COUNTRY]”（与绘画风格美学相匹配的艺术字体，极具吸引力，高对比度，作为核心视觉层级）
* **副标题：**“[Subtitle about the location's character]”（在风格上与主标题及绘画肌理相互呼应的高级排版）
* **装饰性文案**（全部采用与 [Painting Style] 融合的字体风格，通过分段形成节奏与层级，与主标题呼应）：

  * “[Decorative Copy 1: e.g., Name of a river or natural feature]”
  * “[Decorative Copy 2: A phrase describing the city's atmosphere]”
  * “[Decorative Copy 3: Name of a district or landmark]”
  * “[Decorative Copy 4: A concluding thought about the city]”
* **左上角小字：**[signature/brand name]（低调、匹配整体风格的字体）
* **右下角极小字：**[Signature/brand name]（低调、匹配整体风格的字体）

**构图要求：**
绘画工具的笔尖应在笔触末端（右上角）停住，笔触之外保留干净的留白；微缩景观仅存在于笔触内部，细节密集但不显杂乱
```

| ![](https://pbs.twimg.com/media/G9QWLR6bgAA_xER?format=jpg&name=4096x4096) | ![](https://pbs.twimg.com/media/G9QWLR9bYAA7Q7r?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |


```
A detective's evidence board investigating [SUBJECT/MYSTERY]. Cork surface covered with pinned items: polaroid photographs with handwritten dates, a street map with circled locations, newspaper clippings with highlighted passages, sticky notes with theories and question marks, and printed documents with redacted black bars. Red string connects related evidence across the board, creating a web of connections. Thumbtacks in primary colors. A single bare bulb casts dramatic shadows. Coffee ring stains on some papers. The atmosphere is obsessive, late-night, noir—someone has been piecing this together for months. A few pins have fallen, suggesting frantic recent activity.
```

| ![](https://pbs.twimg.com/media/G9JTkAyX0AA90JY?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/G9JT4psXkAE9osz?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |

---

#### 风格转换类

```
Design a minimalist portrait where the celebrity name ‘PERSON/CELEBRITY NAME’ merges together to form their recognizable face and hairstyle. Letters should shape facial contours, iconic features, and silhouette while maintaining elegant readability. Modern vector art, monochrome aesthetic, clean typography sculpture.
```

```
Design a clever typography logo where the brand name ‘[BRAND NAME]’ merges together to form the silhouette of a [ANIMAL/OBJECT]. Letters should naturally shape the contours of the figure while maintaining subtle readability. Minimalist vector logo, clean geometry, premium branding aesthetic.
```

```
Create a minimalist black-and-white typographic illustration of a [under armor], formed entirely from arranged words and phrases, curved and distorted lettering shaping the full silhouette, varied text scale and direction, negative space defining the structure, clean white background, editorial poster aesthetic, sharp focus, highly detailed, no extra elements, no watermark
```

| ![](https://pbs.twimg.com/media/HHxDSspbkAAOZ4i?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIH7CfZawAAchVg?format=jpg&name=medium) |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |

```
A cat-shaped collage made entirely of torn newspaper clippings, forming the silhouette and body with visible text and layered paper edges. Realistic pencil-drawn eyes, ears, and paws blend seamlessly into the mixed media texture. The background is clean and minimal, highlighting the cat's form
```

| ![](https://pbs.twimg.com/media/GrIus1HaAAcGLZz?format=jpg&name=medium) |
| ----------------------------------------------------------------------- |


```
Recreate this image in a paper craft style, simplifying the details to make them suitable for paper craft artwork. Arrange the overall composition to feel visually pleasing, soft, and cute. You may add charming decorative elements such as birds, butterflies, flowers, etc., to enhance the adorable atmosphere while still matching the original image.
```

| ![](https://pbs.twimg.com/media/HHxVCRkaMAAbE5y?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHx2GxibEAAbFOu?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
创建一张超高分辨率、适合印刷的极简主义建筑图形设计构图。

目标主题：  
[Location]

重要文本约束：  
- 所有字体必须完美对齐、高度可读且拼写正确。  
- 绝对禁止 AI 胡言乱语、损坏的字母或随机符号。

核心构图与布局：  
- 宽高比：3:4（垂直编辑布局）。  
- 全画幅构图：设计必须覆盖整个画布，从边缘到边缘。无模拟边框、无墙体阴影、无纸张边缘。  
- 中心舞台：目标主题的高度详细、平面正面立面（无透视失真）。  
- 空间锚定：建筑被鲜明描绘为根植于墙体物理结构之中，利用精致的 3D 层次纸雕和浅浮雕美学。

字体与图层：  
- 背景图层：巨型、超粗体、无衬线字体精确拼写文本“[TARGET SUBJECT]”，深深嵌入背景构图中。它占据画布的上三分之二。建筑严格与前景中的这些巨型字母重叠并互锁，营造出深刻的空间层次感。  
- 蓝图细节：用精致、极简的图形设计元素环绕中央建筑：精细的几何导线、精确的十字准线，以及微妙的建筑比例弧线。  
- 标注：沿导线战略性地放置极小、优雅的衬线文本标注，看起来像专业建筑师的概念笔记，精确阅读为：“[TARGET SUBJECT]”。

艺术风格与纹理：  
- 配色方案：纯净干净的背景，搭配低饱和度的 [2. 填入你的3色色板，如: terracotta, warm ivory, and muted gold] 配色方案，自然适应建筑纹理。  
- 风格：高端商业插图风格。  
- 纹理：3D 浅浮雕视觉纹理与干净的矢量式边缘相结合。哑光效果，无光泽反射，无噪点纹理。  
- 氛围：有意使用负空间来增强冥想式的高端氛围。柔和、平面、定向阴影，强调纸雕深度和干净的结构线条。

品质：  
8K 分辨率、博物馆级别的图形设计、杰作、超精确的建筑细节、和谐的视觉节奏。--ar 3:4
```

| ![](https://pbs.twimg.com/media/HIG59nyaoAEtq6K?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- |


```
请生成一张竖版 2:3 高清图片，主题为《建筑微缩蓝图》。

建筑名称：[填写具体建筑]

画面是一张现代建筑设计手稿，上面布满中文平面图、剖面图、立面图、结构细节图、尺寸标注和施工说明。一座高度仿真的中国古建筑微缩模型，从图纸中立体“建”出来。

主建筑要占画面 65%–75%，更大、更高、更有视觉冲击力。使用低角度 3/4 俯视视角，突出模型高度、体积感和真实阴影。建筑要符合所选主题的真实特征，并呈现正在施工中的状态，完成度约 70%–85%。

加入微缩施工细节：施工小人、脚手架、木架、坡道、滑轮、木梁、石块、瓦片、材料堆、小推车、马车、半完成台阶、屋顶施工区等。细节要围绕建筑本身展开，形成一个仿真的微缩建造世界。

整体风格是现代建筑事务所概念提案板 + 博物馆级微缩模型。图纸干净高级，颜色以米白、浅灰、淡蓝、灰黑线稿为主。所有文字必须是中文，主标题写“[建筑名称]”，副标题写“建筑营造过程示意图”。

使用柔和中性光线，画面清晰、现代、克制、有高级感。避免复古黄、羊皮纸、古董感、杂乱工作室、书本、蜡烛、卷轴、尺子、指南针、桌面摆件、现代机械、现代车辆和无关背景。

最终效果：让一座中国古建筑像从现代设计图纸里真实建造出来，兼具建筑学专业感、微缩模型趣味和强烈视觉冲击力。
```

| ![](https://pbs.twimg.com/media/HILOajRXIAAUFdr?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HILOffZWMAAj2f1?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |



```
请根据【主题】创作一张高完成度、高质感、适合系列化发布的「地景档案模型 / Landscape Archive Model」视觉图。

这不是普通地图，也不是普通风景插画或城市效果图，而是一张结合“二维地图图纸 + 三维立体区域模型 + 专业说明系统 + 博物馆展陈感”的高端档案式视觉图。画面需要像一件被真实制作出来的地理研究模型、城市规划沙盘、建筑提案模型或世界观设定展品，具有专业、克制、精密、可触摸的高级质感。

【基础设定】
主题：【主题，例如火山口湖 / 广州 / 重庆山城 / 海岛城市 / 古城遗址 / 末日废墟 / 幻想大陆 / 游戏主城】
主题类型：【自然地貌 / 城市空间 / 混合景观】
核心主体：【核心主体，例如火山口、峡谷、山脉、湖泊、CBD、老城区、地标群、岛屿城市、遗址群、主城区域】
内容重点：【内容重点，例如地形高差 / 城市地标 / 路网结构 / 水系关系 / 自然与城市关系 / 设定集展示】
风格方向：【风格方向，例如地理测绘风、纸雕模型风、建筑提案风、博物馆档案风、城市规划风、游戏设定集风】
主色调：【主色调，例如米白、浅灰、羊皮纸白、沙色、雪白】
辅助色：【辅助色，例如土褐、岩灰、冷灰、淡蓝、苔绿】
点缀色：【点缀色，例如黑色细线、红色路线、蓝色水文线、黄色编号标记】
画幅比例：【画幅比例，例如16:9横版 / 3:4竖版 / 4:5竖版 / 1:1方图】

【画面结构】
画面主体是一块放置在干净桌面或白色布面上的矩形地图模型板。底板具有真实厚度，边缘可见剖面结构，像一块精致的地图切片或模型底座。地图表面覆盖清晰但克制的信息层，包括等高线、道路网络、水文线、分区边界、地理纹理、坐标感、轻微标注和图纸边框。

在地图中央或偏中心区域，从二维地图中立体“生长”出一个三维主体模型，成为整张图的视觉核心。

如果【主题类型】为自然地貌：
主体可由山体、峡谷、火山口、湖泊、盆地、岛屿、冰川、断层、海岸线等构成，强调地形高差、层叠等高线结构、岩壁纹理和自然地貌起伏。

如果【主题类型】为城市空间：
主体可由核心城区、CBD、老城街区、地标建筑群、滨水区、路网节点、桥梁、水系、公园绿地等构成，强调建筑体块、城市识别度、空间层次与规划结构。

如果【主题类型】为混合景观：
需同时整合自然地形与人工建成环境，例如山城、海岛城市、古城遗址、末日废墟、幻想主城、科幻基地等，让自然地貌与城市结构共同构成核心视觉。

【细节要求】
- 模型表面保留地图图纸感与专业信息感
- 地形区域应有等高线、坡面层次、凹陷与起伏关系
- 建筑区域应有体块感、街区关系和清晰层次
- 水域使用低饱和淡蓝色表现
- 绿地、森林、公园、山体可用苔绿色或低饱和绿色表现
- 路网、路径、交通轴线或探索线路可用细线表现，但不要喧宾夺主
- 若有地标建筑或重点结构，应具备明确识别度
- 若有幻想、科幻或游戏设定元素，应保留档案模型和图纸展示感，而不是做成纯场景插画

【说明系统】
地图板边缘需要设计完整而克制的说明模块，包括：
- 外框线和内框线
- 比例尺
- 图例区
- 标题区
- 档案编号
- 索引标记
- 注释标签
- 简洁的符号说明
文字不必全部可读，但整体必须呈现真实、清晰、精密、有秩序的档案式排版结构。

【构图与镜头】
采用斜俯视等轴测或沙盘式构图，镜头从上方约30到45度观察整块模型板，让观众同时看到地图平面、立体主体高度、边缘厚度和说明区。视觉重心集中在中央主体模型，阅读路径为：先看核心主体，再看周边地形/路网/水系/街区信息，最后看图例、比例尺和说明区。

【材质与光影】
整体需要具有真实模型摄影质感：
- 纸张纹理
- 地图印刷质感
- 纸雕或沙盘模型感
- 建筑模型或地形切片质感
- 柔和自然光
- 细腻真实阴影
- 干净背景
- 低饱和、高级、克制
避免卡通化、廉价游戏UI感、过度杂乱、过度炫技，重点突出“地图底板 + 立体主体 + 专业说明系统”的统一视觉。

最终效果应像一张可以用于地理科普、城市研究、建筑提案、文旅视觉专题、世界观设定集或高端系列封面的地景档案模型图。
```

| ![](https://pbs.twimg.com/media/HGqoQ9dXgAAnIFY?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HGqoTxmW4AAuZ0J?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Use the uploaded photo as the sole identity reference and transform the subject into a POP MART Hirono-style designer vinyl figure, capturing the essence of a collectible toy with a soft, whimsical, and quietly melancholic mood. The subject's identity must be strictly preserved—maintain recognizable facial structure, hairstyle silhouette, outfit identity, and any accessories, without altering age, gender, or personal identity. Stylization should occur only within the Hirono designer vinyl language. The figure should reflect an official Hirono-style collectible aesthetic, with a hand-sculpted and hand-painted look that includes subtle imperfections, a matte porcelain-like vinyl texture, and soft pastel paint with gentle gradients. Avoid any gloss, shine, or realistic reflections, ensuring the result remains within toy realism rather than anime, cartoon, or photorealism. Lighting should mimic diffused studio conditions typical of POP MART product photography, with clean highlights, soft shadows, and neutral exposure.
The figure's proportions should feature an oversized head approximately 2.5 to 3 times the body size, paired with a short, childlike body, stubby arms and legs, small hands with rounded fingers, and slightly oversized shoes or socks. The posture should include a subtle forward tilt or gentle slouch to convey quiet emotion. The face should embody the signature Hirono expression, with half-closed sleepy eyes, thick painted lashes, tiny pouty lips, a minimal sculpted nose, and a soft round face enhanced by faint blush or freckles, expressing a wistful, dreamy, and melancholic mood. Hair should be sculpted into solid, rounded clumps with gentle asymmetry, painted in muted earthy tones such as brown, ash gray, faded black, or soft blond, with a matte finish and no individual strands. Clothing must reflect the original outfit from the photo but simplified into chunky, toy-like sculpted forms with a slightly oversized fit and muted pastel or neutral tones, optionally incorporating toy-style details like stitches, patches, or distressed edges while avoiding any fabric realism.
Accessories should be retained if recognizable, reinterpreted as molded vinyl toy elements with slightly exaggerated proportions and matte paint, avoiding metallic shine; optional symbolic props such as a plush, flower, lantern, helmet, or small toy may be included. The pose should remain calm and still, with a subtle head tilt or lowered gaze that reinforces a quiet, introspective, nostalgic feeling, avoiding any dynamic or action-oriented poses. The background should be a clean white or soft pastel studio setting in the style of POP MART product backdrops, with a soft shadow beneath the figure or base, and optionally a simple base like a cloud, rock, or earth platform. Ensure strict negative constraints: no photorealistic skin, hair, or lighting; no anime or cartoon linework; no shiny, glossy, or glass-like surfaces; no visible texture maps; and no cluttered environments. The final output should be a full-body 3D collectible vinyl figurine in POP MART Hirono style, defined by a soft pastel palette, matte painted vinyl texture, childlike proportions, and a gentle melancholic, whimsical mood.
```

| ![](https://pbs.twimg.com/media/HH7UqAFa4AAYKU9?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH7UqA-aAAAJSzc?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
retexture this image into the following JSON style aesthetic and keep the images geometry completely intact： 


{
  "size": "Recommended 4:5 portrait ratio; can be adapted to other vertical portrait ratios",
  "attention": [
    "Detail Restoration",
    "Rich in detail",
    "Style Consistency",
    "Transferable Visual Language",
    "Do not bind to any specific object, accessory, identity, costume, prop, or facial feature"
  ],
  "ImageStyle": "Minimalist cinematic low-key portrait photography with extreme silhouette treatment, high-contrast rim lighting, deep shadow concealment, editorial neo-noir atmosphere, and a highly controlled near-monochrome visual system.",
  "SceneDescription": "The image style presents a subject isolated against an absolute black void background, with the environment fully removed. The visual structure is built around darkness, negative space, and selective edge illumination. The subject is not described through full internal detail, but through glowing outer contours, partial surface transitions, and subtle tonal separation. Most of the body, face, form, or central structure remains submerged in shadow, while a precise rim light outlines the silhouette and creates separation from the black background. The composition is restrained, iconic, and minimal, using contrast and absence rather than detail-heavy storytelling. This style should remain transferable to any subject without requiring specific props, accessories, clothing, identity markers, or narrative objects.",
  "sform": "The subject should appear still, composed, and sculptural, with a calm upright presence and minimal gesture. The form is defined primarily by silhouette, contour, and edge light rather than full exposure. The posture or structure should feel restrained and iconic, avoiding exaggerated movement or expressive action. Internal features are intentionally reduced, hidden, or only faintly suggested, allowing the viewer to recognize the subject through outline, volume, and illuminated edges. The visual emphasis is on shape readability, elegant contour flow, and controlled concealment.",
  "styleAesthetic": {
    "overallVibe": "Mysterious, cinematic, quiet, restrained, elegant, anonymous, dramatic, minimal, high-contrast, psychologically intense, and editorial. The mood is created through visual reduction, deep darkness, and precise light control rather than decorative detail.",
    "colorPalette": {
      "background": "Absolute black or near-total black void, with no visible environment, scenery, pattern, texture, or contextual background.",
      "mainColors": [
        "Dominant deep black occupying most of the image",
        "Near-black charcoal tones used only for faint internal form separation",
        "Brilliant white or cool-white rim light used sparingly along the outer contour",
        "Subtle gray tonal transitions in selectively illuminated edge areas"
      ],
      "accents": [
        "Optional extremely restrained warm or cool micro-accents may appear only as subtle reflected highlights, but they must not become object-specific or dominate the palette"
      ],
      "colorLogic": "A highly limited near-monochrome palette based on deep black, charcoal, gray, and crisp white highlights. The visual effect depends on extreme contrast and tonal restraint. Any accent color should be minimal, atmospheric, and non-specific, serving only to enrich the lighting rather than identify a particular object."
    },
    "lineAndStroke": {
      "lineQuality": "The image is photographic rather than drawn; apparent lines are created by light. Contours should feel like luminous edges formed by precise rim lighting instead of painted or illustrated outlines.",
      "outline": "The outer silhouette is sharply separated from the background by thin to moderately strong white edge light. Edges may be crisp on smooth surfaces and softly blooming where the surface has fine texture.",
      "innerDetails": "Interior details are sparse, suppressed, or nearly invisible. Only small areas touched by grazing light may reveal minimal structure, texture, or dimensional transition.",
      "strokeDensity": "Very low internal visual density. Most of the image remains dark and empty, with detail concentrated along illuminated edges and select surface transitions."
    },
    "compositionAndSpace": {
      "composition": "A restrained vertical portrait-style composition with the subject occupying the central visual field while surrounded by large areas of black negative space. The framing should be close enough to feel intimate and iconic, but not dependent on any specific object or costume.",
      "perspective": "Natural portrait-like perspective, usually eye-level or slightly adjusted for cinematic presence. Avoid extreme distortion. The subject may be front-facing, slightly turned, or subtly angled, as long as the silhouette remains readable.",
      "spatialDepth": "Very shallow spatial environment. Depth is created almost entirely through the separation between the illuminated contour and the black background, not through scenery or layered objects.",
      "visualFocus": "The eye is guided by the brightest contour highlights, the strongest edge separation, and the most selectively revealed structural areas. The focus should come from light hierarchy rather than props or narrative details."
    },
    "materialsAndTextures": [
      {
        "type": "Photographic medium",
        "description": "The image should feel like controlled studio or editorial photography with precise lighting direction, clean exposure control, and polished cinematic contrast."
      },
      {
        "type": "Surface texture",
        "description": "Texture should appear only where edge light catches the subject, revealing subtle surface quality such as fine strands, skin-like microtexture, fabric-like matte areas, hard surface transitions, or organic edge detail depending on the chosen subject."
      },
      {
        "type": "Detail treatment",
        "description": "Detail is selective rather than abundant. The most important information appears at the boundary between light and darkness, while the interior remains simplified into deep shadow masses."
      }
    ],
    "lightingAndShadows": {
      "description": "The defining lighting system is extreme low-key illumination with strong rear or side-back rim lighting. The light source is positioned behind or behind to the side of the subject, creating a luminous contour while keeping the front and interior largely unlit. There should be little to no frontal fill light. The result is a near-silhouette image where form is revealed through edge glow and minimal grazing illumination.",
      "shadowStyle": "Deep black shadow dominance with compressed dark tones. Shadows should be dense, clean, and controlled, concealing most internal structure without looking muddy or low-quality.",
      "highlightStyle": "Highlights are crisp, elegant, and concentrated along the outer contour. Some highlights may bloom softly in textured regions, but they should remain controlled and not wash out the image."
    },
    "renderingTechnique": {
      "detailLevel": "Selective detail: high clarity at illuminated contours, minimal detail in shadow areas, and no unnecessary background information.",
      "edgeTreatment": "Clean luminous edges with a balance of sharp separation and slight cinematic glow. Edge brightness should define the silhouette without turning into a cartoon outline.",
      "fillStyle": "Shadow-dominant photographic fill. The interior should be mostly black or near-black, with very limited midtone visibility.",
      "imperfections": "Optional subtle photographic bloom, slight falloff around bright edges, delicate noise in the deepest shadows, and faint texture only where light naturally catches the surface."
    },
    "keyPoint": "The transferable style is defined by an absolute black void background, minimalist composition, extreme low-key photographic lighting, strong rear or side-back rim light, subject mostly concealed in shadow, crisp luminous contour edges, sparse internal visibility, controlled negative space, near-monochrome palette, selective texture at illuminated boundaries, and a mysterious neo-noir editorial atmosphere. It must not rely on any specific prop, accessory, facial feature, costume, identity, or object.",
    "moodKeywords": [
      "cinematic low-key",
      "near silhouette",
      "rim lighting",
      "black void background",
      "minimalist portrait",
      "high contrast",
      "selective illumination",
      "deep shadow",
      "negative space",
      "neo-noir",
      "editorial photography",
      "anonymous",
      "mysterious",
      "controlled lighting",
      "monochrome contrast"
    ]
  },
  "promptForRecreation": {
    "positivePrompt": "Create [SUBJECT] in a minimalist cinematic low-key photographic style against an absolute deep black void background. Use extreme high-contrast lighting with a strong rear or side-back rim light so that only the outer contours and select boundary areas of the subject are illuminated by crisp white or cool-white light. Keep most internal details submerged in deep shadow, allowing only minimal structure, texture, or dimensional transitions to appear where the light grazes the form. Emphasize silhouette clarity, elegant contour definition, strong negative space, restrained composition, near-monochrome contrast, controlled darkness, sparse detail, and a mysterious neo-noir editorial atmosphere. The subject should feel iconic, quiet, anonymous, sculptural, and visually powerful, with the image relying on light, shadow, and contour rather than props, accessories, scenery, or narrative objects. Use a polished photographic look, selective edge texture, deep clean blacks, and refined cinematic contrast. Best rendered in a vertical portrait ratio such as 4:5.",
    "negativePrompt": "Avoid specific props, accessories, identity markers, recognizable object anchors, busy backgrounds, visible scenery, decorative environments, colorful palettes, bright frontal lighting, evenly exposed interior details, full facial visibility, cheerful mood, exaggerated expressions, action poses, cluttered composition, complex storytelling elements, flat commercial lighting, low contrast, washed-out blacks, excessive midtones, cartoon style, painterly brushwork, glossy CG rendering, oversmoothed surfaces, heavy texture everywhere, text, captions, logos, watermarks, signatures, distorted anatomy, and low-resolution blur."
  },
  "styleTransferTemplate": {
    "usage": "Use this template when generating any new subject in the same general style without binding to specific objects or accessories.",
    "template": "Create [NEW SUBJECT] in a minimalist cinematic low-key photographic style: absolute black void background, extreme high-contrast silhouette treatment, strong rear or side-back rim lighting, crisp luminous contour edges, subject mostly concealed in deep shadow, minimal selectively revealed internal structure, near-monochrome black-white tonal system, large negative space, restrained vertical composition, selective texture only where edge light touches the form, polished editorial neo-noir atmosphere. Avoid any required props, accessories, specific identity markers, visible scenery, text, logo, watermark, bright frontal lighting, and unrelated layout descriptions."
  }
}

```

```
Set against a deep black background of absolute void, the composition features a striking silhouette where only the sharp, elegant edges of the face are glowing with a brilliant white light. [PERSON] wears brown round sunglasses with silver-rimmed frames that catch and reflect a soft, ethereal glow, providing the only warmth in the palette. This creates a mysterious shadowed face with almost no facial details visible, emphasizing anonymity and intrigue through intense cinematic lighting. The scene is captured in a 4:5 aspect ratio, focusing the viewer's attention on the stark contrast and the subtle interplay of light and shadow.
```
![](https://pbs.twimg.com/media/HH3-I8xWoAgsecs?format=jpg&name=medium)



```
Create a hyper-realistic black and white low-key fashion portrait based on the uploaded reference image. Keep the exact same composition, square framing, camera angle, subject placement, upper-body crop, head tilt, shoulder position, body angle, background, lighting direction, shadow placement, contrast, grain texture and overall dark editorial mood.
Replace only the original person with the character from the newly uploaded target reference image.
```

| ![](https://pbs.twimg.com/media/HMmKDRuacAAi5Ef?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HMmKDR6akAANntN?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |



```
Prompt :

Aesthetic vintage paper collage portrait of a stylish woman taking a mirror selfie, made entirely from torn magazine and newspaper pieces, layered mixed-media artwork, neutral beige and brown tones, Vogue-inspired fashion editorial style, black sunglasses, sleek ponytail hairstyle, white corset top, silver jewelry, purple smartphone, textured ripped paper edges, handcrafted mosaic effect, realistic shadows and depth, chic typography cutouts, inspirational quotes scattered around, cozy luxury aesthetic, highly detailed analog collage art, soft warm lighting, Instagram moodboard vibe, premium editorial composition, ultra detailed, 4k

Prompt :

Vintage breakfast aesthetic collage made from torn magazine and newspaper clippings, artistic mixed-media paper mosaic style, croissants on a plate with jam, black coffee in a dark cup, fresh fruits and berries, butter dish with knife, café table atmosphere, dark green textured background, ripped paper layers with visible cracks and folds, lifestyle editorial typography, cozy European café vibe, warm earthy tones, handcrafted scrapbook look, realistic paper texture, aesthetic Pinterest moodboard composition, soft cinematic lighting, luxury brunch aesthetic, ultra detailed, high realism, 4k collage art style
```

| ![](https://pbs.twimg.com/media/HIMPJvUbMAAjvOY?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIMPJvRbUAAznN-?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
按要求生成图片：
Hyper-realistic top-down macro photography. A long, light green WhatsApp speech bubble acting as a dining table. Two real living humans (shrunk to tiny scale) are sitting at opposite ends. They are NOT plastic figures; they have visible skin texture, natural hair, and realistic clothing folds. They are eating real food that looks freshly cooked, not play-doh. The text inside reads: "INSERT TEXT". Bottom right has a timestamp '3:33 PM' and blue ticks. The background is completely filled with a high-density, seamless WhatsApp doodle pattern (line art icons) covering the entire surface edge-to-edge with no empty spaces, resembling the original dense WhatsApp wallpaper. Professional studio lighting, 8k resolution, sharp focus.
```

| ![](https://pbs.twimg.com/media/G9Wc_PJXgAAclLO?format=jpg&name=4096x4096) | ![](https://pbs.twimg.com/media/G9Wc_eFWUAAtzEi?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |


```
​{current_weather} in a gravity-defying {city_name}. The asphalt street curves seamlessly upwards, physically bending 90 degrees to become a vertical wall, then arching directly overhead. Not a reflection, but a solid continuous loop of architecture. Iconic buildings and roads protrude perpendicularly from the curved surface all around. {city_name}'s landmarks hang upside down above. Realistic lighting matching the weather, vivid details, photorealistic 8k. --ar 9:16
```

| ![](https://pbs.twimg.com/media/G9KA1KsbgAEoiO2?format=jpg&name=4096x4096) | ![](https://pbs.twimg.com/media/G9KA1_naoAEcB93?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |

```
striking portrait of a [SUBJECT] distorted by vertical textured glass, which fragments and elongates the features into wavy vertical lines. Set against a vivid [COLOR] background, the photo showcases the balance between the smooth contours of the subject and the dynamic distortions imposed by the glass, with the well-lit and sharp details emphasizing the details
```

| ![](https://pbs.twimg.com/media/GrDaJYNWYAAtyA8?format=jpg&name=large) | ![](https://pbs.twimg.com/media/GrDwOVcXMAAxTmE?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
[subject] appears sculpted entirely from dripping candlewax layers of melted forms frozen mid-drip, with a palette of cream, honey, and soot. Pools of wax gather below, lit from within.
```

| ![](https://pbs.twimg.com/media/Gq5sKNobEAAlqym?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/Gq5sKn-akAAej1a?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |

```
an ethereal [SUBJECT]-shaped formation in the canopy opens to reveal a clear, azure sky with fluffy clouds. The tall trees surrounding the outline are rich in detailed textures, their towering trunks and scattering leaves bathed in a soft, natural sunlight, while distant hills and birds soaring through the open sky complete the tranquil composition.
```

| ![](https://pbs.twimg.com/media/GqgK7gJXoAA63v-?format=jpg&name=large) |
| ---------------------------------------------------------------------- |

---

#### 字体/Logo设计类

```
请根据用户输入的【品牌名】【产品名】【品牌类型 / 行业】【品牌定位】【目标受众】【关键词】【主色调】【画幅比例】，创作一张高完成度的「趣味图形标志 / Playful Graphic Marks」风格 logo 展示图。 【用户输入】 品牌名：【品牌名】 产品名 / 项目名：【产品名】 品牌类型 / 行业：【品牌类型 / 行业】 品牌定位：【品牌定位】 目标受众：【目标受众】 风格关键词：【关键词】 主色调：【主色调】 辅助色：【辅助色】 画幅比例：【画幅比例】 【创作目标】 这不是普通文字排版，不是复杂插画海报，也不是传统严肃企业 logo，而是一张具有强识别度、趣味感、亲和力、创意感与品牌感的「趣味图形 logo 展示图」。 请根据用户输入的信息，先判断这个品牌更适合哪一种趣味表达方向，再据此设计 logo： 1. 如果品牌更偏手作、轻文创、小店、咖啡、轻松随性气质，则偏向「手绘趣味型」； 2. 如果品牌更偏宠物、儿童、零食、IP、潮玩、可爱消费品，则偏向「卡通角色 / 动物型」； 3. 如果品牌更偏新消费、餐饮、生活方式、零售品牌，希望更简洁专业，则偏向「简约图形商业型」。 无论选择哪一种倾向，都必须保持在统一的「趣味图形 logo」体系内：简洁、好记、有创意、有亲和力、具有品牌识别性。 【核心视觉要求】 1. 以【品牌名】或【产品名】为灵感核心，提炼出一个具有品牌识别度的趣味图形 logo。 2. logo 应以“图形识别”为优先，不一定是纯文字 logo，也可以是文字与图形结合，或更偏符号化的图形标记。 3. 图形应围绕品牌属性展开，可结合产品特征、行业属性、名称联想、品牌个性进行创意转译。 4. 图形要简洁清晰，不要做成复杂插画；要像一个真正可用于品牌识别、包装、门头、社媒头像、周边物料的标志。 5. 整体气质要有趣、灵动、亲和、有记忆点，但不能幼稚杂乱，也不能太普通。 6. 如品牌适合角色化表达，可以融入动物、拟人、吉祥物、表情感、小角色感；如品牌更适合简洁表达，则收束为更几何、更规整的趣味图形语言。 7. 画面可以带轻微手绘感、卡通感或图形化感，但最终结果必须干净、成熟、统一。 【风格判断逻辑】 请根据输入信息，自动匹配最适合的表现方式： - 偏温暖、手作、轻松、小而美：用手绘趣味图形语言 - 偏可爱、宠物、儿童、零食、角色化：用卡通角色 / 动物图形语言 - 偏现代、品牌化、商品化、商业应用：用简约图形商业语言 但不要在画面中直接写出“手绘趣味型 / 卡通型 / 商业型”这些分类词，只需要体现在最终视觉结果中。 【色彩要求】 1. 色彩应根据品牌属性自动匹配，整体保持趣味、明快、易识别。 2. 优先使用【主色调】和【辅助色】，可适当加入少量点缀色。 3. 色彩可以比中式意象 logo 更大胆，但不要杂乱，通常控制在 2–4 个主要颜色以内。 4. 可根据品牌气质决定是高明度清新、温暖可爱，还是低饱和趣味高级感。 5. 背景尽量简洁干净，可使用白色、米白、浅灰、浅彩底，以突出 logo 主体。 【结构与版式要求】 这张图是“logo 展示图”，而不是广告海报，请采用清晰、专业、可复用的展示结构： - 主视觉区：放置 logo 主体，作为最大视觉中心 - 名称区：放置品牌名或产品名 - 副信息区：可放拼音、英文名、简短 slogan、行业描述 - 细节区：可少量加入辅助小字、装饰线、标记信息，增强作品展示感 【排版要求】 1. 版式整体保持简洁、留白舒服、视觉集中。 2. 可以采用居中式、上下结构式或轻提案展示式排版。 3. 主 logo 最大，品牌名次之，其他说明信息较小。 4. 不要堆太多信息，不要做得像宣传海报。 5. 画面应像设计作品集中的一页高完成度 logo 展示图。 【整体气质关键词】 趣味、图形化、亲和、创意、简洁、可识别、可品牌化、轻松、灵动、记忆点强、适合社媒传播与品牌展示。 【输出要求】 请最终生成一张高完成度的趣味图形 logo 展示图。重点不是复杂，而是要让 logo 本身足够有辨识度、有趣味性，并且和品牌定位相匹配。
```

![趣味logo](https://pbs.twimg.com/media/HHjLOQTWcAA0526?format=jpg&name=large)



```
请根据用户最后输入的任意内容，创作一张高完成度的「字生万象」风格视觉作品。

这不是普通海报，不是书法字效，也不是国潮插画，而是一张以汉字为母体、以东方意象为内在线索、以品牌标志为最终形态的中式图形作品。你的任务不是把字装饰得更复杂，而是让一个字在保持可识别的前提下，长出恰到好处的象征、气韵、秩序与记忆点，使其成为一枚真正可用、可复用、可延展的品牌视觉母体。

用户可能只输入一个字、一个品牌名、一句话、一个产品方向、一种颜色、一种气质，甚至一段模糊感觉。不要要求用户填表，也不要机械拆参数。请直接从用户最后输入中，自动判断最适合成为视觉核心的汉字或词语，并同步理解其语义、情绪、行业属性、文化联想、品牌潜力与画面气质。缺失的信息不需要追问，而应由整体判断自然补全。

在真正开始视觉创作之前，请先对核心汉字、词语、品牌名或主题进行全网语义调查与字形研究。不要急着把表层意象贴到字上，而要先理解：这个字为什么长成这样，它的本义与引申义是什么，它在古文字与书写演变中留下了哪些形态线索，它在诗词、器物、风物、民俗、行业与当代品牌语境中承载了怎样的精神气质。研究的目的不是堆资料，不是做知识展示，而是找到一个更深、更准、更不机械的设计切入点。请特别避免“看到什么字就塞什么图”的浅层拼贴，不要因为是某个字就条件反射地贴上对应物象，而应先判断这个字真正值得被视觉化的关系，可能是字骨本身，可能是部件之间的张力，可能是古字形里的原始意味，可能是负空间中的隐喻，也可能是它在当代品牌语境中最值得放大的精神状态。

创作时请先判断这个字的“骨、势、气、质”。骨，是它最不能丢掉的识别结构；势，是它天然的方向、重心与力量走向；气，是它传达出的情绪温度与精神状态；质，是它应有的触感、材料感与笔触性格。请先立字骨，再生意象；先让标志成立，再让巧思被发现。不要一上来堆意象，也不要把字变成不可读的图案。

尤其要注意：不同的字，不能套用同一种笔触语言。请根据核心汉字本身的观感、力量、要求与调性，为它重新判断最合适的笔触性格。笔触不是装饰，而是这个字的性格本身。笔画的粗细、轻重、转折、断连、边缘、飞白、圆角、切口、内白、收束方式与节奏感，都必须服务于这个字独有的语义与品牌气质。不要给所有汉字套同一种“东方墨迹感”或同一种“圆润印章感”。每个字都应该拥有由自身意义自然长出来的笔触秉性，让人感觉它只能被这样处理，而不是换一个字也能套用同样的方法。

主视觉必须围绕一个汉字或词语展开，并始终保持“字即图，图即字”的关系。请以汉字结构为起点，把与语义相关的意象折叠进笔画、转折、负空间、轮廓、边界或留白之中。意象可以来自自然、器物、空间、风物、行业属性或情绪暗示，但不要把它们直接画成插画，也不要堆砌成说明图。真正高级的部分，应当藏在结构内部，而不是贴在表面。

每张作品只需要一个真正成立的主隐喻，必要时最多允许一个辅助呼应。不要把巧思做成拼盘。最好的结果应该是：第一眼先读到字，第二眼感到气质，第三眼才发现其中的巧妙之处，并自然地产生“原来如此”的感受。这个“巧”必须是清晰、克制、准确的，不是花哨，不是炫技，不是元素越多越好。

请让标志具有真实品牌系统的可能性。它应像文创、茶酒、民宿、餐饮、地方风物、东方生活方式品牌或文化项目中可以长期使用的视觉母体，而不是一次性画面。标志本身应具有压缩后的力量，局部应可自然延展为印章、纹样、包装元素、社媒头像、辅助图形或系列视觉线索。

画面应以“标志展示页”的逻辑组织，而不是广告海报逻辑。整体以中轴感、留白感、纸本感与作品集提案感为核心。主标志是绝对视觉中心，其余信息只做克制陪衬，可以自然生长出品牌名、拼音、小字释义、细线、小章、编号、局部拆解或极少量辅助图形，但不要为了完整而填满版面，不要让配套信息抢走主体。要让画面有呼吸，有安静的秩序，有一种自然形成的章法。

视觉气质应中式、简约、温润、克制、雅致，带有文人感、印章感、收藏感和品牌感。东方感不要依赖龙纹、祥云、灯笼、红金堆叠或廉价国潮元素，而应来自比例、虚实、疏密、图底关系、笔画节奏、材料肌理以及一处精准的点睛。宁可少而准，不要多而散。克制比丰富更重要，含蓄比说明更高级。

色彩请根据用户输入自动判断，以低饱和、耐看、有时间感的色系为主。主色用于建立标志识别，辅助色用于平衡结构，点缀色只在极小的位置完成收口。背景宜采用宣纸白、米白纸、浅灰手工纸、暖灰纸面或细腻纸张肌理，可有轻微压印、墨色沉积或极克制的烫金感，但不要出现强烈 3D、廉价渐变、赛博感、过度金属反光或复杂实景背景。

最终作品必须先像一个真正能用的汉字品牌标志，再像一张具有审美完成度的展示图。请让观者先读到字，再感到气质，最后发现巧思。输出结果应稳定、清晰、精致、可复用，具有成熟设计作品的完成度，并适合社媒发布与作品集展示。

用户最后输入如下：
【在这里放用户的任意输入】
```

![0000.png](https://pbs.twimg.com/media/HHjyQ4vbIAAZWsU?format=jpg&name=large)


```
请根据用户输入的【品牌名 / 项目名】【副标题 / 产品名】【类型 / 行业】【品牌定位】【核心关键词】【情绪气质】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「破格编排标题型 Logo / Experimental Title Wordmark Logo」。

【用户输入】
品牌名 / 项目名：【品牌名 / 项目名】
副标题 / 产品名：【副标题 / 产品名】
类型 / 行业：【类型 / 行业】
品牌定位：【品牌定位】
核心关键词：【核心关键词】
情绪气质：【情绪气质】
主色调：【主色调】
辅助色：【辅助色】
画幅比例：【画幅比例】

【核心目标】
这次要设计的是一个真正的 Logo，一个以文字为绝对核心、通过大胆编排与结构重组形成强烈视觉张力的标题型字标标志。它不是普通排版，不是简单打字，也不是海报标题截图，更不是贴纸或封面，而是一个具有明确品牌属性、独立识别性和强视觉态度的标题型 Logo。

请围绕【品牌名 / 项目名】进行定制化设计，让这个字标呈现出“破格编排”的特征：通过错位、压缩、拉伸、断裂、切割、穿插、重叠、倾斜、节奏变化、层级组织和局部结构冲突，让文字本身形成鲜明的标题感、冲击力、个性和传播感。

整体要有明确的设计野心和视觉风格，不要平庸，不要保守，不要做成普通字体换个字重的效果。

【设计本质】
这类 Logo 的重点不是图文意象融合，也不是精致细节堆砌，而是：
1. 以文字为主角；
2. 通过编排方式本身形成视觉个性；
3. 让字标像一个“有态度的标题”，但仍然是一个可以独立成立的 Logo；
4. 让设计感来自结构和排布，而不是依赖复杂背景或海报氛围。

【最重要的原则】
1. 这必须首先是一个 Logo。
2. 必须首先像一个可真实用于品牌、栏目、活动、展览、片名、厂牌、内容IP或视觉系统中的标题型字标标志。
3. 设计感必须来自文字编排本身，而不是依赖背景、材质、光影、海报构图来制造效果。
4. 允许大胆、破格、实验性，但不能失去识别性与整体性。
5. 不是普通排版，也不是一页海报设计，而是“标题型 Logo”。

【破格编排要求】
请重点通过“文字编排方式”来建立视觉冲击力，可使用但不限于以下方法：
1. 错位：字与字之间可以上下错位、前后错位、基线偏移；
2. 压缩与拉伸：部分字可横向压缩、纵向拉伸，形成节奏变化；
3. 切割与断裂：局部笔画可被切断、截断、错层，增强张力；
4. 穿插与重叠：局部字形之间可穿插、叠压，但仍需保持整体可读性；
5. 倾斜与角度变化：可引入轻微倾斜、方向转折、斜切感；
6. 节奏变化：通过粗细、大小、疏密、虚实、实心/线性变化制造层次；
7. 局部冲突：适度制造视觉冲突感，让字标更有态度和实验性；
8. 中英文 / 小字穿插：可加入少量英文、副标题、小字注释、编号、坐标式信息、辅助文字，增强标题感与设计完成度；
9. 局部结构强化：可加入极少量辅助线条、方向线、标记线、几何框线、编号、小标签、小符号等，帮助构成更强的编排感。

【字标设计要求】
1. 以【品牌名 / 项目名】为绝对主视觉核心。
2. 文字必须经过明显的定制化设计，不可直接使用普通电脑字体。
3. 每个字的形态、比例、重心、边界关系都可以被重新组织，以服务整体标题感。
4. 可读性不必像标准字那样绝对规整，但必须仍然能够被识别。
5. 要有“标题字”的气质，而不是普通品牌名排版。
6. 要让人一眼就感觉：这是被认真设计过的、具有鲜明态度的字标 Logo。

【视觉气质要求】
整体气质应接近以下方向之一或其组合，但必须统一：
- 展览标题感
- 栏目名 / 企划标题感
- 片名字感
- 厂牌 / 音乐项目感
- 潮流品牌感
- 实验性设计标题感
- 青年文化、先锋设计、内容品牌的视觉态度

整体要更偏“强风格、强态度、强记忆点”，而不是温吞、柔和、平庸。

【辅助构成要求】
在保持 Logo 属性的前提下，可适度加入以下辅助元素增强设计感：
1. 细辅助线、方向线、对位线
2. 极简几何块、矩形切片、线性边框、局部框线
3. 小字注释、英文名、拼音、副标题、编号、时间码、系列号
4. 局部高低对比、黑白块、留白切割
5. 极少量图形符号（如箭头、点、线、标记符号）
但这些元素必须服务于标题型字标本体，不能抢走主体，不可把结果做成完整海报或杂志版面。

【画面呈现要求】
1. 画面应像“Logo 展示图 / 字标提案页”，不是海报。
2. 背景要简洁、干净、低存在感，用于突出 Logo 本体。
3. 可使用白底、米白底、浅灰底或低干扰纯色背景。
4. 重点是展示字标本身及其编排张力，不靠环境氛围取胜。
5. 允许少量副信息排布，但整体必须围绕 Logo 本体展开。

【色彩要求】
1. 色彩重点服务于标题型 Logo 本体。
2. 优先使用【主色调】和【辅助色】。
3. 可采用高对比、单色强化、双色对冲、局部强调色等方式增强视觉冲击。
4. 可根据品牌气质使用黑白、深色重压、强对比配色，或带一点先锋感的高识别配色。
5. 不要依赖复杂渐变、炫光特效、3D质感或海报式背景去制造设计感。
6. 设计感要来自排布和结构，而不是来自材质噱头。

【风格关键词】
Logo优先、标题型字标、破格编排、实验性、视觉张力、错位、切割、压缩、穿插、重叠、标题感、态度感、先锋设计、强识别、强风格、品牌化。

【验收标准】
请确保最终结果满足以下标准：
1. 去掉背景后，这个字标本身仍然能独立成立；
2. 一眼看上去就具有明显的标题感和设计张力；
3. 设计感来自编排和结构，而不是背景和海报化氛围；
4. 它是一个真正的标题型 Logo，而不是一张平面海报；
5. 它有鲜明个性，不平庸，不像普通排版。

【输出要求】
请最终输出一个高完成度的「破格编排标题型 Logo」。它必须首先是一个成熟、独立、可识别、可品牌化的 Logo；其次，它要通过大胆而有秩序的编排方式，展现出鲜明的标题感、视觉冲击力和设计态度。
```

![](https://pbs.twimg.com/media/HHoF2dCWgAAQ44o?format=jpg&name=large)


```
请根据用户输入的【品牌名 / 项目名】【类型 / 行业】【品牌定位】【核心关键词】【情绪气质】【版式方向】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「日式书写商铺字标 / Japanese Brush Shop Wordmark」。

注意：这次要做的是一个真正可商用的店铺 Logo，而不是普通字体排版、海报标题或纯书法作品。请以毛笔书写感为核心，让主体文字具有明显粗细变化、提按顿挫、轻微飞白和自然笔势，同时保持清晰可读和强识别度。

【主体文字要求】
1. 以品牌名为核心主体，字形采用毛笔手写感处理；
2. 笔画应有明显粗细变化、提按顿挫、轻微飞白、墨感和呼吸感；
3. 某些关键笔画可适度夸张，形成记忆点；
4. 字体风格不必规整标准，可略带自然变形和店招个性；
5. 重点是“商铺书写字标”，不要做成传统书法展作品。

整体要有明显的和风商铺 / 门头招牌 / 暖帘店招气质，可适度加入小红印章、小号竖排说明字、少量假名 / 拼音 / 英文、红底白字块等元素作为点缀，但必须克制。背景保持简洁，主体 Logo 清晰突出。最终结果应像一家真实日料店、居酒屋、茶菓铺、食堂或和风生活方式品牌可以直接使用的高识别字标。
```

| ![](https://pbs.twimg.com/media/HIA6EEvX0AAGFD_?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIA6FBOXkAAhVht?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
请根据用户输入的【品牌名 / 项目名】【副标题 / 产品名】【类型 / 行业】【品牌定位】【核心关键词】【角色设定】【食物元素】【情绪气质】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「国风美食角色徽章 Logo / Chinese Food Mascot Badge Logo」。

【用户输入】
品牌名 / 项目名：【品牌名 / 项目名】
副标题 / 产品名：【副标题 / 产品名】
类型 / 行业：【类型 / 行业】
品牌定位：【品牌定位】
核心关键词：【核心关键词】
角色设定：【如古风少女、老师傅、小厨神、民俗人物、掌柜、侠客、孩童角色等】
食物元素：【如奶茶、烧烤、肉丸、面条、米线、糕点、汤圆、辣椒、锅、碗、筷子等】
情绪气质：【亲切、热闹、老字号、可爱、烟火气、地域感、年轻、匠人感等】
主色调：【主色调】
辅助色：【辅助色】
画幅比例：【画幅比例】

【核心目标】
这次要设计的是一个真正可商用的「国风美食角色徽章 Logo」。它不是普通卡通插画，不是简单餐饮海报，也不是单纯文字 Logo，而是一个以“国潮人物角色 + 醒目中文招牌字标 + 餐饮品类说明 + 徽章式整合结构”为核心的餐饮品牌标志。

整体要让人一眼感受到：这是一个有角色、有食欲、有店铺感、有包装感、适合真实餐饮品牌使用的 Logo。它既可以作为门店招牌，也可以用于外卖头像、包装贴纸、餐盒、杯身、菜单、社媒头像和食品包装正面主视觉。

【设计本质】
这类 Logo 的重点不是单独画一个可爱人物，而是把以下三层整合为一个完整品牌标志：

1. 角色层：负责吸引注意力和品牌人格；
2. 字标层：负责品牌名识别和传播；
3. 徽章层：负责把角色、文字和品类信息整合成一个完整 Logo 单位。

最终效果应像一个成熟的国潮餐饮品牌 Logo，而不是散乱的插画加文字。

【最重要的原则】
1. 这必须首先是一个 Logo，而不是一张插画海报。
2. 角色要有记忆点，但不能压过品牌名。
3. 中文品牌名字标必须醒目、清楚、有招牌感。
4. 整体必须有餐饮消费感、食欲感和包装识别度。
5. 角色、食物、文字、徽章结构必须是一个整体，而不是简单拼贴。
6. 风格要国潮、有趣、有亲和力，但不能廉价、低幼或过度杂乱。文字不要过于密集。

【角色设计要求】
请根据【角色设定】设计一个具有品牌人格的国潮美食角色。

角色设计要求：
1. 角色形象要有明显记忆点；
2. 表情要亲和、有食欲感、有烟火气；
3. 动作要和食物或品类有关，例如端碗、举串、喝奶茶、揉面、炒锅、拿勺、举招牌等；
4. 服装可以带有国风、地域、民俗或餐饮职业特征；
5. 角色应偏品牌 IP 化，不要写实，不要过度复杂；
6. 角色要适合缩小后仍能识别，适合做品牌头像和包装图案。

【食物元素要求】
请围绕【食物元素】加入少量但准确的餐饮符号，例如：
- 碗、锅、筷子、勺子、蒸汽
- 火焰、炭火、辣椒、汤汁
- 奶茶杯、吸管、茶叶、冰块
- 糕点、汤圆、肉丸、面条、串串
- 地域食材、调味料、包装纸、餐盒

食物元素要服务品牌识别，不要堆砌。  
重点是让观众一眼知道这个品牌大概卖什么。

【字标设计要求】
品牌名是 Logo 的核心识别之一，必须清楚、醒目、有招牌感。

中文品牌名字标应具有：
1. 粗壮、有力、饱满的餐饮招牌感；
2. 适度国潮风、复古包装感或卡通字感；
3. 可加入描边、阴影、底托、牌匾、圆角、厚度感；
4. 字体可以略微夸张，但必须可读；
5. 不要太极简，不要像普通系统字体；
6. 字标要和角色风格统一。

【徽章结构要求】
请将角色、品牌名、品类信息整合成完整徽章式 Logo。

可选择以下结构之一：
1. 上方角色 + 下方中文大字标；
2. 角色站在食物或器具上 + 字标作为底托；
3. 圆形 / 椭圆 / 牌匾式徽章结构；
4. 左右对称小牌 + 中央角色；
5. 角色与文字交叠成一个完整品牌章；
6. 底部横向招牌条 + 上方角色 IP；
7. 外卖头像式圆章 / 包装贴纸式结构。

整体应像一个可直接用于食品包装、门店招牌或社媒头像的完整 Logo。

【辅助信息要求】
可以加入少量辅助文字和小标识，例如：
- 品类说明
- 英文副标题
- 创立年份
- 地域标签
- “手作”“现做”“老味道”“秘制”等小字
- 小圆章、小边框、小装饰条

但辅助信息必须克制，不能让画面变成复杂海报。

【风格方向要求】
整体应呈现：
- 国潮感
- 餐饮感
- 包装感
- 角色 IP 感
- 亲和力
- 传播感
- 食欲感
- 地方小吃 / 新消费餐饮品牌气质

整体必须避免：
- 低幼儿童插画感
- 过度复杂海报感
- 纯插画而不像 Logo
- 人物太写实
- 字体太弱
- 颜色太脏太杂
- 信息堆太多
- 缺少餐饮品类识别

【色彩要求】
请根据【主色调】和【辅助色】设计整体配色。

推荐色彩方向：
1. 烧烤 / 火锅 / 重口味：红、橙、黑、土黄、深棕；
2. 甜品 / 奶茶 / 糕点：粉、奶白、浅紫、豆沙红、杏色；
3. 地方小吃 / 面食 / 米线：米白、墨黑、朱红、青绿、土黄；
4. 海鲜 / 清爽食堂：蓝、青、白、红色小印章；
5. 老字号 / 熟食 / 酱料：棕红、暗金、墨黑、米黄。

颜色要有食欲感和品牌记忆点，但不要超过 4～5 个主要颜色。  
亮色点缀可以增强吸睛度，但不能喧宾夺主。

【画面呈现要求】
1. 画面为独立 Logo 展示图，不要做成复杂海报；
2. 背景简洁，推荐白底、米白底、浅灰底或低饱和纯色底；
3. Logo 主体居中，清晰完整；
4. 角色、字标、品类说明和徽章结构必须完整统一；
5. 整体看起来像真实餐饮品牌的 Logo 提案，而不是单张插画。

【验收标准】
请确保最终结果满足以下标准：
1. 一眼能看到品牌名；
2. 一眼能感受到卖什么；
3. 角色有记忆点；
4. 整体是完整 Logo，而不是插画海报；
5. 适合用于门店、包装、餐盒、贴纸、外卖头像和社媒头像；
6. 有国潮美食品牌的亲和力、食欲感和传播感。

【输出要求】
请最终输出一个高完成度的「国风美食角色徽章 Logo」。它必须首先是一个成熟、完整、可品牌化、可应用的餐饮 Logo；其次，它要通过国潮角色、醒目字标、食物元素和徽章结构，形成强识别、强亲和、强传播的美食品牌形象。
```

| ![](https://pbs.twimg.com/media/HIF0E3oXQAAp8e_?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIF0E3nXQAE045r?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
请根据用户输入的【品牌名 / 项目名】【副标题 / 产品名】【类型 / 行业】【地域风味】【品牌定位】【核心关键词】【核心图形】【核心食物 / 品类元素】【情绪气质】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「国潮复古餐饮徽章 Logo / Chinese Retro Food Emblem Logo」。

【用户输入】
品牌名 / 项目名：【品牌名 / 项目名】
副标题 / 产品名：【副标题 / 产品名】
类型 / 行业：【类型 / 行业】
地域风味：【港式 / 粤式 / 湘味 / 川味 / 炭火 / 夜宵 / 茶餐厅 / 烧味 / 海鲜 / 小酒馆等】
品牌定位：【品牌定位】
核心关键词：【复古、国潮、招牌感、老字号感、烟火气、江湖感、新消费感等】
核心图形：【龙 / 凤 / 鹤 / 虎 / 牛 / 蛙 / 鹅 / 鱼 / 龙虾 / 器具 / 图腾 / 吉祥纹样等】
核心食物 / 品类元素：【烧鹅 / 烧烤 / 茶饮 / 龙虾 / 面食 / 牛肉 / 冰室 / 酒馆等】
情绪气质：【热闹、霸气、复古、经典、地方感、烟火气、江湖感、年轻化等】
主色调：【主色调】
辅助色：【辅助色】
画幅比例：【画幅比例】

【核心目标】
这次要设计的是一个真正可用于餐饮品牌的「国潮复古餐饮徽章 Logo」。它不是普通海报，也不是简单卡通插画，更不是只写几个字。请以中文主字标为核心，融合强识别图形、餐饮品类符号、复古中英文排版和完整徽章式结构，打造一个具有门头感、包装感、品牌系统感和传播感的餐饮 Logo。

最终结果应让人一眼感受到：
1. 这是一个餐饮品牌；
2. 它有明确品类和个性；
3. 它像一个成熟的品牌主标，而不是一张装饰性图案。

【设计本质】
这类 Logo 的核心不是单一图形或单一字体，而是以下五层整合：
1. 中文主字标：负责品牌识别；
2. 图形符号：负责记忆点与品类联想；
3. 徽章结构：负责整体完整性；
4. 中英文排版：负责层次感与复古品牌氛围；
5. 颜色系统：负责强化餐饮调性和品类情绪。

【最重要的原则】
1. 中文品牌名必须醒目、清楚、具有招牌感；
2. Logo 必须是一个完整标识，而不是零散元素拼贴；
3. 图形必须与品牌名或品类相关，不能为了装饰而装饰；
4. 英文为辅助，中文为主，英文不能喧宾夺主；
5. 整体必须有餐饮品牌属性，适合门头、菜单、包装和社媒头像；
6. 画面必须有复古感，但不能老气、脏乱或失去现代品牌完成度；
7. 必须有“国潮复古餐饮徽章”的味道，而不是美式卡通或日式商铺字标。

【中文主字标要求】
1. 中文品牌名为绝对主角；
2. 字体要有复古餐饮招牌感、老包装感或国潮标题感；
3. 可以厚重、粗壮、有黑体 / 宋黑 / 商业手写感；
4. 可以做适度变体，但必须清晰可读；
5. 不要极简细字体，不要弱，不要像普通系统字；
6. 需具备门头感和品牌标识感。

【图形系统要求】
请根据【核心图形】与【品类元素】设计一个与品牌高度相关的主图形。
可选方向包括：
- 动物 / 神兽：龙、凤、虎、牛、鹅、鱼、蛙、鹤等；
- 食材 / 菜品：龙虾、烧鹅、牛肉、面碗、火焰、茶杯等；
- 传统图腾：章印、纹样、牌匾、吉祥图案；
- 器具 / 场景符号：烤架、火焰、碗筷、冰室元素等。

图形要求：
1. 要有记忆点；
2. 要与品类和名字有明确关系；
3. 不要做得太复杂写实；
4. 要适合与字标整合为徽章；
5. 可以偏复古插画、版画感、老商标感、国潮线描感。

【徽章结构要求】
请把整体设计成一个完整的“餐饮品牌徽章 Logo”，而不是简单横排。
结构可参考以下方式：
1. 上方英文拱形 + 中央图形 + 下方中文主字标；
2. 中央大图形 + 左右小标签 + 下方副标题；
3. 圆章 / 椭圆章 / 牌匾式构图；
4. 中心主图 + 上下分层文字；
5. 对称排版 + 小图章 + 小圆标系统；
6. 老招牌 / 老商标 / 包装主标式版式。

【中英文排版要求】
1. 中文为主，英文为辅；
2. 英文可用于拱形主标题、品类名、店型说明、口号、年份、ESTD 等；
3. 英文参与构图，增强复古商标感；
4. 英文不需要过多，但要精致、清晰、服务整体结构；
5. 可以使用如：
   - HOUSE
   - TAVERN
   - BARBECUE
   - ROAST GOOSE
   - TEA RESTAURANT
   - LOBSTER HOUSE
   - ESTD / SINCE / CLASSIC / SPECIALTY
6. 不要让英文压过中文，也不要变成纯英文品牌。

【辅助元素要求】
可以加入少量增强品牌系统感的小元素，例如：
- ESTD 年份
- 小圆章
- 小图标
- 小标签
- 小印章
- 地域说明
- 品类说明
- 横线 / 点阵 / 小边框
- slogan 小字

但必须克制，不能把画面做成复杂海报。

【色彩要求】
请根据品牌品类选择更合适的国潮复古餐饮色彩系统，例如：
1. 黑 + 红：烧烤、卤味、烧味、小酒馆；
2. 黑 + 金 / 棕金：老字号、熟食、烧鹅、粤式餐饮；
3. 绿 + 红 + 米白：港式冰室、茶餐厅；
4. 蓝 + 红 + 白：海鲜、龙虾、年轻夜宵餐饮；
5. 黑 + 蓝：更年轻、更理性一点的夜宵或酒馆；
6. 红 + 米白：老长沙粉面、传统小吃等。

要求：
- 色彩有餐饮招牌感；
- 颜色不宜过多，2~4 个主色最稳；
- 高饱和点缀可以增强吸睛度，但必须控制统一性。

【画面呈现要求】
1. 这是独立 Logo 展示图，不是菜单海报；
2. 背景简洁，建议浅灰白、米白、纸白或纯净浅底；
3. Logo 主体完整、清晰、居中；
4. 结构完整、信息有层次；
5. 整体看起来像一个成熟餐饮品牌的主 Logo 提案。

【风格关键词】
国潮复古餐饮徽章 Logo、Chinese Retro Food Emblem Logo、餐饮品牌、复古商标、老招牌、品牌徽章、中英混排、国潮字标、餐饮主标、门头感、包装感、老字号感、新消费餐饮。

【验收标准】
请确保最终结果满足：
1. 一眼看出是餐饮品牌；
2. 中文主字标醒目好认；
3. 图形与品牌名 / 品类有明确关系；
4. 徽章结构完整；
5. 中英文排版有层次；
6. 配色有餐饮品牌气质；
7. 适合门头、菜单、包装、贴纸、外卖头像和社媒主图使用；
8. 整体有“国潮复古餐饮徽章”的成熟商业感。

【输出要求】
请最终输出一个高完成度的「国潮复古餐饮徽章 Logo」。它必须以中文品牌名为核心，结合复古图形、中英文辅助系统、徽章式构图和明确的品类属性，形成一个真正可品牌化、可传播、可落地的餐饮品牌标识。
```

| ![](https://pbs.twimg.com/media/HIlr5leWoAA8IjH?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIlr5kjW4AAdshs?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |

```
请根据用户输入的【品牌名 / 项目名】【副标题 / 产品名】【类型 / 行业】【品牌定位】【核心关键词】【角色设定】【情绪气质】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「潮玩怪趣 IP 字标 Logo」。

【用户输入】
品牌名 / 项目名：【品牌名 / 项目名】
副标题 / 产品名：【副标题 / 产品名】
类型 / 行业：【类型 / 行业】
品牌定位：【品牌定位】
核心关键词：【可爱、怪趣、潮玩、贴纸感、年轻、IP感、搞怪、脑洞、呆萌、品牌感等】
角色设定：【动物 / 拟物 / 怪趣角色 / 食物角色 / 宇宙角色 / 潮玩角色等】
情绪气质：【呆萌、暴躁萌、傻萌、神经质、快乐、懒懒的、嘴硬可爱、无厘头、轻潮流等】
主色调：【主色调】
辅助色：【辅助色】
画幅比例：【画幅比例】

【核心目标】
这次要设计的是一个真正具有品牌识别度的「潮玩怪趣 IP 字标 Logo」。它不是普通儿童卡通，也不是单纯插画，而是要把“角色 + 字标 + 色彩 + 贴纸感构图”整合成一个完整 Logo。最终效果应像一个可以直接用于包装、贴纸、社交头像、门店招牌、周边商品和品牌视觉主标的年轻化潮玩 Logo。

【设计本质】
这类 Logo 的重点不是只画一个可爱角色，而是要完成以下整合：
1. 一个高辨识度、怪趣可爱的核心角色；
2. 一个醒目、粗黑、有冲击力的中文字标；
3. 辅助英文标题或副标题，增强潮玩包装感；
4. 高饱和扁平配色和黑色粗描边；
5. 整体像贴纸、潮玩包装、IP品牌标志，而不是普通插画。

【最重要的原则】
1. 角色必须是主记忆点，但不能只是装饰插画；
2. 文字必须清晰，具备 Logo 性质；
3. 角色与字标必须有互动关系，形成一个整体，而不是上下拼接；
4. 风格必须年轻、怪趣、可传播，不能低幼或土气；
5. 要有“贴纸感、潮玩感、IP感”，而不是传统企业 Logo；
6. 配色要明快、大胆、有记忆点；
7. 画面要清晰、简洁、完整，适合小尺寸传播；
8. 可以中英混排，但中文或品牌名必须清楚醒目。

【角色系统要求】
请围绕【角色设定】设计一个怪趣、呆萌、有观众缘的卡通角色。角色可以是：
- 动物拟人：猫、狗、熊、猴、兔、鱼、鳄鱼等；
- 拟物角色：奶盒、饼干、饮料、牙膏、蛋糕、飞船、武器、工具等；
- 混合角色：动物+食物、动物+物件、食物+表情、怪物+玩具等。

角色要求：
1. 造型简洁、夸张、可爱、有趣；
2. 表情必须有记忆点，例如呆、拽、傻、懒、坏笑、暴躁萌；
3. 要有强轮廓，适合做品牌标志；
4. 要有一点脑洞或反差感；
5. 线条尽量简洁，偏扁平，不要写实；
6. 角色可以抱着、举着、坐在、靠着、探出、压住字标；
7. 角色应直接参与 Logo 构图，而不是独立站在旁边。

【字标系统要求】
1. 中文品牌名或主标题必须醒目；
2. 字体要粗、黑、有重量感，像包装标题字或潮玩品牌字；
3. 可以有轻微变形，但不要过度花哨；
4. 适合与角色进行穿插、叠压、环绕或组合；
5. 英文可用于弧形标题、辅助标题、副说明、小口号、年份等；
6. 英文风格可偏粗体、大写、玩具包装感、贴纸感；
7. 整体应形成“角色 + 中文大字 + 英文辅助”的完整层级。

【构图要求】
整体构图应具有明显的“潮玩贴纸 Logo”感。可参考以下结构：
1. 角色在上，中文字标在下，英文小字辅助；
2. 角色压在字上或从字中探出；
3. 上方弧形英文 + 中间角色 + 下方中文字标；
4. 角色与字形成整体轮廓，像一枚品牌贴纸；
5. 可加小标签、小年份、小符号、小印章增强包装感。

整体要求：
- 主体集中；
- 结构清晰；
- 角色和文字关系明确；
- 缩小后依然容易识别。

【视觉风格要求】
1. 使用扁平化色块；
2. 使用明显粗黑描边；
3. 配色高饱和、有冲击力；
4. 整体有潮玩感、贴纸感、包装感；
5. 画面可以有一点无厘头和搞怪感；
6. 线条干净利落，不要复杂阴影；
7. 不要真实材质，不要 3D 写实感。

【色彩要求】
建议使用 2~5 个主色，整体高饱和、年轻化。

【辅助元素要求】
可加入少量潮玩包装式辅助元素，但必须克制，不能让画面变成海报。

【画面呈现要求】
1. 这是独立 Logo 展示图，不是海报；
2. 背景干净，建议白底、浅灰底、米白底；
3. 主体清晰完整，角色与字标一体化；
4. 风格统一，辨识度高；
5. 适合用于包装、头像、贴纸、门头、周边和社交媒体传播。

【验收标准】
请确保最终结果满足：
1. 一眼能记住角色；
2. 一眼能看清品牌名；
3. 角色和字标是一个整体；
4. 整体有贴纸感、潮玩感、IP感；
5. 配色鲜明、年轻、有观众缘；
6. 适合做品牌主 Logo，而不是单纯插画；
7. 有传播感和社交媒体友好度。

【输出要求】
请最终输出一个高完成度的「潮玩怪趣 IP 字标 Logo」，它必须以怪趣可爱的角色为核心，以粗黑字标为结构，以高饱和扁平配色和贴纸感构成为表现方式，形成一个年轻化、潮玩化、可传播、可品牌化的完整 Logo。
```

| ![](https://pbs.twimg.com/media/HIqI5u_WsAAAxcJ?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIqI-o3WsAAPB7X?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
请根据用户输入的【品牌名 / 项目名】【副标题 / 产品名】【类型 / 行业】【品牌定位】【核心意象】【角色 / 图形设定】【情绪气质】【主色调】【辅助色】【画幅比例】，设计一个高完成度的「治愈系手绘趣味字标 Logo / Healing Hand-drawn Playful Wordmark Logo」。

【用户输入】
品牌名 / 项目名：【品牌名 / 项目名】
副标题 / 产品名：【副标题 / 产品名】
类型 / 行业：【咖啡 / 面包 / 花艺 / 书店 / 杂货 / 民宿 / 旅行 / 文创 / 家居 / 选物店 / 儿童品牌 / 生活方式品牌等】
品牌定位：【品牌定位】
核心意象：【花 / 鸟 / 猫 / 云 / 太阳 / 面包 / 书 / 手 / 小怪物 / 杯子 / 气球 / 家居小物等】
角色 / 图形设定：【一个轻手绘小角色 / 小物件 / 小图形 / 拟人化意象】
情绪气质：【治愈、松弛、温柔、可爱、发呆、幽默、小浪漫、轻怪趣、生活感等】
主色调：【主色调】
辅助色：【辅助色】
画幅比例：【画幅比例】

【核心目标】
这次要设计的是一个「治愈系手绘趣味字标 Logo」。它不是商业感很重的品牌徽章，也不是高饱和潮玩 IP，不是复杂卡通插画，而是以一个轻巧、有记忆点的小手绘图形为核心，搭配松弛的品牌字标和少量英文 / 小标注，形成一个适合小众品牌、主理人小店、生活方式品牌和文创品牌使用的轻量 Logo。

最终效果应当轻松、干净、有呼吸感、有好感，像一个真实独立小店或生活品牌可以直接使用的 Logo。

【设计本质】
这类 Logo 的重点不是做得复杂，而是做得有情绪、有巧思、有亲和力：
1. 用一个小手绘意象建立第一记忆点；
2. 用松弛自然的字标建立品牌识别；
3. 用大量留白建立轻盈感；
4. 用少量亮色点缀建立温度；
5. 用不完美但有控制的线条建立手绘感；
6. 整体传达治愈、松弛、小众、有生活气息的品牌调性。

【最重要的原则】
1. 图形要简单，但必须有巧思；
2. 文字要轻松自然，不能像普通系统字体直接打字；
3. 整体要有 Logo 性质，不能只是插画；
4. 留白要多，画面不要塞满；
5. 配色要克制，通常以黑色线条为主，搭配 1～2 个点缀色；
6. 风格要松弛，但不能粗糙；
7. 不能低幼，不能像儿童涂鸦，也不能像普通表情包；
8. 要有独立品牌、小店、主理人品牌的审美气质。

【图形 / 角色要求】
请围绕【核心意象】设计一个轻手绘的小图形或小角色。

图形要求：
1. 轮廓简洁，线条轻松；
2. 不追求精密矢量感，允许轻微手绘不规则；
3. 表情或动作要有记忆点；
4. 图形不要太大，不要压过文字；
5. 可以带一点拟人化、幽默感或生活气息；
6. 不要画成复杂插画，不要做成厚重吉祥物。

【字标要求】
1. 品牌名 / 项目名必须清晰可读；
2. 字标应有轻手写感、松弛感、独立小店感；
3. 可以是中文、英文或中英混排；
4. 字距、大小、位置可以略有变化，形成自然节奏；
5. 可以加入少量英文小字、拼音、小 slogan、年份、符号；
6. 文字不能太工业化、太严肃、太厚重；
7. 文字要像和图形一起被设计出来，而不是后期随便打上去。

【构图要求】
整体构图应轻盈、有呼吸感：
1. 图形可以在字标上方、旁边、穿插在字中，或与文字形成小互动；
2. 保持大量留白；
3. 主体不要过满，不要复杂背景；
4. 可以加入极少量小点、短线、弧线、小星星、小手写标注；
5. 整体应像一个独立 Logo，而不是海报或贴纸集合。

【色彩要求】
整体色彩应克制、清爽、有好感：
1. 通常以黑色线稿为主体；
2. 搭配 1～2 个小面积点缀色；
3. 可使用浅黄、天蓝、草绿、番茄红、淡粉、橙色、薄荷绿等；
4. 点缀色要小而准，不要大面积铺满；
5. 避免厚重渐变、复杂阴影、高饱和满版配色；
6. 颜色应像“轻轻点一下”，而不是强行制造冲击。

【质感要求】
1. 线条有手绘感；
2. 形状略带稚拙但可控；
3. 整体干净；
4. 可以有少量不规则笔触；
5. 不要太精密，不要太商业模板化；
6. 不要过度粗糙或凌乱。

【风格关键词】
治愈系手绘趣味字标 Logo、Healing Hand-drawn Playful Wordmark Logo、松弛感手绘图文 Logo、独立小店 Logo、生活方式品牌 Logo、轻手绘、小意象、童趣但不低幼、治愈、可爱、松弛、留白、少量点缀色、手写字标。

【验收标准】
请确保最终结果满足：
1. 图形简单但有巧思；
2. 品牌名清晰可读；
3. 整体有手绘松弛感；
4. 留白充足；
5. 配色克制但有记忆点；
6. 不低幼、不杂乱、不商业模板化；
7. 像真实小众品牌可以使用的 Logo；
8. 具备治愈、趣味、生活方式气质。

【输出要求】
请最终输出一个高完成度的「治愈系手绘趣味字标 Logo」。它必须以轻手绘图形为核心识别，以松弛字标为辅助结构，以少量点缀色和大量留白形成清爽、可爱、治愈、有生活感的品牌标志。
```

| ![](https://pbs.twimg.com/media/HI5vIk7XAAAGmJJ?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HI5vJinXEAANtoy?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


---

#### 手绘风格类


```
Please redraw the attached image in the most clumsy, messy, and hopelessly pathetic way possible. Use a white background and make it look like it was drawn in MS Paint with a mouse. It should vaguely resemble the original, but not really — like it’s kind of correct in some places yet strangely off and awkward overall. Emphasize a low-quality, pixelated look, and make it appear ridiculously badly drawn. …Actually, never mind — just draw it however you want in a sloppy way.
```

![](https://pbs.twimg.com/media/HH2c8r3bEAAW3sP?format=jpg&name=large)


```
把这张参考图改成一幅温柔、略带稚拙的绘本风格插画，仿佛出自孩童之手，用蜡笔重新绘制而成。
人物的面部、手部和衣着细节都以柔和圆润的线条勾勒，避免了过多的刻画。
色彩运用并非局限于传统色彩，而是自由地运用了明亮的粉彩色调。
粉色、薄荷绿、柠檬黄、薰衣草紫和浅蓝色随意混合，以孩童般的想象力重新诠释。
线条略显稚拙，色彩也呈现出蜡笔特有的粗糙质感、不均匀、晕染和污渍。
画面布局自然，仿佛孩童用画笔点缀着珍贵的回忆。
整体画面柔和地融合了孩童蜡笔画的梦幻世界。
这是一张充满怀旧气息、可爱又略带感伤的照片，值得珍藏在相册里。
```

| ![](https://pbs.twimg.com/media/HHx_-mLW8AAuI0Q?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHx_-mKWAAUdtNZ?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
create the most minimal abstract representation of this through the medium of a terrible pencil drawing (clean, new white paper)
```

| ![](https://pbs.twimg.com/media/HIGwhY5W0AEQgzk?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIG7JcmXMAAJUzg?format=jpg&name=medium) |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |


```
A black and white pencil sketch in an abstract, minimalist hatching style, where parallel, roughly drawn lines are used sparingly to suggest the form and tone of the input image. Intersecting lines are kept to a minimum, primarily in the darkest areas, with most tones achieved through varying densities of single-direction hatching. This minimalist approach focuses on simple, distinct pencil strokes and negative space on white, slightly textured paper, capturing the essential form of the original image with a lightweight, clean, and less dense feel.
```

| ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_21_07_42.png) | ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_21_10_47.png) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |


```
手绘素描风格插画，三位女性在咖啡馆柜台旁愉快地交谈，背景是整齐排列的餐具，线条自由随意，铅笔或笔触般的粗犷线条勾勒，轻松亲密放松的氛围，夏季配色，采用米白、黄色、黑色、陶土色和蓝灰色。
```

| ![](https://pbs.twimg.com/media/HIqpHcjaIAAM8fx?format=jpg&name=large) |
| ---------------------------------------------------------------------- |


```
{
  "style": "Notion-style minimalist editorial aesthetic",
  "color_scheme": "black-and-white monochrome",
  "art_style": [
    "clean line art",
    "flat monochrome design",
    "simple shapes",
    "subtle hand-drawn feel",
    "minimal detail",
    "soft playful character style"
  ],
  "background": {
    "type": "clean white background",
    "layout": "neat modern layout"
  },
  "subject": {
    "description": "[subject]",
    "outfit": "[outfit]",
    "action": "[doing action]",
    "facial_expression": "[facial expression]"
  },
  "composition": {
    "posture": "expressive posture",
    "detail_level": "minimal"
  },
  "prompt_template": "A simple black-and-white illustration of a [subject] in [outfit], [doing action], with a [facial expression] expression, in a Notion-style minimalist editorial aesthetic, clean line art, flat monochrome design, simple shapes, subtle hand-drawn feel, minimal detail, expressive posture, clean white background, neat modern layout, soft playful character style."
}
```

![](https://pbs.twimg.com/media/HHr9DXmWkAA548V?format=jpg&name=large)

```
一个简单的黑白插图，【描绘一个拿着手机喝着咖啡的职场女士】，采用 Notion 风格的极简编辑美学，干净的线稿，扁平单色设计，简单形状，微妙的手绘感，最小细节，富有表现力的姿势，干净的白色背景，整洁的现代布局，柔和俏皮的角色风格
```

![](https://pbs.twimg.com/media/HHnfkAobIAAEDbC?format=jpg&name=large)

---
#### 商业插画类

```
将输入图片转化为适合社交媒体头像的 1:1 极简线条插画。不要复刻外形，不描写细节，不追求完整，而是从原图中提炼最核心的神态、气质与轮廓关系，用最优化的最适合的笔数完成传达。每一笔都是经过审美判断的必要表达，少而准确，简而传神。

线条应像毛笔或速写落笔，流畅、圆润、舒展，带有轻重、停顿、呼吸与节奏感。允许断线、留白、停顿和弧度起伏，让画面自由生长。不要机械描边、碎裂轮廓或模板化结构；不刻画五官细纹、毛发、叶脉、衣物褶皱，不写实、不阴影、不体积、不纹理。

构图集中、醒目，留白充分，确保在小尺寸和圆形裁切下仍能辨认主体。背景顺应原图气质或用户指定颜色，沉稳、纯净、深色调，突出白色或浅色线条。可有极少量轻巧点缀，但必须克制、自然、不喧宾夺主，贴合主体节奏和神韵。

最终效果应极简、少而有力、松而有神，每一笔都传递对象的神态、姿态和生命感，呈现大师级的抽象表达与审美判断。
```

```
将输入图片转化为极简线条插画。不要复刻外形，不描写细节，不追求完整，而是从原图中提炼最核心的神态、气质与轮廓关系。每一笔都是经过审美判断的必要表达，少而准确，简而传神。

线条应像毛笔或速写落笔，流畅、圆润、舒展，带有轻重、停顿、呼吸与节奏感。允许断线、留白、停顿和弧度起伏，让画面自由生长。不要机械描边、碎裂轮廓或模板化结构；不写实、不阴影、不体积、不纹理。

构图集中、醒目，留白充分。背景顺应原图气质或用户指定颜色，沉稳、纯净、深色调，突出白色或浅色线条。可有极少量轻巧点缀，但必须克制、自然、不喧宾夺主，贴合主体节奏和神韵。

最终效果应极简、少而有力、松而有神，每一笔都传递对象的神态、姿态和生命感，呈现大师级的抽象表达与审美判断。
```

| ![](https://pbs.twimg.com/media/HH4gHMEbYAAHVVE?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH4gGCWa0AAnYz_?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
A contemporary indie graphic illustration isolated on a perfectly solid sterile pure white background, rendered entirely in crisp bold [color] ink outlines. The character is an anthropomorphic [subject] in a dynamic [pose/action], full of energy and personality. Large, uniquely shaped, highly expressive contemporary cartoon eyes and a wide joyful open mouth. Simple modern limbs, clean minimalist design. Select details shaded with precise [color] halftone screenprint dot textures, while the main body remains clean solid white. Pure [color] and white only. Modern screenprinted graphic aesthetic, bold composition, high visual impact.
```

| ![](https://pbs.twimg.com/media/HKXfusuasAAyimX?format=jpg&name=4096x4096) | ![](https://pbs.twimg.com/media/HKXfu95bEAA2NMw?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |



```
{
  "ImageStyle": "手绘插画风格，带有复古动画与绘本感的平面艺术表现",
  "SceneDescription": "整体呈现为柔和、童趣、奇幻的手绘插画美学。画面采用扁平化构图与装饰性线条，视觉语言偏向复古漫画、儿童绘本和日系独立插画。整体比例为竖向画幅，画面由多个插画场景共同构成统一的视觉氛围，但重点不在具体分区，而在其轻盈、梦幻、带有叙事感的艺术风格。背景以浅色纸张质感和柔和自然色为主，局部穿插更丰富的绿色自然场景与细密图案。整体忽略文字、标识和水印，仅分析画面美学。",
  "styleAesthetic": {
    "overallVibe": "温柔、奇幻、童趣、复古、轻松，带有手作感和独立艺术插画气质。",
    "colorPalette": {
      "background": "以米白、奶油色、浅绿色、薄荷绿、淡青绿色为主，整体背景柔和、低饱和，具有纸张般的温暖底色。",
      "accents": [
        "珊瑚红",
        "番茄红",
        "柔黄色",
        "淡蓝色",
        "深黑色",
        "森林绿",
        "浅灰紫",
        "暖米色",
        "橙色点缀"
      ]
    },
    "materialsAndTextures": [
      {
        "type": "线条质感",
        "description": "线条细腻、手绘感明显，轮廓略带自然的不规则感，呈现轻松随性的插画笔触。"
      },
      {
        "type": "色块质感",
        "description": "颜色多为平涂，带有轻微颗粒感和印刷感，避免强烈写实明暗。"
      },
      {
        "type": "纸张质感",
        "description": "整体底色接近温暖的纸面效果，呈现柔和、哑光、略带复古的视觉质地。"
      },
      {
        "type": "自然装饰纹理",
        "description": "植物、草地、云雾、水流和地形等元素以重复的小形状、卷曲线条和装饰性图案表现，具有图案化与童话感。"
      }
    ],
    "lightingAndShadows": {
      "description": "光线柔和且分散，没有明显强光源。阴影极少，主要依靠线条层次、色块对比和浅灰色局部暗面来区分形体。"
    },
    "keyPoint": "整体美学重点在于圆润简化的造型、扁平透视、低饱和复古配色、细密装饰线条、柔和纸面质感，以及童话式的奇幻想象氛围。画面通过自然元素、图案化细节和轻松的手绘轮廓形成统一的绘本式视觉风格。",
    "moodKeywords": [
      "手绘",
      "童趣",
      "奇幻",
      "复古",
      "柔和",
      "绘本感",
      "日系插画",
      "平面化",
      "梦幻",
      "装饰性"
    ]
  }
}
```

![](https://pbs.twimg.com/media/HHuneIDWIAYhJrZ?format=jpg&name=large)


```
极简线条艺术，采用二维扁平矢量风格。仅在适合的背景下勾勒轮廓，无阴影、无细节。简化形状，流畅曲线，现代抽象风格。
```

| ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_20_16_21.png) | ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_20_31_47.png) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |


```
Clean flat vector illustration, thick black outlines, light grey background, bold typography, simple mobile-friendly layout.

Limited flat colors: black, white, grey, green, blue, with small psychedelic gradient accents on sneakers, stickers, and icons.
Minimal readable text, no clutter, no tiny UI panels.

Modern Gen-Z tech poster style, coding lifestyle, clean editorial hero image, polished vector artwork.
No photorealism, no 3D, no messy details, no unreadable text.
```

| ![](https://pbs.twimg.com/media/HITjIema8AAtN1-?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HITjWSIaUAAuKF8?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Create a flat, cartoon-style digital portrait of [Albert Einstein] in a bold, playful aesthetic. Give the character simplified features with pink skin, large round eyes, and a friendly expression. Keep all outlines thick and clean. Dress the character in an outfit that’s iconic or recognizable for them, simplified to match the cartoon style. Use solid colors only, no gradients or shading. Bright yellow background. Square aspect ratio.
```

| ![](https://pbs.twimg.com/media/GsbOY7sWgAAG5NB?format=jpg&name=large) | ![](https://pbs.twimg.com/media/GsbOY70XQAA13hK?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |



```
retexture this image into the following JSON style aesthetic and keep the images geometry completely intact：   

  
{
"attention": [
"Detail Restoration",
"Rich in detail",
"Style Consistency",
"Transferable Visual Language",
"Ignore text, watermark, logo and unrelated graphic marks"
],
"ImageStyle": "手绘线稿插画结合复古丝网印刷风格，具有有限色盘、粗糙油墨颗粒、布面或纸面印刷纹理、蓝白主色对比和少量橙红套色点缀。整体更接近复古 T 恤图案、海报版画、手工丝印插画，而非写实绘画或干净矢量图。",
"SceneDescription": "整体视觉系统以单个主体为视觉核心，主体通常独立悬浮在纯色或近似纯色背景中，周围用飞溅、星点、速度线、水花、涂鸦式短线或局部色块增强动势。主体与背景之间依靠强烈的蓝白反差形成清晰分离，背景不承担真实空间叙事功能，而是作为平面化色场衬托线稿。画面留白明确，主体轮廓外常有不规则白色负形、飞溅形边缘或手工刷印边界。视觉重心集中于主体及其内部结构线，空间层次浅，依靠线条密度、局部橙红色强调和不规则色块形成节奏。",
"sform": "主体形态以可识别的物体轮廓为基础，比例基本写实但带有手绘插画化的夸张和简化。物体常呈漂浮、旋转、飞溅、下坠或穿越画面的动态感，轮廓带轻微变形和手绘不稳定性。结构细节通过密集线条、排线、断裂轮廓和装饰性运动线表达，机械结构、液体形态、网状结构或折纸形态都被转译为线稿化、版画化的平面图形。动态轨迹常由弧线、短划线、飞散小点和流动形白色块面构成。",
"styleAesthetic": {
"overallVibe": "复古运动海报与手工丝网印刷结合的街头插画气质，轻松、怀旧、粗粝、有动感，带有校园 T 恤图案和独立品牌印花的视觉感受。",
"colorPalette": {
"background": "背景以高饱和钴蓝、皇家蓝或略偏冷的深蓝为主，也可出现暖白或米白纸张底色。背景通常为纯色或近似纯色，但表面保留明显布纹、纸纹、油墨颗粒和扫描噪点，没有复杂空间背景。",
"mainColors": [
"白色占据主体轮廓、负形、水花、线稿高光和大面积视觉块面，是最主要的图形色，用于建立强烈对比和主体识别度",
"深蓝或蓝色线条用于勾勒主体内部结构、阴影排线和装饰运动线，在白色主体区域内形成手绘草图感",
"橙红色或淡红色少量出现于局部填色区域，用于强调主体重点、运动焦点或小面积装饰"
],
"accents": [
"橙色通常用于球体、标签、局部图案或视觉焦点，使画面在蓝白体系中产生复古互补色冲击",
"红色或粉红色以轻微套色线、局部填充或边缘偏移形式出现，增强手工印刷的不完美感",
"米白色或纸白色用于背景留白、主体大块负形和高光，使整体更像印刷在纸张或布料上的图案"
],
"colorLogic": "有限色盘，高对比双色为主，蓝白构成主视觉，橙红作为小比例强调色。配色避免真实光色和复杂渐变，强调丝网印刷的平涂、套色和局部偏移效果。"
},
"lineAndStroke": {
"lineQuality": "线条呈手绘速写与版画刻线混合质感，粗细不均，有轻微抖动、断裂和干刷颗粒。线条不是干净矢量边，而是带油墨残缺和手工描绘的不稳定性。",
"outline": "主体轮廓线明显但不完全闭合，局部边缘会被飞溅、留白或印刷颗粒打断。轮廓粗细变化较大，外轮廓具有毛边、破损边和手绘偏移感。",
"innerDetails": "内部细节依靠排线、交叉线、结构线、装饰短线、速度线和细碎纹理线表现。局部高密度线条用于描绘网格、金属结构、折痕、瓶身轮廓或阴影转折。",
"strokeDensity": "主体内部细节密度中高，关键结构区域线条密集；背景区域相对简洁，仅保留少量星点、飞溅和运动线作为装饰。"
},
"compositionAndSpace": {
"composition": "主体通常居中或轻微偏心，采用近景图案式构图，周围留出明确呼吸空间。主体可被不规则色块、飞溅轮廓或装饰线包围，形成适合印刷图案的独立徽章式画面。",
"perspective": "以平面化视角为主，部分主体带轻微透视或局部近大远小关系，但整体不追求真实三维空间。透视服务于动态姿态和图形识别，而非写实空间。",
"spatialDepth": "空间深度较浅，背景与主体明显分离。层次主要由背景色、白色主体块面、蓝色线稿和橙红点缀依次叠加形成。",
"visualFocus": "视觉焦点通过高对比蓝白关系、主体尺寸、线条密度和少量橙红强调色形成。动态方向由飞溅、弧线、速度线和主体倾斜角度引导。"
},
"materialsAndTextures": [
{
"type": "画面媒介质感",
"description": "整体像手绘草图经过丝网印刷或复古 T 恤印花处理，具有油墨压印、纸张或布料承载的物理质感。"
},
{
"type": "表面纹理",
"description": "可见布纹、纸纹、颗粒噪点、油墨不均、半调式细点、印刷掉色、边缘毛刺和轻微套色错位。蓝色背景和白色图形表面均有细密纹理，不是平滑数字填色。"
},
{
"type": "细节处理",
"description": "细节为局部精细整体简化，主体结构线丰富但不追求真实渲染。装饰线和阴影线具有符号化、速写化、版画化特征。"
}
],
"lightingAndShadows": {
"description": "画面几乎没有真实光源，主要使用平涂色块和线稿排线表达体积。明暗关系来自蓝白高对比，而非自然光照。局部高光通过白色留白和断裂线表现，阴影通过蓝色排线、密集刻线或局部色块暗示。",
"shadowStyle": "线稿排线阴影和版画式阴影为主，没有写实投影，也没有柔和渐变阴影。",
"highlightStyle": "白色留白高光明显，局部以破碎白色块、飞溅形白点和高对比轮廓表现反光或运动中的亮部。"
},
"renderingTechnique": {
"detailLevel": "中高细节，主体重点区域精细描绘，背景和空间信息高度简化。",
"edgeTreatment": "边缘多为硬边但不规则，带手绘毛边、破损边、印刷溢墨边和局部断裂。",
"fillStyle": "以平涂、留白和局部填色为主，少量区域使用颗粒填充、排线填充或网点式纹理。没有大面积平滑渐变。",
"imperfections": "存在刻意的不完美，包括线条抖动、油墨颗粒、纸布纹理、轻微套色偏移、边缘掉墨、扫描感和手工印刷误差。"
},
"keyPoint": "可迁移风格核心是：将任意主体处理成复古手绘丝网印刷插画，主体轮廓清晰但带手绘抖动和破损边，内部使用密集蓝色速写线、排线和结构线；配色使用高对比蓝白有限色盘，并以少量橙红色作为局部焦点；背景采用纯色蓝或米白纸布底，保留布纹、纸纹、油墨颗粒和套色误差；细节集中在主体结构，背景简洁并辅以飞溅、速度线、星点或短划装饰；无真实光源，以平涂、留白和线稿阴影建立体积；整体氛围为复古、运动感、街头印花、手工制作和轻微粗粝感。",
"moodKeywords": [
"hand-drawn illustration",
"screen print",
"retro t-shirt graphic",
"limited color palette",
"blue and white contrast",
"orange accent",
"sketchy line art",
"ink grain texture",
"misregistration",
"dynamic motion lines",
"flat graphic composition",
"vintage poster style"
]
},
"promptForRecreation": {
"positivePrompt": "Create an illustration of any chosen subject in a retro hand-drawn screen print style, like a vintage T-shirt graphic or independent poster print. Use a strong limited palette dominated by saturated royal blue and off-white, with small orange-red accent areas for visual focus. The subject should be centered or slightly off-center, isolated against a simple flat background, with clear negative space and shallow spatial depth. Draw with uneven sketchy ink lines, broken outlines, dense internal hatching, structural contour lines, small motion marks, splashes, stars or short decorative strokes around the subject. Use flat fills, white cutout shapes, rough ink grain, visible fabric or paper texture, slight color misregistration, distressed edges and handmade printing imperfections. Avoid realistic lighting; use line hatching and high-contrast white highlights instead of soft shadows. Medium-to-high detail on the subject, minimal background, energetic retro streetwear print mood.",
"negativePrompt": "photorealistic, glossy 3D render, smooth vector art, clean corporate icon, excessive gradients, realistic shadows, cinematic lighting, complex background scenery, full-color realistic palette, polished digital airbrush, overly smooth edges, plastic texture, cluttered composition, unreadable details, text, logo, watermark, signature, website mark, low resolution, distorted structure, random layout panels"
},
"styleTransferTemplate": {
"usage": "当用户想用同样风格生成其他主体时，使用此模板。",
"template": "Create [目标主体 / target subject] in the same visual style as the reference image: retro hand-drawn screen print illustration, vintage T-shirt graphic look, uneven sketchy ink outlines, broken hand-drawn linework, dense internal hatching and structural contour lines, limited royal blue and off-white palette with small orange-red accents, flat simple background or paper/fabric color field, visible ink grain, fabric texture, distressed edges and slight color misregistration, no realistic light source, line-based shadows and white cutout highlights, centered or slightly off-center isolated subject with shallow space and dynamic decorative motion marks, medium-to-high subject detail with minimal background, nostalgic energetic handmade print atmosphere. Avoid text, logo, watermark, photorealism, glossy 3D, overly smooth vector rendering, excessive gradients and unrelated layout descriptions."
}
}
```

| ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_21_43_30.png) | ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月12日_21_45_49.png) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |


```
Create a trending anime art style image from the uploaded subject. Use confident line-work with slight variation and minimal cel shading using flat shadow shapes. Use bright, saturated colors and clean graphic lighting. The style is defined by exaggerated, cartoonish character proportions featuring highly expressive, simplistic facial features that allow for immense emotional range, with highly varied stretched anatomy.Transform the environment into a slightly warped space with playful perspective distortion and simplified objects. Composition and tone should be energetic, lively, and comedic in a fully stylized, non-realistic world
```

![](https://pbs.twimg.com/media/HHzkhkVboAAeLeF?format=jpg&name=large)


```
Please transform the entire image into a single Decorative Folk Flat Illustration with Doodle elements. Use a bold and playful color palette, completely different from the original image. Simplify all details into clean, flat shapes with a handmade, slightly imperfect feel, as if drawn on a sheet of white paper. The overall style should look cute, childlike, and whimsical.
```

| ![](https://pbs.twimg.com/media/HHz7pz-boAAvv_3?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHz7p6Ia0AAMvfG?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
柔和手绘线条风格，用笔在笔记本上书写的女孩，旁边坐着一只白猫和冒着热气的咖啡，简洁圆润的构图，保留墨水质感的粗犷线稿，温暖日常的氛围，简约沉稳的色彩搭配，使用峰值蓝、芥末黄、珊瑚粉与象牙色配色。
```

| ![](https://pbs.twimg.com/media/HIQ5ZQiaEAAOLmt?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIQ5r4PaUAADOXr?format=jpg&name=medium) |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |


```
白色背景上，描绘“双胞胎男孩在公园玩耍的场景”的无轮廓线厚涂风时尚插画。多个全身人物一个一个独立排列，像纸上的时尚速写页或杂志造型草图。背景保持留白，不做细致描绘。
人物不使用轮廓线，而是仅通过色块边界、明暗关系和笔触来塑造身体、服装与姿态。画法类似水粉、海报颜料、马克笔、丙烯颜料，质感不透明，略显粗粝。保留明显笔刷痕迹、干擦感和轻微不均匀的上色效果，不追求完全平滑或精致。
人体比例略作简化，整体稍微拉长，偏向时尚插画比例。面部描写尽量简洁，五官淡化，重点放在服装设计、整体轮廓、姿态和色彩搭配上。
人物穿着 {服装风格}，正在进行 {姿势・动作}。

配色采用灰粉色、米色、棕色、黑色、奶油色、灰蓝色、橄榄色、芥末色、暗红色等沉稳、低饱和的色调。整体具有杂志插图般知性、洗练、编辑感的氛围，略带不完美，却有手工绘制的温度。
负面提示词：
不要轮廓线，不要动漫风，不要3D，不要照片风，不要写实摄影感，不要精细背景，不要高饱和色彩，不要过度光滑，不要塑料质感，不要复杂场景，不要夸张表情，不要精致五官刻画。
```

| ![](https://pbs.twimg.com/media/HIMIKubbkAAG0D7?format=jpg&name=large) |
| ---------------------------------------------------------------------- |


```
{
  "task": "image_style_transformation",
  "input_description": "Transform the entire image into a Decorative Folk Flat Illustration with doodle elements.",
  "style": {
    "art_style": "Decorative Folk Flat Illustration",
    "sub_style": "Doodle, handmade illustration",
    "visual_tone": "cute, childlike, whimsical",
    "shape_language": "simple clean flat shapes with slightly imperfect hand-drawn feel",
    "detail_level": "highly simplified",
    "texture": "flat, paper-like, no gradients",
    "canvas_look": "white paper background aesthetic"
  },
  "color_palette": {
    "type": "bold and playful",
    "constraint": "completely different from original image",
    "saturation": "high",
    "contrast": "medium to high",
    "mood": "joyful, vibrant, expressive"
  },
  "composition_rules": {
    "simplification": "reduce all complex details into minimal geometric forms",
    "line_work": "slightly uneven hand-drawn lines",
    "icons_elements": "add doodle accents such as stars, hearts, swirls, small flowers",
    "balance": "visually balanced but intentionally imperfect and organic"
  },
  "transformation_guidelines": {
    "preserve_subjects": true,
    "reinterpretation_level": "high stylization",
    "realism": "none",
    "depth": "flat 2D only",
    "lighting": "no realistic lighting or shadows"
  },
  "output_goal": "A whimsical folk-inspired flat illustration that feels playful, handcrafted, and visually simplified while retaining the essence of the original image"
}
```

| ![](https://pbs.twimg.com/media/HH5EQ9jacAArtrh?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH5EQ-wbUAE8i-l?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
简约线条插画风格，画面采用扁平轻盈的形态，以细腻均匀的线条勾勒而成，整体氛围宁静而沉稳。色调以黑白灰为主，辅以淡珊瑚色作为点缀，呈现出低调而精致的配色方案。
```

| ![](https://pbs.twimg.com/media/HIBzS6CawAAjmQt?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HICr3dubMAA74ZI?format=jpg&name=large) |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
将参考图或指定内容转换为极简主义高级图形海报。

保留原始内容的核心主体、构图、空间关系和视觉层级，但将所有内容重新诠释为超干净的单色线条艺术。

风格为瑞士现代主义海报设计、极简矢量插画、单线描绘、中世纪编辑插画、建筑线稿、当代图形海报、高端品牌视觉、美术馆级印刷海报。画面应具有清晰的几何构图、精准透视、干净留白和高级编辑排版感。

仅使用一种主墨色和一种背景色。根据主题自动选择最适合其气质的高级单色配色。不要彩虹色，不要过度霓虹，不要复杂渐变，不要多色插画。

线条必须极细、精准、稳定、优雅，具有矢量级清晰度。将纹理、人物、物体、环境和背景细节转化为有节奏、有秩序的线条结构。尽量减少色块填充，细节丰富但绝不杂乱。

构图采用竖版海报布局，视觉中心清晰，留白平衡，元素排列符合现代主义网格系统。整体应像高端品牌宣传图、艺术展海报、精品杂志封面或艺术书籍封面。

如果画面包含文字，文字必须清晰、可读、专业设计，不要随机符号、伪文字、断裂字母或变形字体。文字排版应符合瑞士现代主义编辑设计。

氛围：安静、克制、现代、永恒、高级、极简但细节丰富，适合印刷、收藏、展览和高端视觉传播。

输出：超高分辨率，8K，可直接印刷，矢量级渲染精度，边缘干净，无噪点，无模糊。
```

| ![](https://pbs.twimg.com/media/HH2qEQRaAAA0-e9?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH2qERlbIAAySrz?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
请根据最后输入的主题创作一幅超高分辨率竖版极简线条城市海报。

如果主题是一座城市，请先理解这座城市的核心气质，从空间景观、街头生活、人文风情、商业氛围、饮食记忆、地方文化、历史层次与日常节奏中提炼视觉线索，并将这些线索自然组织进同一幅完整而统一的城市画面之中，使画面呈现真实而鲜活的城市切面，而不是零散拼贴。

如果主题是具体街道、街区、地标、商圈或代表性地点，请以该地点的真实空间关系为核心，准确呈现街道结构、建筑界面、店铺招牌、交通设施、文字系统、人群状态与现场氛围，并保留其最有辨识度的在地特征。

如果主题包含地址、坐标或参考图片，请优先依据真实信息理解场景，不要凭空杜撰，不要随意替换地点特征，不要画成与实际地点无关的通用城市景观。

整体画面应避免廉价旅游宣传式表达，不做明信片式直白展示，而是捕捉一个真实、精致、富有生活感的城市瞬间。让建筑、街道、标牌、橱窗、街头设施与人物活动自然共生，地标克制地融入环境，不夸张，不喧宾夺主。人物应体现本地真实穿着、年龄层次、生活方式与行动节奏，可出现通勤、步行、交谈、骑行、购物、等候、用餐或休憩等自然状态。

画面采用竖版正面街头视角，使用极简矢量线描、纤细准确的单线、清晰几何透视、克制留白与高密度但有秩序的细节组织，形成安静、现代、灵动且高级的视觉秩序。整体应具有城市品牌视觉与收藏级旅行海报的完成度。

顶部设置醒目的主标题，副标题使用当地语言与国家或地区信息。所有街头文字、招牌与排版必须清晰、自然、真实、专业，避免乱码、错误文字与随意拼写。

关于色彩，请不要从固定选项中机械挑选，也不要让不同城市反复落入相似的配色模板。请先理解主题本身的气候、光线、时间感、建筑材料、历史气息、产业结构、商业温度、饮食印象、自然环境与情绪质地，再由这些因素综合提炼出专属于该主题的主色与底色关系。每个主题的颜色都应是独立生成的，具有明确的在地性与审美依据，而不是套版结果。允许颜色呈现温度、湿度、年代感、都市能量或文化性格上的差异。主色负责建立城市的精神气质，底色负责提供空气感与纸感，两者共同构成统一而鲜明的单色印刷美学。即使只使用一组主色与底色，也应通过线条疏密、明度层次、局部压重、留白比例与细节节奏形成丰富而细腻的视觉变化，避免单调和平铺。

最终成品需呈现超高分辨率、可打印、线条清晰、细节丰富、风格统一、审美高级的城市海报效果。

主题：上海外滩
```

| ![](https://pbs.twimg.com/media/HIB-gvmaQAAHSrB?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HICAXauaYAAO6xr?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Create a vertical mid-century travel poster for [CITY NAME] featuring [LANDMARK]. Use a strict 3-color palette: cream paper, black technical linework, and [COLOR].
Style: Minimalist isometric bird's-eye view with ultra-fine hatching and screen-print texture.
Color usage: Solid flat [COLOR] for the entire sky and small accents on roofs or streets. No gradients.
Text: Bold sans-serif "[CITY NAME]" at top in cream, with the local language name in smaller cream text below.
```

| ![](https://pbs.twimg.com/media/HH-VFGqaIAE0yEf?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HH-VFVraMAA2n9n?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
Create a vertical mid-century travel poster for [CITY NAME] featuring [LANDMARK]. Use a strict 3-color palette: cream paper, black technical linework, and [COLOR].
Style: Minimalist isometric bird's-eye view with ultra-fine hatching and screen-print texture.
Color usage: Solid flat [COLOR] for the entire sky and small accents on roofs or streets. No gradients.
Text: Bold sans-serif "[CITY NAME]" at top in cream, with the local language name in smaller cream text below.
```

| ![](https://pbs.twimg.com/media/HIFwjiMXIAA4bqi?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIFwj6NXsAAVcYH?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |



```
retexture this image into the following JSON style aesthetic and keep the images geometry completely intact：

{
  "size": "16:9 landscape ratio",
  "attention": [
    "Detail Restoration",
    "Rich in detail",
    "Style Consistency",
    "Transferable Visual Language",
    "Ignore text, logos, watermarks, and unrelated graphic marks"
  ],
  "ImageStyle": "Minimal monochrome graphic illustration with bold black-and-white contrast, poster-like composition, ink-inspired mark-making, and simplified yet dramatic visual storytelling. The style blends modern poster design, editorial graphic art, and expressive brush or line-based illustration, using a single-color palette and strong silhouette emphasis.",
  "SceneDescription": "The image style presents a single dominant subject as the clear focal point, isolated within a clean, highly controlled composition. Visual language is reduced to essential forms, with the scene constructed through bold silhouette masses, sharp contour definition, and strong negative space. Background elements, if present, are simplified into large graphic shapes or minimal environmental cues rather than detailed scenery. The composition feels deliberate and striking, with a cinematic sense of placement and a poster-like clarity. Visual complexity comes not from color variety, but from contrast, shape balance, selective detail, and directional strokes that imply energy, atmosphere, or space.",
  "sform": "The subject is represented through simplified but recognizable morphology, with strong emphasis on overall silhouette, gesture, posture, and directional form. Shapes are often elongated, sharpened, or compressed for visual impact rather than strict realism. The body, object, or structure should read clearly from a distance. Internal detail is selective, focusing on key structural lines, folds, contours, mechanical parts, or gesture-defining elements. Action or presence is conveyed through pose, compositional angle, and graphic motion cues rather than subtle realism.",
  "styleAesthetic": {
    "overallVibe": "Bold, clean, dramatic, modern, graphic, minimal, high-impact, and artistically restrained. The mood is powerful and visually confident, often cinematic or iconic, with a refined editorial poster sensibility. The style feels both contemporary and timeless because it relies on pure composition, strong value contrast, and simplified artistic expression.",
    "colorPalette": {
      "background": "Usually a flat light or dark field, often off-white, cream, beige, charcoal, or black, depending on inversion of the contrast scheme.",
      "mainColors": [
        "A single dominant dark tone, typically black, ink black, charcoal, or deep gray, used for the subject and major graphic elements",
        "A single light ground tone, such as white, ivory, warm paper beige, or pale gray, used as the supporting field or negative space"
      ],
      "accents": [
        "Minimal tonal variation only within the same monochrome family, used for subtle depth, brush texture, or soft separation without breaking the one-color visual system"
      ],
      "colorLogic": "Strict single-color or near-monochrome palette. The image depends on value contrast rather than hue contrast. The visual effect comes from the tension between dark shape masses and light negative space, with no need for multicolor rendering."
    },
    "lineAndStroke": {
      "lineQuality": "Expressive, confident, and economical. Lines may be sharp, tapered, brush-like, ink-like, or cleanly graphic depending on the subject, but always feel intentional and stylized rather than sketchy or hesitant.",
      "outline": "Outer contours are clearly defined and often bold, helping the silhouette stand out strongly from the background. Contours may vary in thickness to add rhythm and emphasis.",
      "innerDetails": "Internal lines are selectively placed to describe important folds, structure, motion, texture, or volume. These details are reduced to essentials and never overwhelm the composition.",
      "strokeDensity": "Low to medium overall, with higher density concentrated in focal areas. Broad areas of empty or minimally treated space are preserved to maintain clarity and graphic impact."
    },
    "compositionAndSpace": {
      "composition": "Strong, poster-like composition with one dominant subject and a clear visual hierarchy. The layout is typically asymmetrical or dynamically balanced, using large negative space to frame the subject and amplify its presence.",
      "perspective": "Perspective may range from lightly stylized to dramatic, depending on the subject, but it is always subordinated to graphic readability and visual impact. Angles may be cinematic, heroic, or dynamically foreshortened.",
      "spatialDepth": "Moderate depth, suggested through overlap, scale, and selective detail rather than fully rendered realism. Many areas remain intentionally flat or abstracted to preserve the graphic quality.",
      "visualFocus": "Focus is created through contrast, silhouette, central placement of the subject, directional line flow, and concentration of detail in key areas. The eye is guided by shape hierarchy and composition rather than color."
    },
    "materialsAndTextures": [
      {
        "type": "Graphic medium",
        "description": "The work appears as a digital or print-oriented illustration inspired by ink drawing, brush painting, linocut, woodcut, or poster art. It feels designed for strong visual reproduction and immediate readability."
      },
      {
        "type": "Surface texture",
        "description": "Textures may include subtle brush streaks, ink bleeds, grain, dry-brush edges, rough mark transitions, or slightly distressed graphic surfaces, but texture remains controlled and never overly realistic."
      },
      {
        "type": "Detail treatment",
        "description": "Detail is strategically simplified. Important areas receive crisp rendering, while secondary regions are flattened, abstracted, or left open. This creates a balance between richness and simplicity."
      }
    ],
    "lightingAndShadows": {
      "description": "Lighting is not rendered through realistic full-value modeling, but through sharp graphic contrast. Light and shadow are translated into clear black-and-white shape design. Highlights may appear as preserved paper or background color, while shadow masses are consolidated into bold dark forms.",
      "shadowStyle": "Shadow areas are large, clean, and decisive, often merged into unified black masses. Instead of soft transitions, shadows are designed as graphic shapes that strengthen the composition.",
      "highlightStyle": "Highlights are usually created by leaving light areas empty or minimally marked. They are crisp and structural rather than glossy or photorealistic."
    },
    "renderingTechnique": {
      "detailLevel": "Medium to high in focal areas, minimal elsewhere. The rendering is selective and disciplined, favoring iconic readability over full realism.",
      "edgeTreatment": "Edges alternate between crisp graphic cuts and expressive brush-like variation. Some edges may feather or break slightly to preserve artistic energy.",
      "fillStyle": "Large flat fills and solid dark masses dominate. These may be combined with selective linework, brush streaks, or carved-looking detail to enrich the image while preserving minimalism.",
      "imperfections": "Slight texture irregularities, brush artifacts, rough mark edges, or print-like inconsistencies may be present to enhance the handcrafted graphic feel."
    },
    "keyPoint": "The core transferable style is a minimal monochrome illustration built on a single-color palette, bold black-and-white contrast, strong silhouette design, simplified yet powerful forms, poster-like composition, large negative space, selective detail, expressive line or brush marks, and a clean modern graphic aesthetic. The image should feel striking, artistic, readable, and visually disciplined, without relying on text or multicolor rendering.",
    "moodKeywords": [
      "minimal monochrome",
      "graphic illustration",
      "modern poster",
      "bold contrast",
      "single-color palette",
      "strong silhouette",
      "negative space",
      "editorial design",
      "ink-inspired",
      "clean composition",
      "dramatic",
      "high impact",
      "stylized minimalism",
      "graphic storytelling"
    ]
  },
  "promptForRecreation": {
    "positivePrompt": "Create [SUBJECT] in a minimal monochrome illustration style with a strict single-color or near-monochrome palette. Use bold black-and-white contrast, strong silhouette design, and a clean modern poster aesthetic. Build the composition around one dominant subject with clear visual hierarchy, large negative space, and sharp graphic readability. Simplify forms while preserving a powerful recognizable silhouette and essential structural details. Use expressive but controlled linework or brush-like marks, solid dark shape masses, selective texture, and simplified environmental cues only when needed to support the composition. Emphasize clean artistic simplicity, dramatic contrast, and a striking editorial poster mood. The image should feel refined, bold, minimal, and visually impactful, with no text.",
    "negativePrompt": "Avoid multicolor rendering, realistic full-color painting, soft low-contrast shading, cluttered backgrounds, excessive detail everywhere, weak silhouette readability, noisy composition, photorealistic textures, glossy 3D rendering, busy decorative elements, overly complex color gradients, cute cartoon aesthetics, text, captions, logos, watermarks, and any elements that reduce the bold minimal poster quality."
  },
  "styleTransferTemplate": {
    "usage": "Use this template when generating other subjects in the same visual style.",
    "template": "Create [NEW SUBJECT] in a minimal monochrome graphic illustration style: single-color palette, bold black-and-white contrast, strong silhouette, modern poster composition, large negative space, clean artistic simplicity, selective detail, expressive line or brush-based marks, simplified background support, and a dramatic high-impact editorial aesthetic. No text."
  }
}
```

| ![](https://pbs.twimg.com/media/HH9hcqVasAAgioO?format=jpg&name=4096x4096) | ![](https://pbs.twimg.com/media/HH9hcmIbAAApUCm?format=jpg&name=4096x4096) |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |


```
Prompt:[DESTINATION] = (Seoul) Create a premium editorial travel poster illustration of [DESTINATION]. Style: flat vector illustration, ultra clean minimalism, mid-century modern aesthetic, editorial travel poster style (Scandinavian design inspired), no photorealism, no textures, no noise, no gradients Composition: vertical 4:5 poster layout, foreground: calm waterfront / road / natural edge midground: colorful local houses or buildings with clean geometric shapes background: iconic natural landscape or mountain of [DESTINATION] add 1–2 landmark structures (church, tower, bridge, etc.) subtly Architecture: simplified geometric buildings, clean edges, flat colors, slightly varied roof colors (harmonious palette, not random) Color palette: soft, cohesive, location-inspired colors pastel tones + muted contrast bright but not saturated (example: sky blue, coral, mustard, navy, soft green) Lighting: bright daylight, soft shadows, clean and fresh atmosphere Typography: add text at bottom center: "[DESTINATION]" (large, modern sans-serif, spaced letters) "[COUNTRY]" (small subtitle below) Mood: calm, clean, premium, slightly dreamy travel magazine feel Quality: ultra clean edges, perfect alignment, no distortion, high resolution, print-ready
```

![](https://pbs.twimg.com/media/HHub6tLa8AEStRa?format=jpg&name=medium)


```
Create a premium editorial travel poster illustration.

Style: flat vector illustration, ultra clean minimalism, mid-century modern aesthetic, editorial travel poster style inspired by Scandinavian graphic design and vintage tourism prints, no photorealism, no textures, no noise, no gradients.

Composition: vertical 3:4 poster layout, clean and balanced composition, layered depth with foreground, midground, and background elements, subtle human silhouettes and local lifestyle details integrated naturally into the scene.

Destination: [城市/地区], [国家].

Foreground: [前景内容，例如街道、植物、海岸、山路、建筑细节、人物活动等].

Midground: [中景内容，例如代表性建筑、城市景观、自然景观、当地生活场景等].

Background: [远景内容，例如山脉、海平线、天际线、岛屿、夕阳、云层等].

Iconic landmarks: [地标元素，例如教堂、城堡、桥梁、寺庙、塔楼、传统建筑等].

Architecture and landscape: [当地建筑或地貌风格，例如地中海白墙建筑、日式木结构、阿尔卑斯山村、沙漠城市等].

Color palette: [当地代表性色彩，例如白色、蓝色、陶土色、沙色、森林绿、雪山白等], bright yet restrained saturation.

Lighting: bright sunlit afternoon with soft shadows, fresh atmospheric feeling, peaceful refined mood.

Typography: add text at bottom center: “[目的地英文大标题]” large modern sans-serif with spaced lettering, “[国家/地区英文小标题]” small subtitle below.

Mood: calm, elegant, premium travel magazine aesthetic, slightly dreamy and culturally refined, quiet timeless atmosphere with sophisticated local charm.

Quality: ultra clean vector edges, perfect alignment and composition, high resolution, print-ready premium poster design.
```

| ![](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月14日_11_37_20.png) | ![](https://pbs.twimg.com/media/HINbsHmaoAAEYrt?format=jpg&name=large) |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
A simple black-and-white illustration of a [subject] in [outfit], [doing action], with a [facial expression] expression, in a Notion-style minimalist editorial aesthetic, clean line art, flat monochrome design, simple shapes, subtle hand-drawn feel, minimal detail, expressive posture, clean white background, neat modern layout, soft playful character style
```

![极简风格](https://pbs.twimg.com/media/HHjCDj9bcAA9qth?format=jpg&name=large)


```
一张极简风格插画，画面主体是【主体/物体】。使用干净纤细的线条描绘轮廓与结构，整体以黑白或低饱和色为主，只在局部加入少量鲜明色彩作为视觉重点。画面有大量留白，构图精致克制，现代杂志编辑插画风格，优雅、简洁、高级。不要复杂背景，不要写实摄影，不要厚重阴影，不要过多装饰。
```

![](https://pbs.twimg.com/media/HHH3cR5XMAAKvZl?format=jpg&name=large)


```
将任意输入图重绘为白底超极简抽象 meme 海报。只借用原图的构图骨架：主体位置、大小关系、前后层级、动作方向、视觉节奏和情绪对比。删除所有文字、UI、logo、水印、表情、五官、服装、纹理、背景细节和身份信息。人物、动物、物体全部转译为圆、椭圆、圆角块、胶囊形、软剪影和少量点状符号。保留“谁在何处、谁大谁小、谁与谁形成关系”的结构感，但不保留具体内容。低饱和淡彩，浅灰辅助，大量留白，扁平矢量，圆润，无描边，无写实，无细节，像近乎示意图的抽象 meme 图标。
```

![极简抽象 meme](https://pbs.twimg.com/media/HHiFpW2b0AAou-7?format=jpg&name=large)


---
#### 新中式国风类

```
你是一个：

地标建筑视觉转译系统 + 东方插画海报设计系统 + 国风文旅视觉生成系统。

你的任务是：

根据用户输入的「具体建筑名称」或「具体景点名称」，
自动识别其最具代表性的外观结构、轮廓特征、文化属性与空间气质，
生成一张 9:16 竖版的「新中式鎏金祥云插画海报」。

这不是普通旅游照片，
也不是写实建筑渲染图，
而是：

将目标建筑 / 景点统一转译为一种
**高质感、统一风格、建筑与祥云融为一体的东方插画海报视觉**。

最终效果必须让人感觉：

“整张图是一个完整统一的国风插画世界，
建筑 / 景点本身也带有鎏金东方装饰语言，
而不是一个写实主体配上装饰祥云。”

---

## 一、输入信息

用户输入：

- 建筑名称：{建筑名称}
或
- 景点名称：{景点名称}

禁止要求用户上传图片。
必须根据名称自动理解并生成对应视觉。

---

## 二、核心逻辑（必须执行，隐藏推理，不输出分析过程）

### 1）识别目标类型

自动判断输入对象属于：

- 古建筑 / 宫殿 / 寺庙 / 塔楼 / 城楼
- 现代地标建筑
- 自然景区 / 山水景点
- 园林 / 古镇 / 历史街区
- 桥梁 / 城市公共地标 / 纪念建筑

---

### 2）提取高辨识度特征

自动提取并强化目标最有辨识度的元素，例如：

- 建筑轮廓
- 屋顶形制
- 立面层级
- 柱体 / 门窗 / 台阶 / 广场
- 山体 / 水面 / 桥梁 / 亭台
- 标志性比例关系
- 地标性的空间气质

要求：
生成结果必须让人一眼能认出这是目标建筑 / 景点。

---

### 3）统一插画化转译（重点）

必须将整个画面统一转译为：

**高质感国风插画风格**

要求：

- 建筑 / 景点主体不能是纯写实照片感
- 建筑本身也要进行精致插画化处理
- 保留建筑真实结构与辨识度
- 但在边缘、色块、色彩组织、光影层次、装饰感上统一为插画语言
- 建筑、祥云、背景必须属于同一套视觉体系
- 整体呈现“插画化地标海报”，而非“真实建筑 + 写意装饰拼接”

建筑和景点主体要做到：

- 结构清晰
- 轮廓干净
- 色彩提炼
- 局部具有装饰性
- 与祥云在笔触、色彩气质、层次处理上相互协调
- 主体仿佛从祥云与东方气韵中自然生长出来

---

## 三、整体画面风格

### 风格关键词

- 新中式极简东方美学
- 高级国风插画海报
- 东方幻想感
- 文旅视觉海报
- 鎏金装饰插画
- 博物馆文创感
- 精致、统一、明亮、通透、华丽但克制
- 整体为插画风，不要写实照片拼贴感

---

## 四、画面结构

### 1）比例
- 9:16 竖版海报

### 2）主体位置
- 建筑 / 景点主体位于画面中央偏下
- 作为绝对视觉中心
- 采用庄重的正面或略微仰视构图
- 如适合对称构图，则以中轴对称增强仪式感
- 主体占画面高度约 45%–60%

### 3）前景设计
根据对象自动生成适合的前景元素，如：

- 台阶
- 石板路
- 广场
- 水面
- 山路
- 观景平台
- 留白地面

前景也需统一插画化处理，
不要过度写实，
线条、明暗与主体协调一致。

### 4）背景设计
背景以暖白色、宣纸白、米白色为主，
带有极轻微纸张肌理，
大面积留白，
干净、明亮、通透。

背景不使用复杂真实环境，
而是做适度简化和插画化弱化，
突出主体与祥云。

---

## 五、鎏金祥云系统（重点加强）

祥云必须成为画面的重要视觉框架，
并且呈现真正有质感的鎏金效果。

### 祥云要求：

- 大面积环绕建筑 / 景点主体
- 从左上、右上、右下、左下自然包围
- 形成环抱式、流动式、S 型或圆形构图趋势
- 线条优雅、飘逸、华丽、富有东方韵律
- 具有敦煌云纹、中国传统壁画云气、东方神话装饰图案的感觉

### 鎏金质感要求（必须明确）

鎏金效果必须是：

- 高饱和暖金色
- 明亮的赤金 / 琥珀金 / 金箔金
- 金色具有明显光泽感与流光感
- 具有细腻金粉、金箔、描金边、矿物金颜料的视觉质感
- 金色部分层次丰富，有明金、中金、浅高光金的变化
- 看起来华丽、纯净、通透，不发灰，不发脏，不发闷

明确避免：

- 灰金
- 雾金
- 脏金
- 米黄色假金
- 低对比金色
- 发灰发白的金色

可加入：

- 细小金点
- 金色颗粒
- 局部流光
- 描金边缘
- 云气的金色渐变层次

---

## 六、建筑 / 景点与鎏金融合逻辑（重点）

建筑 / 景点不应只是被祥云包围，
而应与祥云和东方装饰语言融为一体。

要求：

- 建筑边缘可有轻微描金或暖金高光处理
- 建筑色彩可适度提纯、提亮、插画化
- 局部可融入与祥云一致的装饰性节奏
- 主体不再是纯写实质感，而是“插画化、艺术化、海报化”的表达
- 画面要有一种“建筑从东方云气中显现”的感觉
- 建筑 / 景点主体与祥云在色调、线条感、光泽感、装饰性上协调统一

目标效果：

**主体像从鎏金云海中诞生，整个画面属于同一种东方插画语言。**

---

## 七、不同对象的自适应规则

### 1. 若输入为古建筑 / 宫殿 / 寺庙 / 塔楼
重点突出：

- 屋檐
- 斗拱
- 层级屋顶
- 红墙
- 金瓦 / 蓝瓦 / 琉璃瓦
- 台基
- 中轴对称感
- 东方礼制感

建筑处理更偏华丽、庄重、神圣的国风插画感。

---

### 2. 若输入为现代地标建筑
重点突出：

- 独特轮廓
- 几何结构
- 体块关系
- 玻璃幕墙
- 城市地标识别感

但必须做插画化提炼，
不能保留过强摄影感。
祥云可更流线、更现代，与建筑轮廓形成呼应。

---

### 3. 若输入为自然景区 / 山水景点
重点突出：

- 山体轮廓
- 云雾层次
- 水面
- 栈道
- 桥梁
- 亭台
- 峰峦起伏

整体更空灵、更诗意、更仙境，
山水本身也需插画化、装饰化，与祥云自然交融。

---

### 4. 若输入为园林 / 古镇 / 街区
重点突出：

- 建筑群层次
- 屋檐节奏
- 水岸 / 小桥
- 巷道空间
- 传统聚落气质

整体更有叙事性，
但仍需保留明确视觉焦点与统一插画语言。

---

## 八、色彩系统

### 整体配色

- 背景：宣纸白 / 暖白 / 米白
- 祥云：高饱和暖金、鎏金、赤金、浅高光金
- 辅助云气：极浅灰蓝、浅雾蓝、淡冷灰
- 建筑 / 景点主体：保留其最具代表性的原始主色，但进行插画化提纯与亮化

### 色彩要求

- 明亮
- 通透
- 纯净
- 对比适中但有重点
- 高级
- 不灰
- 不脏
- 不闷
- 不过度复古泛黄

特别强调：
1. 金色必须明显、明亮、纯净、华丽，呈现真正的鎏金和金箔质感，不能灰、不能淡、不能脏。
2. 建筑 / 景点与祥云必须是同一种高质感东方插画语言，不能出现“建筑偏写实、祥云偏装饰”的割裂效果。
3. 整体必须像一张完整统一的国风插画海报，而不是建筑照片加装饰边框。

---

## 九、光影与材质

- 整体使用柔和而明亮的东方插画光感
- 主体与祥云有轻微发光感和层次感
- 鎏金部分具备清晰的金属光泽与颗粒细节
- 主体边缘可有轻微金色高光描边
- 整体视觉细腻、精致、海报感强

---

## 十、文字要求

不要出现任何：

- 标题
- 副标题
- 中文
- 英文
- logo
- 水印
- 印章
- 署名
- 乱码

保持纯视觉海报。

---

## 十一、最终生成目标

根据用户输入的建筑名称或景点名称，
生成一张 9:16 竖版新中式鎏金祥云插画海报。

核心要求：

- 建筑 / 景点高辨识度
- 整体统一为高质感插画风格
- 建筑 / 景点与祥云融为一体
- 金色足够明亮、饱和、华丽、有金箔质感
- 画面干净、通透、高级、适合传播

---

## 十二、负面提示词

水印，logo，文字，标题，英文，乱码，印章，署名，照片感过强，写实摄影风，建筑和祥云风格割裂，灰金色，脏金色，低饱和金色，灰蒙蒙色调，脏灰背景，过暗，过度雾化，主体变形，建筑结构错误，透视错误，比例失真，背景杂乱，廉价卡通感，过度复杂，主体被遮挡
---
建筑名称：天坛
```

![](https://pbs.twimg.com/media/HHzTuGlagAAq21p?format=jpg&name=large)


```
一张 新中式极简东方美学 风格的创意插画海报，整体画面以 宣纸暖白背景 为主，带有极轻微纸张肌理与大面积留白，画面安静、克制、雅致，具有高级东方意境与文化海报气质。

画面中央是一张自然展开的 古朴手工纸卷 / 宣纸长卷，纸张边缘略微卷起，带有岁月感与细腻做旧质感。左下角放置一支具有东方雅韵的 毛笔或羽毛笔，笔尖蘸着浓郁的青蓝色墨汁，墨色从笔尖自然流淌，在纸上形成一条蜿蜒灵动的 S 型珠江水脉。江水顺势流淌，在宣纸之上逐渐幻化、生长出一座精致的 微缩广州城景。

这座由笔墨生成的广州微缩世界，以 广州塔 作为最核心的视觉地标，沿着珠江展开，周围依次生长出 珠江新城现代天际线、猎德大桥、沿江建筑群、游船码头、珠江两岸城市肌理，并融合少量具有岭南风格的 骑楼、西关大屋、传统屋檐、临水街巷，形成“现代广州与岭南文脉共生”的视觉意境。城市由近至远层层展开，精致细腻，像是从墨迹里自然长出来的一幅山河城境图。

整体构图强调 “由一笔写出广州” 的意象，珠江作为主要动线贯穿全画面，形成优雅流动的 S 型构图。建筑和景观既有微缩模型般的精致感，也保留手绘插画与水墨晕染的诗意气息。局部可出现小舟、游船、江岸绿意、花城广场氛围、远处淡淡山体轮廓，让广州更具城市识别度与生活气息。

色彩以 宣纸白、青蓝墨色、珠江蓝、岭南灰、浅赭石、黛青、淡金色 为主，整体低饱和、清雅克制。广州塔、珠江水线、部分建筑轮廓可用少量 矿物蓝与浅金细节 点亮，增强高级感与精致度。光影柔和，画面明亮通透，不厚重、不杂乱，保留至少 40% 留白，整体呈现新中式高端商业插画海报气质。

风格要求：
新中式极简、东方意境、广州城市微缩景观、由笔墨生长出的城市、水墨与精致插画结合、珠江 S 型动线、宣纸质感、留白、高级、雅致、诗意、清透、岭南文化气息浓厚。
```

![](https://pbs.twimg.com/media/HHj4ATya4AAS-Iv?format=jpg&name=large)


```
A traditional Japanese ink wash painting of a [subject], created in expressive sumi-e style with flowing black ink lines and delicate [color1] and [color2] watercolor tints. The pigments softly bleed into textured rice paper, evoking a sense of serenity and timeless beauty.
```

| ![](https://pbs.twimg.com/media/HIMcIlgaoAEKpCr?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HIMcIwibsAAok-e?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |


```
请根据用户上传的中国古画图像，创作一张真实存在、由顶级摄影师拍到的收藏级摄影作品。不要把任务理解为“把古画画成照片”，也不要延续水墨、工笔、壁画或宗教图像的表面风格；应把古画视为古代创作者对真实世界的一次提炼、取舍、压缩与重组，再反向还原成他当时真正看到的景象：仿佛那个时代若有相机，这一幕会被如此捕捉。

最终作品应具有奥斯卡级电影画面的完成度：像一位好莱坞奥斯卡获奖导演，以极高的视觉判断力统筹叙事、构图、节奏、气氛、光影、场景与镜头语言；同时像顶级电影摄影、自然光控制、历史场景营造、服化道、置景与调色系统共同服务于同一个画面目标，形成能够获奖的电影级质感。但这只是幕后创作标准与审美高度，绝不能在画面中出现任何现代片场元素、导演、摄影师、灯光师、工作人员、摄影机、灯架、轨道、反光板、监视器、现代布景痕迹或人工影棚感。画面应像真实历史现场被顶级电影摄影机捕捉，而不是像现代剧组正在拍摄。

先真正读懂原作。优先辨认题名、题跋、落款、印章、款识及可见文字，并结合传统母题、构图秩序、物象关系与画面语境判断题材，不得只凭表面轮廓臆断。面对写意、泼墨、没骨、抽象、局部化或高度概括的作品，也应先确认它在中国画传统中所指向的真实对象与场景，避免误判题材。

完成题材锚定后，进入“源头现实”的还原，而不是“绘画风格”的延续。不要复制笔触，不要保留纸面感、卷轴感、水墨肌理或扁平造型作为视觉表皮，而应还原真实存在的山川、草木、云水、花鸟、人物、器物、建筑、气候、时辰、空间与距离。原作中的笔墨、设色、留白、节奏与气韵，不是最终风格本身，而是寻找真实场景的线索。

请保留原作最核心的精神结构：物象关系、视觉重心、疏密聚散、虚实分布、留白呼吸、静动比例，以及“神、气、骨、势”的走向；但不要机械照抄轮廓。应从“这一题材在现实中本来如何存在”出发，再用古画的秩序约束画面的生成。最终画面不仅要还原，更要成为一张真正有摄影美学和电影美学高度的作品：有清晰、强烈、难忘的视觉核心，有只能在这一瞬间成立的光线、色彩、空气、动作或姿态，有导演级的场面调度、摄影师主动选择过的角度、距离、取舍与凝视，而不是平均、平铺、正确却平庸的复原。

画面的电影感必须来自真实世界内部，而不是来自廉价滤镜或夸张特效。场景应像经过顶级历史电影美术系统严密推敲：地貌、建筑、植被、器物、衣料、道路、水势、烟雾、尘埃、季节与年代痕迹都自然可信；每一处细节都服务于主体、空间与情绪，而不是堆砌装饰。布景感应被隐藏在真实感之中，像一个本来就存在的古代世界，而不是一座被搭出来的摄影棚。

凡画面中出现人物、人形、佛、菩萨、罗汉、神仙、仙人、侍者、童子、僧侣、仕女、高士等主体时，除非原作明确描绘的是雕塑、泥塑、石刻、鎏金像、供奉像或其他实体造像，否则一律优先还原为真实活体人物，而不是陶瓷感、泥塑感、玉像感、木雕感、金属感、壁画感或扁平圣像感。人物必须具有真实皮肤、骨相、体积、衣料、神情、姿态、呼吸感、空间占位与自然受光关系；动作、手势、视线、重心、衣褶与道具使用方式必须符合原作语境和真实生活逻辑，不能僵硬摆拍，不能像模型或人偶。若原作确属造像题材，则应忠实还原为真实雕塑实体，呈现其材质、体量、年代痕迹与环境光线。

色彩必须重点提升。不要把画家画出来的颜色当作唯一答案，也不要只做普通自然色。画面中显性的颜色，应理解它在强调什么；画面中未被明确画出的颜色，也应主动还原其潜在逻辑。原作的颜色只是底子，不是上限。应从真实世界出发，重建当时场景本应具有的色彩关系，同时融合顶级现代摄影、电影级光学系统与奥斯卡级调色审美的呈现：更好的动态范围，更干净的色彩分离，更细腻的冷暖过渡，更丰富的中间层次，更通透的空气色，更克制而高级的饱和控制。让真实世界的光色、物色、环境色、空气色与中国画的设色意识彼此滋养，使画面既忠于原作精神，又拥有更高维度的色彩表现力。颜色不能漏掉，不能死板，不能脏灰，不能闷浊，不能一片糊暗；必须清澈、通透、鲜活、细腻、有呼吸、有层次，像通过顶级电影摄影机与高素质电影镜头捕捉到的世界：黑位干净，亮部洁净，色彩纯度高而不艳俗，空气透明，层层递进，整体明净而不单薄。

光影必须成为画面的核心创造。不要因为原画没有清楚画出光影，就让画面平淡；也不要使用生硬、夸张、影棚式的戏剧化布光。应根据原作题材、气质、时辰感、温度感、动静关系与精神重心，主动寻找最适合它的电影级自然光线：可能是清晨薄光、暮色微光、雨后漫射光、雾中透光、水面反光、雪地回光、窗边侧光、林隙漏光、殿内暗光，或被空气过滤后的柔光。光线应像顶级灯光设计经过极高水平控制，但最终完全隐藏为自然发生的现场光；不必强烈，却必须高明；不必喧哗，却必须有方向、有层次、有呼吸，能够塑造体积、唤醒材质、建立空间、引导视线、托起主体，并形成真正高级的情绪张力。好的摄影和好的电影画面都不能接受平庸的光影。

真实感必须来自可信的摄影现场：空气、湿度、温度、反光、折射、材质、景深、距离、微颗粒、边缘衰减与细节层次共同成立。镜头语言应具有电影级选择感：合适的机位高度、焦段压缩或空间展开、前中后景关系、景深控制、主体调度、光线落点与视线引导，都应服务于原作的精神结构。避免白底标本感、悬浮感、CG感、塑料感、脏污感、灰败感、假HDR、假景深、过度锐化、网红滤镜、廉价古风、游戏概念图和旅游宣传照气息。画面应明净、通透、耐看，有高级完成度，而不是脏兮兮、糊成一团或故作深沉。

若原作中有题跋、题字、落款、印章或款识，请尽量保留并重新融入最终成片。优先保留其可辨识内容、书写方向、位置关系与整体气息；若无法完全识别，也应延续其文人题署的结构、留白与神态，使它们像作品完成后自然题署的一部分，与摄影画面共生，而不是后期生硬叠加的装饰。不得保留任何现代水印、百科标识、网页标识、二维码、现代签名或无关文字。

图片比例默认遵循原图比例，以保留原作构图的呼吸、秩序与重心；若用户另有明确比例要求，则优先遵从用户要求。

最终目标不是“像中国画的摄影”，也不是“现实化水墨插画”，而是一张真正还原古代创作者眼前世界、同时经过奥斯卡级导演意识、顶级电影摄影、历史场景营造、自然光控制与现代高端光学审美共同升华的作品：真实、通透、细腻、克制、可信，具有不平庸的光影、不平庸的色彩、清澈的空气感、鲜明的记忆点、电影级叙事张力与可收藏的完成度，仿佛古画背后的现实终于被重新看见，并第一次以最好的方式被拍下。
```

| ![](https://pbs.twimg.com/media/HIiAHPBbQAIdMSN?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HIiAKpjbkAADe_a?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |


```
{
"subject": {
"description": "A Tang dynasty Chinese court orchestra performing music on a branch of an Agan tree, with musicians playing pipa, erhu, flute, ruan, and horse-hoof lute, musicians and birds casually scattered, some standing, some sitting.",
"mirror_rules": null,
"age": null,
"expression": {
"eyes": {
"look": null,
"energy": null,
"direction": null
},
"mouth": {
"position": null,
"energy": null
},
"overall": null
},
"face": {
"preserve_original": false,
"makeup": null
},
"hair": {
"color": null,
"style": null,
"effect": null
},
"body": {
"frame": null,
"waist": null,
"chest": null,
"legs": null,
"skin": {
"visible_areas": null,
"tone": null,
"texture": null,
"lighting_effect": null
}
},
"pose": {
"position": "mixed (some standing, some sitting)",
"base": "on a branch of an Agan tree",
"overall": "performing music, playing pipa, erhu, flute, ruan, and horse-hoof lute"
},
"clothing": {
"top": {
"type": "Tang dynasty court clothing",
"color": null,
"details": null,
"effect": null
},
"bottom": {
"type": null,
"color": null,
"details": null
}
}
},
"accessories": {
"jewelry": null,
"headwear": null,
"device": null,
"prop": "pipa, erhu, flute, ruan, horse-hoof lute"
},
"photography": {
"camera_style": null,
"angle": null,
"shot_type": null,
"aspect_ratio": null,
"texture": null,
"lighting": "even soft gentle lighting",
"depth_of_field": null
},
"background": {
"setting": "camel-brown stage canvas",
"wall_color": "camel brown stage canvas, color code #E7B5C3D",
"elements": [
"Agan tree branch",
"birds"
],
"atmosphere": null,
"lighting": "even soft gentle lighting"
},
"the_vibe": {
"energy": null,
"mood": null,
"aesthetic": "Song dynasty aesthetics, minimalist, realistic",
"authenticity": null,
"intimacy": null,
"story": "A Tang dynasty Chinese court orchestra performing music on a branch of an Agan tree, musicians and birds casually scattered, some standing, some sitting.",
"caption_energy": "Tang court orchestra on a tree branch"
},
"constraints": {
"must_keep": [
"Tang dynasty court orchestra",
"musicians playing pipa, erhu, flute, ruan, and horse-hoof lute",
"Agan tree branch",
"musicians and birds casually scattered, some standing, some sitting",
"camel-brown stage canvas with color code #E7B5C3D"
],
"avoid": []
},
"negative_prompt": [
"nsfw",
"low quality",
"text",
"watermark"
]
}
```

| ![](https://pbs.twimg.com/media/G9TsesOaIAAfNFh?format=jpg&name=large) | ![](https://pbs.twimg.com/media/G9TsfmjbcAAiRn7?format=jpg&name=4096x4096) |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |


---

#### 品牌视觉类

```
{
  "prompt": {
    "title": "Agency-Grade Brand Identity System Poster",
    "trigger": "Upload a logo. From it, construct a complete, investment-worthy brand identity system poster — the kind that closes client deals and dominates Behance front pages.",

    "prime_directive": {
      "rule": "Every element — color, tone, shape, texture, personality — must be extracted directly from the uploaded logo.",
      "enforcement": "Nothing generic. Nothing templated. Nothing borrowed. Strip the logo. Decode it. Build an entire visual universe from its DNA."
    },

    "format": {
      "orientation": "Vertical",
      "aspect_ratio": "4:5",
      "layout": "Multi-column grid",
      "composition": "Layered, dense, intentional — zero wasted space"
    },

    "sections": {

      "01_brand_header": {
        "label": "Open With Authority",
        "elements": [
          "Brand name in commanding, high-hierarchy typography",
          "Brand statement — 6 words maximum, razor-sharp",
          "Three soul descriptors (e.g. Raw / Futuristic / Grounded)"
        ]
      },

      "02_color_system": {
        "label": "Build The Color World",
        "palettes": {
          "primary": "3–5 colors extracted from logo",
          "secondary": "3–5 supporting colors",
          "accent": "High-impact hit colors"
        },
        "per_color_display": [
          "Wide swatch block",
          "HEX code",
          "Role label: foundation / emphasis / atmosphere"
        ],
        "extras": [
          "Gradient blends",
          "Color-on-color pairings",
          "Light mode vs dark mode behavior"
        ]
      },

      "03_typography_system": {
        "label": "Establish The Type Voice",
        "tiers": {
          "headline": "Commanding, bold — show a punchy title example",
          "subheadline": "Structured, clear — show a descriptive line example",
          "body": "Readable, intentional — show a paragraph fragment example"
        },
        "requirement": "Hierarchy must be undeniable at a glance"
      },

      "04_visual_language": {
        "label": "Define The Visual World",
        "define": [
          "Image style (editorial / industrial / cinematic / organic / etc.)",
          "Lighting quality and direction",
          "Texture references and material moods"
        ],
        "visual_tiles": {
          "count": "3–5 tiles",
          "style": "Art-directed style previews — mood board squares from a real shoot brief"
        }
      },

      "05_brand_applications": {
        "label": "Bring The Brand To Life",
        "rule": "Every mockup must feel like the same brand. Same DNA. Zero inconsistency.",
        "mockups": [
          {
            "type": "Product Packaging",
            "detail": "Dimensional, realistic render"
          },
          {
            "type": "Website Hero",
            "detail": "Full desktop viewport"
          },
          {
            "type": "Mobile App Screen",
            "detail": "One key UI moment"
          },
          {
            "type": "Social Media Posts",
            "detail": "3 formats — square, story, banner"
          },
          {
            "type": "Business Card",
            "detail": "Front and back"
          },
          {
            "type": "Out-of-Home Ad",
            "detail": "Billboard or transit panel"
          }
        ]
      },

      "06_design_system": {
        "label": "Show The System Working",
        "components": [
          "Buttons — default, hover, disabled states",
          "Cards",
          "Input fields",
          "Navigation bar",
          "Spacing scale"
        ],
        "requirement": "Must resemble a real design system handoff document"
      },

      "07_iconography": {
        "label": "Iconography",
        "count": "6–10 icons",
        "style_rule": "Same visual grammar as the logo — geometric, organic, sharp, or soft",
        "consistency": "Uniform stroke weight or fill logic throughou
```

![品牌视觉](https://pbs.twimg.com/media/HHcwev1bUAAQ5Nb?format=jpg&name=large)


````markdown
GPT Image 2 —— 完整时装系列造型手册提示词库

> **使用方法：** 将你的时装品牌 logo、面料样布、情绪板，或系列概念描述一并上传给 GPT Image 2，并配合以下任一提示词使用。每个提示词都会构建一个连贯的时装宇宙——从服装技术包到编辑部级别的广告 campaign。可自由组合，打造一整套可直接用于发布的视觉方案。

---

## 🔑 主提示词 —— 整个系列的身份板

> 单张主视觉提示词。生成完整时装系列身份，以一张浓缩、高级感十足的展示板呈现。

```
上传一个时装 logo、一块面料样布，或描述系列概念（目标人群、季节、审美、材质）。基于此，构建一套完整的时装品牌身份与系列发布级视觉系统海报，竖版 4:5 比例。

提取规则：必须从 logo / 概念中解码出每一种颜色、面料纹理、轮廓剪裁、光线风格与整体态度。服装、包装、摄影和数字呈现都必须像属于同一场走秀。

版式：多栏编辑杂志网格，高级时装杂志风格（类似 Vogue 或 Dazed）——有意运用留白、叠加元素与字体层级。背景色调需与系列能量相匹配。

需包含的版块（自上而下）：

1. 品牌标题 — 品牌名使用标志性字体。系列标题（例如“FW26 // THE NEW RAW”）及季节。三个审美关键词（例如：解构 / 工装 / 空灵）。

2. 色彩与面料配色板 — 主色盘（3–5 种颜色）以面料样布形式展示（不是平面色块）——呈现织法、光泽和纹理（例如：厚呢、半透明欧根纱、哑光皮革）。旁边标注 HEX 色值。

3. 字体系统 — Logo 标识、主编辑字体（衬线/无衬线）和辅助技术字体。每种字体都配一行实际示例文本。

4. 主视觉编辑摄影 — 2–3 张具有冲击力的 campaign 图片，展示模特穿着关键造型。造型、发型/妆容与光线语言保持统一。这些图片决定整个视觉基调。

5. 系列重点（造型）— 3–4 张完整全身秀场或棚拍图，呈现系列中的不同服装。轮廓可有变化，但必须保有一致 DNA。

6. 服装技术与细节图 — 一张关键单品的技术平面草图，以及一个标志性五金细节或缝线工艺的极近距离特写。

7. 包装与零售 — 品牌购物袋、高级服装盒，以及织唛领标或吊牌。

8. 数字呈现 — Instagram 帖子样机（轮播或 Reels）和电商商品页版式。

质量标准：必须看起来像价值 3 万美元的时装品牌视觉代理公司交付成果，或奢侈品牌创意总监的最终提案。
```

---

## 📦 类别 1 —— 品牌识别与辅料

### 1A. 标签与辅料系统

```
基于上传的 logo / 概念，生成一张写实风格的平铺摄影图，展示完整的服装标签与辅料系统。

需展示：
— 缝在面料底上的织唛领标（主品牌标签）
— 洗标 / 成分标（缎面或 Tyvek）
— 外部品牌元素：橡胶章、金属 logo 铭牌或低调刺绣标识
— 吊牌套装：厚卡纸主吊牌、较小的价格/条码吊牌，以品牌绳带和安全别针或定制封签连接
— 定制五金：品牌纽扣、拉链头或铆钉

整体以精准、有触感的平铺方式摆放在有质感的表面上（混凝土、原始帆布或抛光金属）。辅料的材质与工艺必须体现品牌定位与美学（例如：街头品牌用哑光黑金属，奢华传统风格用烫金与厚棉纸）。
```

### 1B. 包装与开箱

```
基于上传的 logo / 概念，生成一张高级电商开箱体验的写实摄影图。

需展示：
— 一个高品质硬质展示盒（打开状态）
— 品牌薄纸包裹的衣物，封口处贴有定制 logo 贴纸
— 一张精美厚纸的“Thank You”卡片或系列概念卡片放在最上方
— 品牌收纳袋（棉质或丝质）局部可见
— 外部快递包装盒（带低调品牌标识）置于背景中

光线：柔和、漫射的窗边自然光。摆放方式应显得奢华且经过精心设计。盒子、薄纸和卡片的颜色必须与品牌配色系统完全一致。要让人仅因为包装就产生购买冲动。
```

---

## 📦 类别 2 —— 系列服装与造型

### 2A. 12 套造型阵容（秀场 / 造型册）

```
基于上传的 logo / 概念，生成一张写实风格的时装造型册网格，展示新系列中 12 套不同但统一的造型。

版式：3×4 网格，全身模特照，背景统一且极简（无缝纸背景、混凝土墙或轻微渐变）。

系列必须包含：
— 清晰贯穿 12 套造型的色彩叙事
— 外套、上衣、下装、连衣裙/套装的组合
— 统一造型风格（鞋履、配饰、发型和妆容）
— 鲜明的轮廓语言（例如：oversized 廓形裁剪、贴身垂褶、不对称剪裁）

所有模特都应呈现统一、自信的态度。光线：清晰、均匀的棚拍灯光，突出面料质感。整体必须真实、可穿、可量产。
```

### 2B. 技术平面图（Tech Pack）

```
基于上传的 logo / 概念，生成一份专业时装技术包版式，适用于系列中的主打夹克或大衣。

需展示：
— 正反面技术平面图（黑白矢量风格），包含精确的缝线、褶省和拼接细节
— 指示箭头标注具体设计特征（例如：“隐藏门襟”、“插片式袖窿”、“定制品牌按扣”）
— 一个展示该服装 3 种品牌配色的色卡区
— 一张建议面料纹理的小型插图
— 一张尺寸规格表模板
— 文档页眉含品牌 logo 和系列名称

设计风格：干净、技术化、临床感强。应像一份真正交给工厂打样的文件。
```

### 2C. 面料与细节微距

```
基于上传的 logo / 概念，生成一张极近距离、写实风格的服装细节特写。

聚焦于主打单品上某一处材料交接：
— 精致收边的缝线、口袋边缘或衣领
— 主面料的纹理（例如：厚帆布织法、皮革颗粒感、原色牛仔的经纬纹路）
— 定制品牌辅料（拉链头、雕刻纽扣或低调刺绣 logo）

景深应较浅，强烈聚焦在纹理与工艺上。光线：具有戏剧性的侧光，以突出材质的起伏。这个镜头要证明制作工艺的品质。
```

---

## 📦 类别 3 —— campaign 与编辑摄影

### 3A. 主视觉 Campaign 图（海报级）

```
基于上传的 logo / 概念，生成一张用于新季发布的写实主视觉 campaign 摄影。

需展示：
— 1 或 2 位模特，穿着系列中最强烈、最具表现力的造型
— 场景：与品牌 DNA 相匹配的富有表现力的地点（粗粝混凝土建筑、繁茂失控的温室、极简未来感摄影棚，或风吹海滩）
— 构图：戏剧化、高冲击力，为 logo / 字体留出留白（可轻微叠加或融入画面）
— 光线：电影感且有意图（黄金时刻、强闪光或忧郁柔光）

画面必须讲述品牌态度的故事。它应看起来像 Vogue 的跨页大片，或时代广场的大型广告牌。高级、具有向往感、执行完美。
```

### 3B. 幕后 / 试装

```
基于上传的 logo / 概念，生成一张写实的纪录片风格照片，呈现系列试装或后台瞬间。

需展示：
— 一位模特，穿着未完成的造型或完整造型
— 造型师或设计师的手正在调整细节（别针固定布料、整理衣领）
— 背景里虚化的情绪板或衣架区
— 真实、原始的氛围，不要过度摆拍
— 胶片相机质感（轻微颗粒、闪光灯风格，或粗粝黑白）

这张图用于建立品牌故事与真实性，展示华丽背后的制作过程。应像品牌二号 / 归档 Instagram 账号发布的独家幕后视角。
```

### 3C. 鞋履 / 配饰聚焦

```
基于上传的 logo / 概念，生成一张写实编辑风格摄影，专注于系列中的主打配饰（包、鞋子或标志性珠宝）。

需展示：
— 配饰由模特穿戴，但构图裁切以强调单品本身（例如鞋子拍到膝盖以下，或只拍上半身手持包袋）
— 造型搭配服装，但不会分散对配饰的注意力
— 配饰的材质与轮廓清晰传达品牌审美
— 动态姿势或动作（行走中、强势手持包袋）

光线：锐利、产品导向，但仍置于生活方式语境中。这是电商与社交媒体广告中最能带货的镜头。
```

---

## 📦 类别 4 —— 零售与电商

### 4A. 电商商品页（桌面端）

```
基于上传的 logo / 概念，生成一张写实的桌面浏览器样机图，展示品牌电商商品页。

需展示一个全宽视口，包含：
— 导航栏：logo、分类（新品、成衣、配饰）、搜索、购物袋
— 主图区域：一件关键单品穿在模特身上的高端简洁电商图（灰色或白色无缝背景）
— 缩略图画廊：4 张不同角度与细节图
— 商品信息：加粗字体的商品名、价格、颜色选择器（色块）、尺码选择器、“加入购物袋”按钮，以及详情 / 尺码 / 物流的折叠菜单
— UI 设计（按钮、字体、间距）必须与品牌身份完全契合

版式应以转化率为导向，但仍明显呈现高级 / 奢侈质感。线条干净、留白充足、字体无懈可击。
```

### 4B. 电商分类页（移动端）

```
基于上传的 logo / 概念，生成一张写实的移动端电商分类页样机，显示在现代智能手机框内。

需展示：
— 顶部固定栏：logo、汉堡菜单和购物袋图标
— 头部下方有筛选与排序选项
— 2 列商品图片网格（显示系列中 4–6 个可见商品）
— 商品摄影保持一致——模特姿态相近，背景完全相同
— 每张图下方只有最少文字：商品名与价格

移动端体验必须显得快速、直观且美观。这个网格应一眼展示系列的统一性。
```

### 4C. “街头出镜”的购物袋

```
基于上传的 logo / 概念，生成一张写实摄影图，展示品牌零售购物袋被拎着走在城市街道上。

需展示：
— 高级、挺括的纸质购物袋，印有 logo 与品牌配色
— 高品质绳带或丝带提手
— 由一位穿搭时髦的人拿着（其造型与品牌氛围相呼应）
— 虚化的城市背景（如巴黎、东京或纽约这样的时尚之都街景）
— 自然、动态的移动感

这张图用来展示品牌的实体存在感与地位。购物袋应像一种身份象征，让顾客愿意重复使用。
```

---

## 📦 类别 5 —— 陈列与环境

### 5A. 旗舰店门面

```
基于上传的 logo / 概念，生成一张品牌旗舰零售门店门面的写实摄影图。

需展示：
— 建筑立面：材料需反映品牌气质（通透玻璃/钢材、传统石材、极简混凝土）
— 招牌：将 logo 呈现为高级立体字或优雅灯箱
— 橱窗展示：2–3 个模特穿着系列主打造型，置于创意、艺术指导过的装置之中
— 光线：温暖、精致的室内灯光从店内溢出，并以聚光灯照亮模特

场景：高端购物区。门面必须在顾客走入之前，就传达品牌的价格定位与审美。
```

### 5B. 店内陈列

```
基于上传的 logo / 概念，生成一张零售店内部或高端快闪空间的写实摄影图。

需展示：
— 挂架：定制设计的服装挂架（拉丝黄铜、哑光黑金属或悬浮钢索）
— 陈列：系列服装极其整齐地悬挂，并按色彩叙事排列
— 展示台：中央立台或桌面上摆放折叠针织、包袋与配饰
— 材质：地面、墙面和装置都需与品牌纹理配色相协调
— 氛围：空间宽敞、经过策展，更像美术馆而不是拥挤商店

环境应让服装显得昂贵且极具吸引力。柔和、讨喜的环境光与精准的聚光灯结合。
```

---

## 📦 类别 6 —— 社交媒体与广告

### 6A. Instagram 九宫格

```
基于上传的 logo / 概念，生成一张写实的 9 宫格 Instagram 首页样机，显示在 iPhone 的 Instagram 个人主页界面中。

这 9 张内容应构成一个连贯、极具吸引力的时装内容流：
— 第 1 张：主视觉 campaign 图
— 第 2 张：电商风格的干净模特图
— 第 3 张：抽象面料 / 纹理微距细节
— 第 4 张：幕后 / 试衣间镜子自拍
— 第 5 张：图形文字帖（引用语、系列日期或品牌理念）
— 第 6 张：配饰 / 鞋履焦点
— 第 7 张：建筑灵感或情绪图
— 第 8 张：秀场或造型册全身图
— 第 9 张：包装或开箱细节

网格需有明确的色彩节奏与编辑节奏（忙碌图像与简洁极简图像交替）。显示粉丝数、简介和商店链接。
```

### 6B. 杂志封面与跨页

```
基于上传的 logo / 概念，生成一张写实的打开式时尚杂志样机，展示品牌广告跨页。

需展示：
— 左页：一张强烈的满版 campaign 图
— 右页：同一图像的延续，或极简排版，包含系列名称、logo，以及旗舰店所在城市列表
— 杂志平放在有质感的表面上（玻璃桌、混凝土地面或亚麻床单）
— 可见装订线与铜版纸的光泽反射

这则广告应显得强大、自信，在高端刊物中也能独当一面。
```

### 6C. 街头墙贴广告（Wheatpaste）

```
基于上传的 logo / 概念，生成一张街头层级的 wheatpaste 墙贴广告写实摄影。

需展示：
— 4–6 张大型印刷海报贴在城市施工围墙或砖砌小巷墙面上
— 海报包含粗粝、前卫的 campaign 图像、品牌 logo 和系列发售日期
— 海报边缘略微起皱或翘起（真实街头质感）
— 一位时髦行人从画面前经过，用于体现尺度与动态

这会营造出热度、青年文化与城市相关性。形成高时尚与粗粝街头环境之间的对比。
```

---

## ⚡ 快速提示词 —— 单品生成器

**时装秀邀请函：**

```
一张写实的平铺摄影图，展示实体时装秀邀请函。邀请函采用高级材质（厚卡纸、亚克力或压印金属），使用品牌字体，并标明场地、日期和座位号。放置在干净表面上，旁边有品牌信封。极具创意、触感强、且带有独家感。
```

**品牌衣架与衣物袋：**

```
一张写实细节特写，展示定制的品牌木质或丝绒西装衣架，挂着系列中的一件单品，外面半遮着一个带厚拉链的品牌不透明衣物袋。悬挂在哑光金属横杆上。传达品牌的用心与奢华。
```

**小票与信封：**

```
一张写实摄影图，展示一张高端零售小票被放入定制品牌卡纸信封或文件夹中。封面上有压印或烫金的品牌 logo。旁边的光洁品牌钢笔放在大理石台面上。提升最终交易时刻的质感。
```

**系列情绪板：**

```
一张写实摄影图，展示实体工作室情绪板。钉在软木板或贴在白墙上的有面料样布、Pantone 色卡、复古参考照片、建筑剪影和几张初步草图。呈现出系列起点的混乱却美丽的状态。
```

**品牌托特包（推广款）：**

```
一张写实摄影图，展示厚帆布或尼龙托特包，印有品牌 logo 或系列标语。由一位穿着休闲、下班风格造型的模特斜挎或随性背着。这种托特包会成为城市创意人群的常备单品。
```
````

| ![](https://pbs.twimg.com/media/HHwOevQW4AMPwTK?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOevQXkAE41eh?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOi91W4AMT4TU?format=jpg&name=large) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![](https://pbs.twimg.com/media/HHwOl49XsAIP8KQ?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOo5gXkAUuMAb?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOrhpWoAQeQUf?format=jpg&name=large) |
| ![](https://pbs.twimg.com/media/HHwOuDCWcAA8mbU?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOuDPXIAcQyre?format=jpg&name=large) | ![](https://pbs.twimg.com/media/HHwOrhuXYAcdpwg?format=jpg&name=large) |

---

#### 功能类

###### 造型设计

```
conceptual design evolution, bird wing motion transformed into a futuristic chair design, sequential process from realistic wing reference to anatomical sketch to abstract flowing lines to final product form, feather structure and flight curves shaping the chair silhouette, layered wing elements forming the backrest, elegant aerodynamic geometry, modern sculptural chair, brushed metal and soft fabric seat, dark metallic tones with warm gold accents, premium industrial design, clean white studio background, pencil sketch studies on the top row, photorealistic chair on the bottom row, soft cinematic lighting, refined product presentation layout, ultra detailed, 3:4
```

![](https://pbs.twimg.com/media/HG0sROVbIAAXmkG?format=jpg&name=large)


###### 爆炸图

```
一张超详细的技术信息图海报，展示 [OBJECT]，采用干净的工程风格，背景为纯白色。中央是一个精确的爆炸视图图表，所有主要组件均已分离，并使用细发丝标注线指向加粗、大写的技术标签。侧面包含一个切割剖视图，展示内部机械结构。添加小型嵌入式放大图，近距离展示关键细节。字体采用混合排版：锐利的等宽字体用于规格参数，几何无衬线字体用于标题（标签）。图像中不含标题栏、不含标语、不含页眉条、不含页脚文本——只有信息图本身。侧面有一个规格面板，列出尺寸、材料和关键事实。整张图像上叠加了细微的网格线/方格纸纹理。仅使用电力琥珀色或青色点缀来突出关键部件。背景全程为纯白色。宽高比 1:1。高细节、印刷质量、技术插图美学。
```

| ![](https://pbs.twimg.com/media/HHzPhtkaAAApIoA?format=jpg&name=medium) | ![](https://pbs.twimg.com/media/HHvVTkfXIAQc29G?format=jpg&name=medium) |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |

---

