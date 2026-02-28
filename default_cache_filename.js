const path = require('path')
const {GITHUB_ACTIONS, XDG_CACHE_HOME, LOCALAPPDATA, APPDATA} = process.env
const fs = require('fs')
const os = require('os')
const home = os.homedir()
const pkg = require('./package.json')

module.exports = factory => path.join(
    ...(GITHUB_ACTIONS
        ? ['.']
        : process.platform == 'win32'
            ? LOCALAPPDATA || APPDATA
                ? [LOCALAPPDATA || APPDATA]
                : [home, 'AppData', 'Local']
            : process.platform == 'darwin'
                ? [home, 'Library', 'Caches']
                : XDG_CACHE_HOME && path.isAbsolute(XDG_CACHE_HOME) && fs.existsSync(XDG_CACHE_HOME)
                    ? [XDG_CACHE_HOME]
                    : fs.existsSync(path.join(home, '.cache'))
                        ? [home, '.cache']
                        : [os.tmpdir()]
    ),
    `${pkg.name}_${factory.toLowerCase()}.csv`
)