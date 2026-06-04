const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.webp', 'image/webp'],
    ['.gif', 'image/gif'],
    ['.ico', 'image/x-icon'],
    ['.txt', 'text/plain; charset=utf-8'],
    ['.xml', 'application/xml; charset=utf-8'],
    ['.woff2', 'font/woff2'],
    ['.woff', 'font/woff'],
    ['.ttf', 'font/ttf'],
    ['.otf', 'font/otf'],
    ['.mp3', 'audio/mpeg'],
    ['.mp4', 'video/mp4']
]);

function runBuild() {
    const result = spawnSync(process.execPath, [path.join(rootDir, 'build.js')], {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
        }
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function assertPreviewReady() {
    const requiredFiles = [
        'index.html',
        path.join('assets', 'tailwind.css'),
        path.join('assets', 'main.js'),
        path.join('assets', 'fonts', 'freecat-noto-sans-sc-regular-subset.woff2')
    ];

    const missing = requiredFiles.filter(file => !fs.existsSync(path.join(distDir, file)));
    if (missing.length) {
        throw new Error(`Preview cannot start because dist is incomplete: ${missing.join(', ')}`);
    }
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return '';
    }
}

function resolveFilePath(requestUrl) {
    const url = new URL(requestUrl, `http://${host}:${port}`);
    const pathname = safeDecode(url.pathname);
    const cleanPath = path.normalize(pathname).replace(/^([/\\])+/, '');
    const candidate = path.resolve(distDir, cleanPath);
    const relative = path.relative(distDir, candidate);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return null;
    }

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }

    const indexFile = path.join(candidate, 'index.html');
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
        return indexFile;
    }

    return null;
}

function sendNotFound(res) {
    const notFoundFile = path.join(distDir, '404.html');
    if (fs.existsSync(notFoundFile)) {
        res.writeHead(404, responseHeaders(notFoundFile));
        fs.createReadStream(notFoundFile).pipe(res);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
}

function responseHeaders(filePath) {
    return {
        'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
    };
}

function startServer() {
    const server = http.createServer((req, res) => {
        const filePath = resolveFilePath(req.url || '/');
        if (!filePath) {
            sendNotFound(res);
            return;
        }

        res.writeHead(200, responseHeaders(filePath));
        fs.createReadStream(filePath).pipe(res);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Preview port ${host}:${port} is already in use. Stop the old preview and run npm run preview again.`);
            process.exit(1);
        }
        throw error;
    });

    server.listen(port, host, () => {
        console.log(`Preview ready: http://${host}:${port}/`);
    });
}

runBuild();
assertPreviewReady();
startServer();
