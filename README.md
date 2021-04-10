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

Currently, [JSDoc Reader](https://github.com/takase1121/shigure/tree/master/packages/reader-jsdoc), [JSON Writer](https://github.com/takase1121/shigure/tree/master/packages/writer-json) and [handlebars Writer](https://github.com/takase1121/shigure/tree/master/packages/writer-handlebars) are available. handlebars is probably flexible enough for most use cases, so I'm not planning to add new Writers.

