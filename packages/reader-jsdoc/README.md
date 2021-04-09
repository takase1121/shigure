# `@shigure/reader-jsdoc`

This package provides `JsdocReader` which reads JsDoc comments.

## Install
```
npm i -D @shigure/reader-jsdoc
```

## Supported JSDoc
#### Tags
- `@command [name]`
- `@param {type} name description`
- `@alias alias1 alias2 ...`
- `@example example...`

#### Types
- `string`
- `number`
- `User`
- `Role`
- `Channel`

> Types can be Unions or array. Eg: `(strring | number)[]`