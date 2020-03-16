CodeEngine Filesystem Destination
======================================

[![Cross-Platform Compatibility](https://engine.codes/img/badges/os-badges.svg)](https://github.com/CodeEngineOrg/code-engine-destination-filesystem/blob/master/.github/workflows/CI-CD.yaml)
[![Build Status](https://github.com/CodeEngineOrg/code-engine-destination-filesystem/workflows/CI-CD/badge.svg)](https://github.com/CodeEngineOrg/code-engine-destination-filesystem/blob/master/.github/workflows/CI-CD.yaml)

[![Coverage Status](https://coveralls.io/repos/github/CodeEngineOrg/code-engine-destination-filesystem/badge.svg?branch=master)](https://coveralls.io/github/CodeEngineOrg/code-engine-destination-filesystem)
[![Dependencies](https://david-dm.org/CodeEngineOrg/code-engine-destination-filesystem.svg)](https://david-dm.org/CodeEngineOrg/code-engine-destination-filesystem)

[![npm](https://img.shields.io/npm/v/code-engine-destination-filesystem.svg)](https://www.npmjs.com/package/code-engine-destination-filesystem)
[![License](https://img.shields.io/npm/l/code-engine-destination-filesystem.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/CodeEngineOrg/code-engine-destination-filesystem)



This is a [CodeEngine](https://engine.codes/) plugin that writes files to the filesystem (local disk or network).

> **NOTE:** This plugin is already built-into the [CodeEngine CLI](https://github.com/CodeEngineOrg/code-engine/wiki/Command-Line-Interface), so you may not need to use it directly unless you are using CodeEngine's [programmatic API](https://github.com/CodeEngineOrg/code-engine/wiki/Programmatic-API).



Installation
-------------------------------
Install using [npm](https://docs.npmjs.com/about-npm/).

```bash
npm install code-engine-destination-filesystem
```



Usage
-------------------------------
If you're using the [CodeEngine CLI](https://github.com/CodeEngineOrg/code-engine/wiki/Command-Line-Interface), then this plugin is already built-in, and you can use it simply by specifying a `destination` path in your [generator](https://github.com/CodeEngineOrg/code-engine/wiki/Creating-a-Generator).

```javascript
export default {
  destination: "my/output/directory",
};
```

If you need to set more advanced [options](#options), then you will need to explicitly import and use `code-engine-destination-filesystem`.

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: "*.html"
  }),
};
```



Options
-------------------------------
You can set several options to customize the behavior of the `code-engine-destination-filesystem` plugin. The only required option is `path`. All others are optional.

### `path`
The relative or absolute path of the destination directory. The directory will be created if it doesn't exist. If it _does_ already exist, then the existing directory and its contents will be moved to trash (recycle bin on Windows), and a new directory will be created.


### `filter`
One or more [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns), [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), or filter functions that limit which files are written. By default, all files are written.

The `filter` option can be set to a [glob pattern](https://github.com/sindresorhus/globby#globbing-patterns), like this:

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: "**/*.html"
  }),
};
```


It can also be set to a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions). For example, here's a `filter` that only writes `.htm` and `.html` files:

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: /\.html?$/
  }),
};
```

You can also use a custom function that accepts a CodeEngine [`File` object](https://github.com/CodeEngineOrg/code-engine/wiki/Files) and returns `true` if the file should be written.  Here's a `filter` that only writes files that do not have the word "draft" in their name:

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: (file) => !file.name.includes("draft")
  }),
};
```

You can even specify multiple filters using an array. The plugin will write files that match **any** of the filter criteria. Here's a `filter` that will write HTML files, any file in the `img` directory, or any file that does not have the word "draft" in the name:

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: [
      /\.html?$/,
      "img/**/*",
      (file) => !file.name.includes("draft")
    ]
  }),
};
```

Another option is to specify separate `include` and `exclude` criteria. Each of these can be a single filter or an array of filters. For example, here's a `filter` that will write HTML files or files in in the `img` directory, but _only_ if they don't contain the word "draft" in the name:

```javascript
import filesystem from "code-engine-destination-filesystem";

export default {
  destination: filesystem({
    path: "my/output/directory",
    filter: {
      include: [
        /\.html?$/,
        "img/**/*",
      },
      exclude: (file) => file.name.includes("draft")
    }
  }),
};
```


### fs
This option allows you to provide your own custom implementation of the [Node.js filesystem module](https://nodejs.org/api/fs.html). Examples of packages you could substitute include:

  - [graceful-fs](https://www.npmjs.com/package/graceful-fs)
  - [virtual-fs](https://www.npmjs.com/package/virtualfs)
  - [fs-in-memory](https://www.npmjs.com/package/fs-in-memory)



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [File an issue](https://github.com/CodeEngineOrg/code-engine-destination-filesystem/issues) on GitHub and [submit a pull request](https://github.com/CodeEngineOrg/code-engine-destination-filesystem/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/CodeEngineOrg/code-engine-destination-filesystem.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
Code Engine Destination Filesystem is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/CodeEngineOrg/code-engine-destination-filesystem) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![Travis CI](https://engine.codes/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://engine.codes/img/badges/sauce-labs.svg)](https://saucelabs.com)
[![Coveralls](https://engine.codes/img/badges/coveralls.svg)](https://coveralls.io)
