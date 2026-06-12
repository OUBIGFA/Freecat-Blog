const path = require('path');
const fs = require('fs');
const fontkit = require('fontkit');
const subsetFont = require('subset-font');

const {
    CACHE_VERSION,
    FONT_FAMILIES,
    fontSubsetManifestFile,
    iterPostPages,
    requestedCodepointsByFamily,
    sha256File
} = require('./fonts.js');

function relativePosixPath(rootDir, filePath) {
    return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function parseTargetArgs(argv) {
    const rawTargets = [];
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] !== '--target') continue;
        const value = argv[index + 1];
        if (!value || !value.includes(':')) {
            throw new Error(`Invalid --target ${value ?? '(missing)'}; expected family:weight`);
        }
        rawTargets.push(value);
        index++;
    }
    if (rawTargets.length === 0) return null;

    const targets = {};
    for (const rawTarget of rawTargets) {
        const [family, weight] = rawTarget.split(/:(.*)/s);
        (targets[family] ??= new Set()).add(weight);
    }
    return targets;
}

function selectedWeights(family, targets) {
    if (!targets) return family.weights;
    const names = targets[family.prefix];
    if (!names) return [];
    return family.weights.filter(([name]) => names.has(name));
}

function fontCodepoints(buffer) {
    return new Set(fontkit.create(buffer).characterSet);
}

async function buildSubset({ rootDir, family, weightName, weightNumber, sourceName, requested }) {
    const sourceFile = path.join(rootDir, 'fonts', sourceName);
    if (!fs.existsSync(sourceFile)) {
        throw new Error(`Missing source font: ${sourceFile}`);
    }

    const outputDir = path.join(rootDir, 'src', 'assets', 'fonts');
    const outputFile = path.join(outputDir, `${family.prefix}-${weightName}-subset.woff2`);
    const sourceBuffer = fs.readFileSync(sourceFile);
    const sourceCmap = fontCodepoints(sourceBuffer);
    let supported = [...requested].filter(codepoint => sourceCmap.has(codepoint)).sort((a, b) => a - b);
    const unsupported = [...requested].filter(codepoint => !sourceCmap.has(codepoint)).sort((a, b) => a - b);

    if (supported.length === 0 && sourceCmap.has(0x20)) supported = [0x20];

    if (fs.existsSync(outputFile)) {
        let existingCmap = null;
        try {
            existingCmap = fontCodepoints(fs.readFileSync(outputFile));
        } catch {
            existingCmap = null;
        }
        if (
            existingCmap &&
            existingCmap.size === supported.length &&
            supported.every(codepoint => existingCmap.has(codepoint))
        ) {
            console.log(`${family.prefix} ${weightNumber} ${weightName}: reused ${fs.statSync(outputFile).size} bytes`);
            return { weightName, sourceFile, outputFile, supported, unsupported };
        }
    }

    const subsetBuffer = await subsetFont(sourceBuffer, String.fromCodePoint(...supported), { targetFormat: 'woff2' });
    const subsetCmap = fontCodepoints(subsetBuffer);
    const missing = supported.filter(codepoint => !subsetCmap.has(codepoint));
    if (missing.length > 0) {
        const sample = missing.slice(0, 20).map(codepoint => `U+${codepoint.toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
        throw new Error(`${family.prefix} ${weightName} subset is missing supported characters: ${sample}`);
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, subsetBuffer);
    console.log(`${family.prefix} ${weightNumber} ${weightName}: ${subsetBuffer.length} bytes`);
    return { weightName, sourceFile, outputFile, supported, unsupported };
}

async function buildFamily({ rootDir, family, requested, targets }) {
    const weights = selectedWeights(family, targets);
    if (weights.length === 0) return null;

    const coverage = [];
    for (const [weightName, weightNumber, sourceName] of weights) {
        coverage.push(await buildSubset({ rootDir, family, weightName, weightNumber, sourceName, requested }));
    }

    const covered = new Set(coverage.flatMap(entry => entry.supported));
    const unsupportedCount = [...requested].filter(codepoint => !covered.has(codepoint)).length;
    if (family.key === 'articleNotoSansSc') {
        console.log(`${family.label} pages: ${iterPostPages(rootDir).length}`);
    }
    console.log(`${family.label} requested characters: ${requested.size}`);
    console.log(`${family.label} covered by source fonts: ${covered.size}`);
    console.log(`${family.label} unsupported by source fonts: ${unsupportedCount}`);

    const subsets = {};
    for (const entry of coverage) {
        subsets[entry.weightName] = {
            source: relativePosixPath(rootDir, entry.sourceFile),
            sourceSha256: sha256File(entry.sourceFile),
            output: relativePosixPath(rootDir, entry.outputFile),
            supported: entry.supported,
            unsupported: entry.unsupported
        };
    }
    return {
        requested: [...requested].sort((a, b) => a - b),
        subsets
    };
}

function readExistingManifest(manifestFile) {
    if (!fs.existsSync(manifestFile)) return { version: CACHE_VERSION, families: {} };
    try {
        return JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
    } catch {
        return { version: CACHE_VERSION, families: {} };
    }
}

function mergeFamilyManifest(existingFamily, partialFamily) {
    if (!existingFamily) return partialFamily;
    return {
        requested: partialFamily.requested,
        subsets: { ...existingFamily.subsets, ...partialFamily.subsets }
    };
}

async function generateFontSubsets({ rootDir, targets = null }) {
    const requestedByFamily = requestedCodepointsByFamily(rootDir);
    const manifestFile = fontSubsetManifestFile(rootDir);
    const families = { ...readExistingManifest(manifestFile).families };

    for (const family of FONT_FAMILIES) {
        const familyManifest = await buildFamily({
            rootDir,
            family,
            requested: requestedByFamily[family.prefix] || new Set(),
            targets
        });
        if (familyManifest === null) continue;
        families[family.prefix] = mergeFamilyManifest(families[family.prefix], familyManifest);
    }

    fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
    fs.writeFileSync(manifestFile, `${JSON.stringify({ version: CACHE_VERSION, families }, null, 2)}\n`, 'utf-8');
    console.log(`Font subset manifest: ${relativePosixPath(rootDir, manifestFile)}`);
}

if (require.main === module) {
    generateFontSubsets({
        rootDir: path.resolve(__dirname, '..'),
        targets: parseTargetArgs(process.argv.slice(2))
    }).catch(error => {
        console.error(error && error.stack ? error.stack : String(error));
        process.exit(1);
    });
}

module.exports = {
    generateFontSubsets,
    parseTargetArgs
};
