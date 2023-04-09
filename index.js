
import path from 'node:path'
import glob from 'fast-glob'

const filter = /\*/
const namespace = 'plugin-glob-imports'

export default function globImportPlugin (options) {
  options ??= {}

  options.entryPoint ??= 'index'
  options.entryPointMatch ??= arr => arr[arr.length - 1] === options.entryPoint

  options.camelCase ??= true
  options.removeExtensions ??= true

  options.defaultExports ??= true
  options.namedExports ??= true

  return {
    name: namespace,
    setup (build) {
      build.onResolve({ filter }, resolve)
      build.onLoad({ filter, namespace }, args => load(args, options))
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
    namespace,
    path: args.path,
    pluginData: {
      resolveDir: args.resolveDir,
      resolvePaths
    }
  }
}

function load (args, opts) {
  const pluginData = args.pluginData
  const paths = pluginData.resolvePaths

  const obj = {}
  const objExp = {}

  let importStatements = '\n'

  for (let i = 0; i < paths.length; i++) {
    let filepath = paths[i]

    // replace all non-alphanumeric characters with underscores
    // except for forward slashes and dots
    filepath = filepath.replace(/[^a-zA-Z0-9./]/g, '_')

    // remove file extensions
    if (opts.removeExtensions) {
      filepath = filepath.replace(/\.[^.]+$/, '')
    }

    const arr = filepath.split('/')

    arr.shift()

    // if the result of entryPointMatch is truthy, remove the last element
    // the directory key will now contain the module instead of the filename
    if (opts.entryPointMatch(arr)) {
      arr.pop()
    }

    let prev = obj
    let prevExp = objExp

    for (let j = 0; j < arr.length; j++) {
      let key = arr[j]

      if (typeof prev === 'string') {
        continue
      }

      // match the last item in the array, this should be the filename
      if (j === arr.length - 1) {
        const list = []

        // convert underscores to camel case
        if (opts.camelCase) {
          key = key.replace(/_([a-z])/g, match => match[1].toUpperCase())
        }

        if (opts.defaultExports) {
          list.push(prev[key] = `_mod${i}`)
        }

        if (opts.namedExports) {
          prevExp[key] = `_obj${i}`
          list.push(`* as _obj${i}`)
        }

        importStatements += `import ${list.join(', ')} from './${filepath}'\n`
      }

      prev = prev[key] ??= {}
      prevExp = prevExp[key] ??= {}
    }
  }

  let result = importStatements

  if (opts.defaultExports) {
    result += '\nexport default '
    result += JSON.stringify(obj, null, 2)
      .replace(/".+?"/g, match => match.slice(1, -1))
    result += '\n'
  }

  if (opts.namedExports) {
    for (const key in objExp) {
      const value = JSON.stringify(objExp[key], null, 2)
        .replace(/".+?"/g, match => match.slice(1, -1))

      result += `\nexport const ${key} = ${value}`

      if (typeof objExp[key] === 'object') {
        result += '\n'
      }
    }

    result += '\n'
  }

  return {
    resolveDir: pluginData.resolveDir,
    contents: result
  }
}
