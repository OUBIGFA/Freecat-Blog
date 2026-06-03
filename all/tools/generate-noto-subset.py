from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
SOURCE_FONT = ROOT / "fonts" / "freecat-noto-sans-sc-regular.woff2"
OUTPUT_FONT = ROOT / "src" / "assets" / "fonts" / "freecat-noto-sans-sc-regular-subset.woff2"

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


def main():
    if not SOURCE_FONT.exists():
        raise FileNotFoundError(f"Missing source font: {SOURCE_FONT}")

    requested = collect_unicodes()
    source_cmap = set(TTFont(str(SOURCE_FONT)).getBestCmap().keys())
    supported = sorted(requested & source_cmap)
    unsupported = sorted(requested - source_cmap)

    OUTPUT_FONT.parent.mkdir(parents=True, exist_ok=True)

    args = [
        str(SOURCE_FONT),
        f"--output-file={OUTPUT_FONT}",
        "--flavor=woff2",
        "--ignore-missing-unicodes",
        "--no-hinting",
        "--layout-features=*",
        "--unicodes=" + ",".join(f"U+{codepoint:04X}" for codepoint in supported),
    ]
    subset.main(args)

    output_cmap = set(TTFont(str(OUTPUT_FONT)).getBestCmap().keys())
    missing = sorted(set(supported) - output_cmap)
    if missing:
        sample = " ".join(f"U+{codepoint:04X}" for codepoint in missing[:20])
        raise RuntimeError(f"Subset is missing supported characters: {sample}")

    print(f"Requested characters: {len(requested)}")
    print(f"Covered by source font: {len(supported)}")
    print(f"Unsupported by source font: {len(unsupported)}")
    print(f"Subset size: {OUTPUT_FONT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
