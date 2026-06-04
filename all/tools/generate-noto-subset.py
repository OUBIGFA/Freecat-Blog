from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
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
OUTPUT_DIR = ROOT / "src" / "assets" / "fonts"

TEXT_SOURCES = [
    REPO_ROOT / "writing",
    REPO_ROOT / "Control",
    ROOT / "src" / "template_post.html",
    ROOT / "src" / "partials",
    ROOT / "build" / "seo.js",
    ROOT / "dist",
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


def collect_unicodes(include_ascii=False):
    codepoints = set()
    for source in TEXT_SOURCES:
        for file_path in iter_text_files(source):
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            if include_ascii:
                codepoints.update(ord(char) for char in text if ord(char) >= 0x20)
            else:
                codepoints.update(ord(char) for char in text if ord(char) > 0x7F)
    return codepoints


def build_subset(family, name, weight, source_font, requested):
    if not source_font.exists():
        raise FileNotFoundError(f"Missing source font: {source_font}")

    output_font = OUTPUT_DIR / f"freecat-{family}-{name}-subset.woff2"
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
        raise RuntimeError(f"{family} {name} subset is missing supported characters: {sample}")

    print(f"{family} {weight} {name}: {output_font.stat().st_size} bytes")
    return supported, unsupported


def main():
    requested_noto = collect_unicodes(include_ascii=False)
    requested_figtree = collect_unicodes(include_ascii=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    noto_coverage = []
    for name, weight, source_font in NOTO_FONT_WEIGHTS:
        noto_coverage.append(build_subset("noto-sans-sc", name, weight, source_font, requested_noto))

    figtree_coverage = []
    for name, weight, source_font in FIGTREE_FONT_WEIGHTS:
        figtree_coverage.append(build_subset("figtree", name, weight, source_font, requested_figtree))

    noto_supported = sorted(set().union(*(set(item[0]) for item in noto_coverage)))
    noto_unsupported = sorted(requested_noto - set(noto_supported))
    figtree_supported = sorted(set().union(*(set(item[0]) for item in figtree_coverage)))
    figtree_unsupported = sorted(requested_figtree - set(figtree_supported))

    print(f"Noto Sans SC requested characters: {len(requested_noto)}")
    print(f"Noto Sans SC covered by source fonts: {len(noto_supported)}")
    print(f"Noto Sans SC unsupported by source fonts: {len(noto_unsupported)}")
    print(f"Figtree requested characters: {len(requested_figtree)}")
    print(f"Figtree covered by source fonts: {len(figtree_supported)}")
    print(f"Figtree unsupported by source fonts: {len(figtree_unsupported)}")


if __name__ == "__main__":
    main()
