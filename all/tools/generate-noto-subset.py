from pathlib import Path
import html as html_lib
import re

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
OUTPUT_DIR = ROOT / "src" / "assets" / "fonts"
POST_OUTPUT_DIR = OUTPUT_DIR / "posts"
ARTICLE_CACHE_DIR = ROOT / "node_modules" / ".cache" / "freecat-fonts" / "article"

NOTO_FONT_WEIGHTS = [
    ("regular", 400, ROOT / "fonts" / "freecat-noto-sans-sc-regular.woff2"),
    ("medium", 500, ROOT / "fonts" / "freecat-noto-sans-sc-medium.ttf"),
    ("semi-bold", 600, ROOT / "fonts" / "freecat-noto-sans-sc-semi-bold.ttf"),
    ("extra-bold", 800, ROOT / "fonts" / "freecat-noto-sans-sc-extra-bold.ttf"),
]
FIGTREE_FONT_WEIGHTS = [
    ("regular", 400, ROOT / "fonts" / "freecat-figtree-regular.ttf"),
    ("semi-bold", 600, ROOT / "fonts" / "freecat-figtree-semi-bold.ttf"),
    ("extra-bold", 800, ROOT / "fonts" / "freecat-figtree-extra-bold.ttf"),
]

FIGTREE_TEXT_SOURCES = [
    REPO_ROOT / "writing",
    REPO_ROOT / "Control",
    ROOT / "src",
    ROOT / "build",
    ROOT / "dist",
]

TEXT_FILE_EXTENSIONS = {".html", ".js", ".md", ".txt"}


def iter_text_files(path):
    if path.is_file():
        if path.suffix.lower() in TEXT_FILE_EXTENSIONS:
            yield path
        return

    if not path.exists():
        return

    for child in path.rglob("*"):
        if child.is_file() and child.suffix.lower() in TEXT_FILE_EXTENSIONS:
            yield child


def strip_html_to_visible_text(text):
    text = re.sub(r"<!--[\s\S]*?-->", " ", text)
    text = re.sub(r"<(script|style)\b[\s\S]*?</\1>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return html_lib.unescape(text)


def read_text_for_font(path, visual_html=False):
    text = path.read_text(encoding="utf-8", errors="ignore")
    if visual_html and path.suffix.lower() == ".html":
        return strip_html_to_visible_text(text)
    return text


def collect_codepoints(files, include_ascii=False, visual_html=False):
    codepoints = set()
    for file_path in files:
        text = read_text_for_font(file_path, visual_html=visual_html)
        if include_ascii:
            codepoints.update(ord(char) for char in text if ord(char) >= 0x20)
        else:
            codepoints.update(ord(char) for char in text if ord(char) > 0x7F)
    return codepoints


def iter_ui_html_files():
    dist_dir = ROOT / "dist"
    if not dist_dir.exists():
        return

    for file_path in dist_dir.rglob("*.html"):
        relative_parts = file_path.relative_to(dist_dir).parts
        if relative_parts and relative_parts[0] == "posts":
            continue
        yield file_path


def iter_post_pages():
    posts_dir = ROOT / "dist" / "posts"
    if not posts_dir.exists():
        return

    for file_path in sorted(posts_dir.glob("*/index.html")):
        yield file_path


def build_subset(prefix, name, weight, source_font, requested, output_dir):
    if not source_font.exists():
        raise FileNotFoundError(f"Missing source font: {source_font}")

    output_dir.mkdir(parents=True, exist_ok=True)
    output_font = output_dir / f"{prefix}-{name}-subset.woff2"
    source_cmap = set(TTFont(str(source_font)).getBestCmap().keys())
    supported = sorted(requested & source_cmap)
    unsupported = sorted(requested - source_cmap)

    if not supported and 0x20 in source_cmap:
        supported = [0x20]

    args = [
        str(source_font),
        f"--output-file={output_font}",
        "--flavor=woff2",
        "--ignore-missing-unicodes",
        "--no-hinting",
        "--layout-features=*",
        "--unicodes=" + ",".join(f"U+{codepoint:04X}" for codepoint in supported),
    ]
    subset.main(args)

    output_cmap = set(TTFont(str(output_font)).getBestCmap().keys())
    missing = sorted(set(supported) - output_cmap)
    if missing:
        sample = " ".join(f"U+{codepoint:04X}" for codepoint in missing[:20])
        raise RuntimeError(f"{prefix} {name} subset is missing supported characters: {sample}")

    print(f"{prefix} {weight} {name}: {output_font.stat().st_size} bytes")
    return supported, unsupported, output_font


def build_noto_family(prefix, requested, output_dir, font_weights=None):
    font_weights = font_weights or NOTO_FONT_WEIGHTS
    coverage = []
    for name, weight, source_font in font_weights:
        coverage.append(build_subset(prefix, name, weight, source_font, requested, output_dir))
    return coverage


def build_figtree_family():
    requested = collect_codepoints(
        (file_path for source in FIGTREE_TEXT_SOURCES for file_path in iter_text_files(source)),
        include_ascii=True,
        visual_html=False,
    )

    coverage = []
    for name, weight, source_font in FIGTREE_FONT_WEIGHTS:
        coverage.append(build_subset("freecat-figtree", name, weight, source_font, requested, OUTPUT_DIR))

    supported = sorted(set().union(*(set(item[0]) for item in coverage)))
    unsupported = sorted(requested - set(supported))
    print(f"Figtree requested characters: {len(requested)}")
    print(f"Figtree covered by source fonts: {len(supported)}")
    print(f"Figtree unsupported by source fonts: {len(unsupported)}")


def build_ui_noto_family():
    requested = collect_codepoints(iter_ui_html_files(), include_ascii=False, visual_html=True)
    coverage = build_noto_family("freecat-ui-noto-sans-sc", requested, OUTPUT_DIR)
    supported = sorted(set().union(*(set(item[0]) for item in coverage)))
    unsupported = sorted(requested - set(supported))
    print(f"UI Noto Sans SC requested characters: {len(requested)}")
    print(f"UI Noto Sans SC covered by source fonts: {len(supported)}")
    print(f"UI Noto Sans SC unsupported by source fonts: {len(unsupported)}")


def build_post_noto_families():
    pages = list(iter_post_pages())
    page_requests = []
    all_requested = set()
    for page in pages:
        post_id = page.parent.name
        requested = collect_codepoints([page], include_ascii=False, visual_html=True)
        page_requests.append((post_id, requested))
        all_requested.update(requested)

    article_coverage = build_noto_family("freecat-article-noto-sans-sc", all_requested, ARTICLE_CACHE_DIR)
    article_font_weights = [
        (name, weight, output_font)
        for (name, weight, _source_font), (_supported, _unsupported, output_font)
        in zip(NOTO_FONT_WEIGHTS, article_coverage)
    ]

    for post_id, requested in page_requests:
        build_noto_family("freecat-noto-sans-sc", requested, POST_OUTPUT_DIR / post_id, font_weights=article_font_weights)
        print(f"Post {post_id} Noto Sans SC requested characters: {len(requested)}")

    print(f"Post Noto Sans SC pages: {len(pages)}")


def main():
    build_figtree_family()
    build_ui_noto_family()
    build_post_noto_families()


if __name__ == "__main__":
    main()
