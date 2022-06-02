
# esbuild-plugin-glob-import

Glob imports with output that matches your dir structure.

## Setup

Inside your esbuild config add the plugin and configure.

```js
esbuild.buildSync({
  // ...
  plugins: [
    globImports({
      // nothing yet...
    })
  ]
})
```

## Plugin Options

```js
{
  default: '' // (Optional) Filename of a dir's entrypoint.
}
```

## Example with default

In this example the option `default` is set to `index.js` to prune imported modules.

```js
import pages from './pages/**/index.js'
console.log(pages)
```

```js
{
  home: function () {
    // ...
  },
  about: function () {
    // ...
  },
  error: function () {
    // ...
  }
}
```

## Example without default

In this example no default was used. No assumptions are made here.

```js
import pages from './pages/**/index.js'
console.log(pages)
```

```js
{
  home: {
    'index.js': function () {
      // ...
    }
  },
  about: {
    'index.js': function () {
      // ...
    },
    content {
      'summary.js': function () {
        // ...
      },
      'history.js': function () {
        // ...
      }
    }
  },
  error: {
    'index.js': function () {
      // ...
    }
  }
}
```

## Prior Art

+ [esbuild](https://esbuild.github.io/)
+ [esbuild-plugin-import-glob](https://github.com/thomaschaaf/esbuild-plugin-import-glob)
+ [fast-glob](https://github.com/mrmlnc/fast-glob)
