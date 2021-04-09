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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = exports.pump = exports.Walkdir = exports.GlobMatcher = void 0;
var stream_1 = require("stream");
var path_1 = require("path");
var fs_1 = require("fs");
var pump_1 = __importDefault(require("pump"));
var GlobMatcher = /** @class */ (function (_super) {
    __extends(GlobMatcher, _super);
    function GlobMatcher(match, except) {
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.match = match;
        _this.except = except;
        return _this;
    }
    GlobMatcher.prototype._transform = function (filename, _encoding, callback) {
        try {
            if (this.match.some(function (glob) { return glob(filename); })
                && !this.except.some(function (glob) { return glob(filename); }))
                this.push(filename);
            callback();
        }
        catch (error) {
            callback(error);
        }
    };
    return GlobMatcher;
}(stream_1.Transform));
exports.GlobMatcher = GlobMatcher;
var Walkdir = /** @class */ (function (_super) {
    __extends(Walkdir, _super);
    function Walkdir(path) {
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.stack = [path];
        return _this;
    }
    Walkdir.prototype._read = function () {
        var _this = this;
        var _loop_1 = function (i) {
            var path = this_1.stack.pop();
            if (!path) {
                this_1.push(null);
                return "break";
            }
            try {
                var pathInfo = fs_1.lstatSync(path);
                if (pathInfo.isDirectory())
                    fs_1.readdirSync(path)
                        .map(function (d) { return path_1.join(path, d); })
                        .forEach(function (d) { return _this.stack.push(d); });
                else
                    this_1.push(path);
            }
            catch (error) {
                this_1.destroy(error);
            }
        };
        var this_1 = this;
        for (var i = 0; i < 100; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
    };
    return Walkdir;
}(stream_1.Readable));
exports.Walkdir = Walkdir;
function pump() {
    var stream = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stream[_i] = arguments[_i];
    }
    return new Promise(function (resolve, reject) {
        pump_1.default.apply(void 0, __spreadArray(__spreadArray([], stream), [function (error) { return error ? reject(error) : resolve(); }]));
    });
}
exports.pump = pump;
var state = ['|', '/', '-', '\\'];
var Progress = /** @class */ (function (_super) {
    __extends(Progress, _super);
    function Progress() {
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.i = 0;
        _this.state = 0;
        _this.queue = ['???'];
        if (process.stderr.isTTY) {
            _this.reportTTY();
        }
        return _this;
    }
    Progress.prototype.reportTTY = function () {
        var _this = this;
        var _a;
        var filename = (_a = this.queue) === null || _a === void 0 ? void 0 : _a.shift();
        if (filename) {
            var text = state[this.state] + "\tProcessing: " + filename;
            process.stderr.cursorTo(0);
            process.stderr.clearLine(1);
            process.stderr.write(text);
            this.state++;
            if (this.state > 3)
                this.state = 0;
        }
        if (!this.destroyCb || this.queue.length > 0)
            this.loop = setTimeout(function () { return _this.reportTTY(); }, 150);
        else
            this.destroyCb();
    };
    Progress.prototype.reportFallback = function (filename) {
        console.error(++this.i + ": Processing: " + filename);
    };
    Progress.prototype._transform = function (filename, _encoding, callback) {
        if (process.stderr.isTTY)
            this.queue.push(filename);
        else
            this.reportFallback(filename);
        this.push(filename);
        callback();
    };
    Progress.prototype._destroy = function (error, callback) {
        this.destroyCb = function () { return callback(error); }; // wait for queue to be emptied
    };
    return Progress;
}(stream_1.Transform));
exports.Progress = Progress;
