const path = require('path')
const env = process.env
const fs = require('fs')
const os = require('os')
const home = os.homedir()
const pkg = require('./package.json')

module.exports = (factory) => path.join(
  ...(process.platform === 'win32'
      ? (env.LOCALAPPDATA || env.APPDATA)
        ? [env.LOCALAPPDATA || env.APPDATA]
        : [home, 'AppData', 'Local']
      : process.platform === 'darwin'
        ? [home, 'Library', 'Caches']
        : (env.XDG_CACHE_HOME && path.isAbsolute(env.XDG_CACHE_HOME))
          ? [env.XDG_CACHE_HOME]
          : fs.existsSync(path.join(home, '.cache'))
            ? [home, '.cache']
            : [os.tmpdir()]
  ),
  `${pkg.name}_${factory.toLowerCase()}.csv`
)