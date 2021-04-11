const { JsdocReader } = require('../dist/readers/JsdocReader')
const { JsonWriter } = require('../dist/writers/JsonWriter')

module.exports = {
    include: ['example/doc/*.js'],
    exclude: [],
    pipeline: [new JsdocReader(), new JsonWriter('example/doc.json')]
}