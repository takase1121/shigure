# Shigure

Like JSDoc, but for bots.

Shigure acts as a pipeline with `Reader`s taking filename as input and outputs a `Command`. The command can be transformed before passing to a `Writer`.

## Install
```sh
npm i -D @shigure/core @shigure/cli
npm i -D @shigure/reader-jsdoc @shigure/writer-json # optional, install if needed
```

## Examples

```js
// config.js
const { JsdocReader } = require('@shigure/reader-jsdoc')
const { JsonWriter } = require('@shigure/writer-json')

module.exports = {
    include: ['commands/*.js'],
    exclude: [],
    pipeline: [new JsdocReader(), new JsonWriter('doc.json')]
}
```
```
shigure -c config.js
```

## Readers and Writers

Currently, only [JSDoc Reader](https://github.com/takase1121/shigure/tree/master/packages/reader-jsdoc) and [JSON Writer](https://github.com/takase1121/shigure/tree/master/packages/writer-json) are available. Other readers and writers are planned.

