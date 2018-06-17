module.exports = {
    stripPrefix: 'build/',
    staticFileGlobs: [
        'build/*.html',
        'build/*.sgf',
        'build/manifest.json',
        'build/static/**/!(*map*)',
    ],
    dontCacheBustUrlsMatching: /\.\w{8}\./,
    swFilePath: 'build/service-worker.js'
};