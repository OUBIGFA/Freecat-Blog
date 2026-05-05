const fs = require('fs');
const path = require('path');
const { minify: htmlMinify } = require('html-minifier-terser');
const { minify: terserMinify } = require('terser');

const HTML_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: false,
    minifyCSS: true,
    minifyJS: true,
    decodeEntities: false,
    conservativeCollapse: false,
    keepClosingSlash: true,
    preserveLineBreaks: false,
};

function walk(dir, accept) {
    const out = [];
    const stack = [dir];
    while (stack.length) {
        const cur = stack.pop();
        for (const name of fs.readdirSync(cur)) {
            const p = path.join(cur, name);
            const st = fs.statSync(p);
            if (st.isDirectory()) stack.push(p);
            else if (accept(p)) out.push(p);
        }
    }
    return out;
}

async function minifyDist(distDir) {
    let htmlBytesBefore = 0, htmlBytesAfter = 0;
    let jsBytesBefore = 0, jsBytesAfter = 0;
    let htmlCount = 0, jsCount = 0;

    const htmlFiles = walk(distDir, p => p.endsWith('.html'));
    for (const f of htmlFiles) {
        const src = fs.readFileSync(f, 'utf-8');
        htmlBytesBefore += Buffer.byteLength(src);
        try {
            const out = await htmlMinify(src, HTML_OPTIONS);
            fs.writeFileSync(f, out);
            htmlBytesAfter += Buffer.byteLength(out);
            htmlCount++;
        } catch (err) {
            console.warn(`   ⚠️ html-minify failed: ${path.relative(distDir, f)} — ${err.message}`);
            htmlBytesAfter += Buffer.byteLength(src);
        }
    }

    // JS：仅处理 assets/ 下我们的源 JS（跳过第三方与 .min.js）
    const jsFiles = walk(path.join(distDir, 'assets'), p =>
        p.endsWith('.js') && !p.endsWith('.min.js')
    );
    for (const f of jsFiles) {
        const src = fs.readFileSync(f, 'utf-8');
        jsBytesBefore += Buffer.byteLength(src);
        try {
            const result = await terserMinify(src, {
                compress: { passes: 2, drop_console: false },
                mangle: true,
                format: { comments: false }
            });
            const out = result.code || src;
            fs.writeFileSync(f, out);
            jsBytesAfter += Buffer.byteLength(out);
            jsCount++;
        } catch (err) {
            console.warn(`   ⚠️ js-minify failed: ${path.relative(distDir, f)} — ${err.message}`);
            jsBytesAfter += Buffer.byteLength(src);
        }
    }

    const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;
    const pct = (a, b) => b === 0 ? '0%' : `${(((a - b) / a) * 100).toFixed(1)}%`;
    console.log(`   HTML: ${htmlCount} files ${fmt(htmlBytesBefore)} → ${fmt(htmlBytesAfter)} (-${pct(htmlBytesBefore, htmlBytesAfter)})`);
    console.log(`   JS:   ${jsCount} files ${fmt(jsBytesBefore)} → ${fmt(jsBytesAfter)} (-${pct(jsBytesBefore, jsBytesAfter)})`);
}

module.exports = { minifyDist };
