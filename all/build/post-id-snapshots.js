const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function validatePostId(file, value, options = {}) {
    const datesFilename = options.datesFilename || 'git-dates.json';
    const id = String(value == null ? '' : value).trim();
    if (!/^\d{16}$/.test(id)) {
        throw new Error(`Invalid post id for "${file}" in ${datesFilename}: "${id}".`);
    }
    return id;
}

function makePostIdFactory(existingIds, options = {}) {
    const used = new Set(Object.values(existingIds || {}).filter(Boolean));
    const first = options.first || dayjs().tz('Asia/Shanghai');
    let index = 0;

    return function nextPostId() {
        let id = '';
        do {
            const current = first.add(Math.floor(index / 99), 'second');
            const suffix = String((index % 99) + 1).padStart(2, '0');
            id = `${current.format('YYYYMMDDHHmmss')}${suffix}`;
            index += 1;
        } while (used.has(id));
        used.add(id);
        return id;
    };
}

function nextSequentialPostId(id) {
    const timestamp = id.slice(0, 14);
    const suffix = Number(id.slice(14));
    if (suffix < 99) {
        return `${timestamp}${String(suffix + 1).padStart(2, '0')}`;
    }

    const parsed = dayjs(
        `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}` +
        `T${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}`
    );
    return `${parsed.add(1, 'second').format('YYYYMMDDHHmmss')}01`;
}

function makeIdOwnerMap(ids) {
    const owners = new Map();
    for (const [file, id] of Object.entries(ids || {})) {
        const value = String(id || '').trim();
        if (value && !owners.has(value)) owners.set(value, file);
    }
    return owners;
}

function protectedOnlineOwner(id, history, onlineIdOwners) {
    const owner = onlineIdOwners.get(id);
    if (!owner) return '';
    return history.includes(owner) ? '' : owner;
}

function claimPostId(id, file, usedIds, reservedIds, options = {}) {
    let candidate = id;
    const history = options.history || [file];
    const onlineIdOwners = options.onlineIdOwners || new Map();
    const logger = options.logger || console;

    while (
        usedIds.has(candidate) ||
        protectedOnlineOwner(candidate, history, onlineIdOwners) ||
        (candidate !== id && reservedIds.has(candidate))
    ) {
        const existingFile = usedIds.get(candidate) || protectedOnlineOwner(candidate, history, onlineIdOwners);
        if (existingFile) {
            logger.warn(`Duplicate post id "${candidate}" for "${existingFile}" and "${file}". Reassigning "${file}" to the next available id.`);
        }
        candidate = nextSequentialPostId(candidate);
    }
    usedIds.set(candidate, file);
    return candidate;
}

function collectPostIdSnapshots(files, existingIds, options = {}) {
    const datesFilename = options.datesFilename || 'git-dates.json';
    const historicalBasenames = options.historicalBasenames || ((file) => [file]);
    const onlineIds = options.onlineIds || {};
    const preferredIds = { ...(existingIds || {}), ...onlineIds };
    const nextPostId = makePostIdFactory(preferredIds, { first: options.first });
    const onlineIdOwners = makeIdOwnerMap(onlineIds);
    const ids = {};
    const usedIds = new Map();
    const planned = files.map(file => {
        const history = historicalBasenames(file).map(name => path.basename(String(name || ''))).filter(Boolean);
        const idSource = history.find(name => preferredIds[name]);
        const id = idSource ? validatePostId(idSource, preferredIds[idSource], { datesFilename }) : nextPostId();
        return { file, id, history: Array.from(new Set([file, ...history])) };
    });
    const reservedIds = new Set(
        planned
            .filter(item => item.id)
            .map(item => item.id)
    );

    planned.forEach(({ file, id, history }) => {
        ids[file] = claimPostId(id, file, usedIds, reservedIds, {
            history,
            onlineIdOwners,
            logger: options.logger
        });
    });

    return ids;
}

module.exports = {
    collectPostIdSnapshots,
    makeIdOwnerMap,
    makePostIdFactory,
    nextSequentialPostId,
    validatePostId
};
