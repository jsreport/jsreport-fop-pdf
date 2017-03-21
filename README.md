# jsreport-fop-pdf
[![NPM Version](http://img.shields.io/npm/v/jsreport-fop-pdf.svg?style=flat-square)](https://npmjs.com/package/jsreport-fop-pdf)

jsreport recipe which is rendering pdf using [apache fop](https://xmlgraphics.apache.org/fop/)

See https://jsreport.net/learn/fop-pdf

## Installation
> npm install jsreport-fop-pdf

## Usage
To use `recipe` in for template rendering set `template.recipe=fop-pdf` in the rendering request.

```js
{
  template: { content: '...', recipe: 'fop-pdf', enginne: '...' }
}
```

## jsreport-core
You can apply this extension also manually to [jsreport-core](https://github.com/jsreport/jsreport-core)

```js
var jsreport = require('jsreport-core')()
jsreport.use(require('jsreport-fop-pdf')())
```
