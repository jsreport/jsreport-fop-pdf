# jsreport-phantom-pdf
[![NPM Version](http://img.shields.io/npm/v/jsreport-phantom-pdf.svg?style=flat-square)](https://npmjs.com/package/jsreport-phantom-pdf)
[![Build Status](https://travis-ci.org/jsreport/jsreport-phantom-pdf.png?branch=master)](https://travis-ci.org/jsreport/jsreport-phantom-pdf)

jsreport recipe which is rendering pdf using [apache fop](https://xmlgraphics.apache.org/fop/)

See http://jsreport.net/learn/fop-pdf

##Installation
> npm install jsreport-fop-pdf

##Usage
To use `recipe` in for template rendering set `template.recipe=phantom-pdf` in the rendering request.

```js
{
  template: { content: '...', recipe: 'fop-pdf', enginne: '...' }
}
```

##jsreport-core
You can apply this extension also manually to [jsreport-core](https://github.com/jsreport/jsreport-core)

```js
var jsreport = require('jsreport-core')()
jsreport.use(require('jsreport-fop-pdf')())
```
