"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var log = require("npmlog");
var dev_server_impl_1 = require("@nrwl/web/src/executors/dev-server/dev-server.impl");
var LOGGER_SCOPE = 'tools/executors/serve';
var logEnvData = function (envMap, envFiles, env, defaultEnvFile) {
    if (env && !envMap[env]) {
        log.warn(LOGGER_SCOPE, "No environment called \"".concat(env, "\" found."));
        log.info(LOGGER_SCOPE, envFiles.length > 0
            ? "You can create a new environment by putting an \".env.".concat(env, "\" file in your project root, or you can use the following available ones: ").concat(envFiles.join(', '), ".")
            : 'To get started with environments, you can create an ".env" file in your project root with the desired variables.');
    }
    if (!envMap[env]) {
        log.info(LOGGER_SCOPE, defaultEnvFile
            ? "Using \"".concat(defaultEnvFile, "\" as the default project environment.")
            : 'Serving the project only using the environment variables scoped to your CLI.');
    }
    else {
        log.info(LOGGER_SCOPE, "Using \"".concat(envMap[env], "\" as the default project environment."));
    }
};
var filenameToEnv = function (filename) { return filename.replace('.env.', ''); };
var getDefaultEnvFile = function (envMap) {
    return envMap['local'] || envMap['.env'];
};
var getEnvFile = function (env, envFiles) {
    var envMap = envFiles.reduce(function (acc, filename) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[filenameToEnv(filename)] = filename, _a)));
    }, {});
    var defaultEnvFile = getDefaultEnvFile(envMap);
    logEnvData(envMap, envFiles, env, defaultEnvFile);
    return envMap[env] || defaultEnvFile;
};
function serve(options, context) {
    return __asyncGenerator(this, arguments, function serve_1() {
        var env, dsOptions, root, workspacePath, files, envFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    env = options.env, dsOptions = __rest(options, ["env"]);
                    root = context.workspace.projects[context.projectName].root;
                    workspacePath = path.join(context.cwd, root);
                    return [4 /*yield*/, __await(fs.promises.readdir(workspacePath))];
                case 1:
                    files = _a.sent();
                    envFile = getEnvFile(env, files.filter(function (f) { return f.startsWith('.env'); }));
                    if (env && envFile) {
                        dotenv.config({ path: path.join(workspacePath, envFile), override: true });
                    }
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, dev_server_impl_1["default"])(dsOptions, context))))];
                case 2: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports["default"] = serve;
