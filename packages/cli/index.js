#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var mri_1 = __importDefault(require("mri"));
var picomatch_1 = __importDefault(require("picomatch"));
var util_1 = require("./util");
function usage() {
    console.error(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    "usage: " + require('../package.json').name + " [-ch]\n\n" +
        '\t--help, -h\tShows this message\n' +
        '\t--config, -c\tConfig file path\n');
}
function arg() {
    var args = mri_1.default(process.argv.slice(2), {
        boolean: 'help',
        string: 'config',
        alias: {
            help: 'h',
            config: 'c'
        }
    });
    return {
        help: args.help,
        config: args.config,
        _: args._
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, configFile, config, includePath, includeGlob, excludeGlob, matcher, jobs;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    Error.stackTraceLimit = 2;
                    args = arg();
                    if (!args.config || args.help) {
                        usage();
                        process.exit(1);
                    }
                    configFile = path_1.join(process.cwd(), args.config);
                    config = require(configFile);
                    (_a = config.include).push.apply(_a, args._);
                    includePath = config.include
                        .map(function (glob) { return picomatch_1.default.scan(glob, {}); })
                        .map(function (scan) { var _a; return (_a = scan) === null || _a === void 0 ? void 0 : _a.base; });
                    includeGlob = config.include
                        .map(function (glob) { return picomatch_1.default(glob); });
                    excludeGlob = config.exclude
                        .map(function (glob) { return picomatch_1.default(glob); });
                    matcher = new util_1.GlobMatcher(includeGlob, excludeGlob);
                    jobs = includePath.map(function (path) {
                        return util_1.pump(new util_1.Walkdir(path), new util_1.Progress(), matcher, config.reader, config.writer);
                    });
                    return [4 /*yield*/, Promise.all(jobs)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var keepAlive;
function wait() {
    keepAlive = setTimeout(wait, 1000);
}
main()
    .catch(console.error)
    .finally(function () { return clearTimeout(keepAlive); });
// wait for main thread
wait();
