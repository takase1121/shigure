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
exports.JsonWriter = void 0;
var fs_1 = require("fs");
var stream_1 = require("stream");
var JsonWriter = /** @class */ (function (_super) {
    __extends(JsonWriter, _super);
    function JsonWriter(filename) {
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.filename = filename;
        _this.commands = [];
        return _this;
    }
    JsonWriter.prototype._write = function (chunk, _encoding, callback) {
        this.commands.push(chunk);
        callback();
    };
    JsonWriter.prototype._final = function (callback) {
        try {
            var json = JSON.stringify(this.commands);
            fs_1.writeFileSync(this.filename, json, { encoding: 'utf-8' });
            callback(null);
        }
        catch (error) {
            callback(error);
        }
    };
    return JsonWriter;
}(stream_1.Writable));
exports.JsonWriter = JsonWriter;
