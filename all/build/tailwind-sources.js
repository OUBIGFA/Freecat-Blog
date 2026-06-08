const path = require('path');

const TAILWIND_SAFELIST = [
    'dark',
    'animate-fade-in-up',
    'delay-150',
    'delay-300'
];

function getTailwindContentGlobs(dirs) {
    return [
        path.join(dirs.output, '**/*.html'),
        path.join(dirs.assets, '**/*.{html,js,css}'),
        path.join(dirs.shared, '**/*.js'),
        path.join(dirs.build, '**/*.js')
    ];
}

module.exports = { TAILWIND_SAFELIST, getTailwindContentGlobs };
