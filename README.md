
# esbuild-plugin-glob-import

Glob imports with output that matches your file structure.

## Install

```sh
$ npm i esbuild-plugin-glob-import
```

## Setup

Add the plugin inside your esbuild options.

```js
esbuild.buildSync({
  // ...
  plugins: [
    globImports()
  ]
})
```

## Options

```js
{
  entryPoint: 'index.js' // (Optional) Filename of a directory's default entry point.
  camelCase: true // (Optional) Removes file extensions and converts filenames to camel case.
}
```

## Example with default options

File structure:

```
/pages
  /home
    home.css
    index.js
  /about
    /content
      summary.js
      history.js
    about.css
    index.js
  /error
    error.css
    index.js
```

Glob import statement:

```js
import pages from './pages/**/index.js'
console.log(pages)
```

Output:

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

## Example with `entryPoint` and `camelCase` set to `false`

Using the same file structure and import statement from the previous example.

Output:

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
