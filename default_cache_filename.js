const path = require('path')
const env = process.env
const fs = require('fs')
const os = require('os')
const home = os.homedir()
const pkg = require('./package.json')

const is_dir = _ => fs.statSync(_, {throwIfNoEntry:false})?.isDirectory()

module.exports = (factory) => path.join(
  ...(process.platform === 'win32'
      ? env.LOCALAPPDATA || env.APPDATA
        ? [env.LOCALAPPDATA || env.APPDATA]
        : [home, 'AppData', 'Local']
      : process.platform === 'darwin'
        ? [home, 'Library', 'Caches']
        : env.XDG_CACHE_HOME && path.isAbsolute(env.XDG_CACHE_HOME) && is_dir(env.XDG_CACHE_HOME)
          ? [env.XDG_CACHE_HOME]
          : is_dir(path.join(home, '.cache'))
            ? [home, '.cache']
            : [is_dir(os.tmpdir()) ? os.tmpdir() : home],
  `${pkg.name}_${factory.toLowerCase()}.csv`
)
