const { JsdocReader } = require('../dist/readers/JsdocReader')
const { JsonWriter } = require('../dist/writers/JsonWriter')

module.exports = {
    include: ['example/doc/*.js'],
    exclude: [],
    reader: new JsdocReader(),
    writer: new JsonWriter('example/doc.json')
}