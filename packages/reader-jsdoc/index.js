"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsdocReader = void 0;
var fs_1 = require("fs");
var stream_1 = require("stream");
var comment_parser_1 = require("comment-parser");
var jsdoctype_1 = require("./jsdoctype");
function filterTag(type) {
    return function (block) {
        return block.tags.filter(function (_a) {
            var tag = _a.tag;
            return tag === type;
        });
    };
}
var commandTags = filterTag('command');
var argumentTags = filterTag('param');
var aliasTags = filterTag('alias');
var exampleTags = filterTag('example');
function parseType(type) {
    var rest = false;
    if (type.startsWith('...')) {
        rest = true;
        type = type.slice(3);
    }
    return {
        type: jsdoctype_1.parse(type),
        rest: rest
    };
}
var populateAliases = function (comment) {
    return aliasTags(comment)
        .reduce(function (arr, alias) {
        if (alias.name)
            arr.push(alias.name);
        alias.description.split(/\s+/g)
            .filter(function (token) { return token.length > 0; })
            .forEach(function (token) { return arr.push(token); });
        return arr;
    }, []);
};
var populateArguments = function (comment) {
    return argumentTags(comment)
        .map(function (_a) {
        var name = _a.name, type = _a.type, description = _a.description, optional = _a.optional;
        return ({
            name: name,
            type: parseType(type).type,
            description: description,
            rest: parseType(type).rest,
            optional: optional
        });
    });
};
var populateExamples = function (comment) {
    return exampleTags(comment)
        .map(function (_a) {
        var source = _a.source;
        return source.slice(1).map(function (s) { return s.tokens.description; }).join('\n');
    });
};
var populateCommand = function (comment) {
    var _a, _b;
    return ({
        name: (_b = (_a = commandTags(comment).pop()) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
        arguments: populateArguments(comment),
        description: comment.description,
        aliases: populateAliases(comment),
        examples: populateExamples(comment)
    });
};
var isCommand = function (comment) { return commandTags(comment).length !== 0; };
var JsdocReader = /** @class */ (function (_super) {
    __extends(JsdocReader, _super);
    function JsdocReader() {
        return _super.call(this, { objectMode: true }) || this;
    }
    JsdocReader.prototype._transform = function (filename, _encoding, cb) {
        var _this = this;
        try {
            var file = fs_1.readFileSync(filename, { encoding: 'utf-8' });
            var tree = comment_parser_1.parse(file);
            tree.filter(isCommand)
                .map(populateCommand)
                .forEach(function (command) { return _this.push(command); });
            cb();
        }
        catch (error) {
            cb(error);
        }
    };
    return JsdocReader;
}(stream_1.Transform));
exports.JsdocReader = JsdocReader;
