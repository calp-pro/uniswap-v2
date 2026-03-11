const path = require('path')
const fs = require('fs')
const os = require('os')
const home = os.homedir()
const pkg = require('../package.json')

module.exports = factory => path.join(
    ...(process.env.GITHUB_ACTIONS
        ? ['.']
        : process.platform == 'win32'
            ? process.env.LOCALAPPDATA || process.env.APPDATA
                ? [process.env.LOCALAPPDATA || process.env.APPDATA]
                : [home, 'AppData', 'Local']
            : process.platform == 'darwin'
                ? [home, 'Library', 'Caches']
                : process.env.XDG_CACHE_HOME && path.isAbsolute(process.env.XDG_CACHE_HOME) && fs.existsSync(process.env.XDG_CACHE_HOME)
                    ? [process.env.XDG_CACHE_HOME]
                    : fs.existsSync(path.join(home, '.cache'))
                        ? [home, '.cache']
                        : [os.tmpdir()]
    ),
    `${pkg.name}_${factory.toLowerCase()}.csv`
)