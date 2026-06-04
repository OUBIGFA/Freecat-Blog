from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
FONT_WEIGHTS = [
    ("thin", 100, ROOT / "fonts" / "freecat-noto-sans-sc-thin.ttf"),
    ("extra-light", 200, ROOT / "fonts" / "freecat-noto-sans-sc-extra-light.ttf"),
    ("light", 300, ROOT / "fonts" / "freecat-noto-sans-sc-light.ttf"),
    ("regular", 400, ROOT / "fonts" / "freecat-noto-sans-sc-regular.woff2"),
    ("medium", 500, ROOT / "fonts" / "freecat-noto-sans-sc-medium.ttf"),
    ("semi-bold", 600, ROOT / "fonts" / "freecat-noto-sans-sc-semi-bold.ttf"),
    ("bold", 700, ROOT / "fonts" / "freecat-noto-sans-sc-bold.ttf"),
    ("extra-bold", 800, ROOT / "fonts" / "freecat-noto-sans-sc-extra-bold.ttf"),
    ("black", 900, ROOT / "fonts" / "freecat-noto-sans-sc-black.ttf"),
]
OUTPUT_DIR = ROOT / "src" / "assets" / "fonts"

TEXT_SOURCES = [
    REPO_ROOT / "writing",
    REPO_ROOT / "Control",
    ROOT / "src" / "template_post.html",
    ROOT / "src" / "partials",
    ROOT / "build" / "seo.js",
    ROOT / "dist" / "posts",
]


def iter_text_files(path):
    if path.is_file():
        yield path
        return

    if not path.exists():
        return

    for child in path.rglob("*"):
        if child.is_file() and child.suffix.lower() in {".html", ".js", ".md", ".txt"}:
            yield child


def collect_unicodes():
    codepoints = set()
    for source in TEXT_SOURCES:
        for file_path in iter_text_files(source):
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            codepoints.update(ord(char) for char in text if ord(char) > 0x7F)
    return codepoints


def build_subset(name, weight, source_font, requested):
    if not source_font.exists():
        raise FileNotFoundError(f"Missing source font: {source_font}")

    output_font = OUTPUT_DIR / f"freecat-noto-sans-sc-{name}-subset.woff2"
    source_cmap = set(TTFont(str(source_font)).getBestCmap().keys())
    supported = sorted(requested & source_cmap)
    unsupported = sorted(requested - source_cmap)
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
        raise RuntimeError(f"{name} subset is missing supported characters: {sample}")

    print(f"{weight} {name}: {output_font.stat().st_size} bytes")
    return supported, unsupported


def main():
    requested = collect_unicodes()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    coverage = []
    for name, weight, source_font in FONT_WEIGHTS:
        coverage.append(build_subset(name, weight, source_font, requested))

    supported = sorted(set().union(*(set(item[0]) for item in coverage)))
    unsupported = sorted(requested - set(supported))

    print(f"Requested characters: {len(requested)}")
    print(f"Covered by source fonts: {len(supported)}")
    print(f"Unsupported by source fonts: {len(unsupported)}")


if __name__ == "__main__":
    main()
