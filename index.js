
import path from 'node:path'
import glob from 'fast-glob'

const options = {
  filter: /\*/,
  namespace: 'plugin-glob-import'
}

export default function (pluginOptions) {
  return {
    name: 'plugin-glob-import',
    setup (build) {
      build.onResolve(options, resolve)
      build.onLoad(options, args => load(args, pluginOptions))
    }
  }
}

function resolve (args) {
  const resolvePaths = []
  const loadpath = path.join(args.resolveDir, args.path)

  let files = glob.sync(loadpath)
  files = files.length === 0 ? [loadpath] : files

  for (let i = 0; i < files.length; i++) {
    resolvePaths.push(path.relative(args.resolveDir, files[i]))
  }

  return {
    path: args.path,
    namespace: 'plugin-glob-import',
    pluginData: {
      resolveDir: args.resolveDir,
      resolvePaths
    }
  }
}

function load (args, opts) {
  const pluginData = args.pluginData
  const paths = pluginData.resolvePaths

  const data = []
  const obj = {}

  for (let i = 0; i < paths.length; i++) {
    const filepath = paths[i]
    const arr = filepath.split('/')
    const name = '_module' + i

    arr.shift()

    if (opts.default && arr[arr.length - 1] === opts.default) {
      arr.pop()
    }

    let prev = obj

    for (let i = 0; i < arr.length; i++) {
      const key = arr[i]

      if (typeof prev === 'string') {
        continue
      }

      if (i === arr.length - 1) {
        data.push(`import ${prev[key] = name} from './${filepath}'`)
        continue
      }

      prev = prev[key] ?? {}
    }
  }

  let output = JSON.stringify(obj)
  output = output.replace(/"_module\d+"/g, match => match.slice(1, -1))

  return {
    resolveDir: pluginData.resolveDir,
    contents: data.join('\n') + '\nexport default ' + output
  }
}
