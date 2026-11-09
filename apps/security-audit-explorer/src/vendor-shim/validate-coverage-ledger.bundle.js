#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res, err) => () => {
  if (fn)
    try {
      res = fn(fn = 0);
    } catch (e) {
      err = [e];
    }
  if (err)
    throw err[0];
  return res;
};
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node:path
function assertPath(path) {
  if (typeof path !== "string")
    throw TypeError("Path must be a string. Received " + JSON.stringify(path));
}
function normalizeStringPosix(path, allowAboveRoot) {
  var res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code;
  for (var i = 0;i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47)
      break;
    else
      code = 47;
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1)
        ;
      else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1)
                res = "", lastSegmentLength = 0;
              else
                res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              lastSlash = i, dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "", lastSegmentLength = 0, lastSlash = i, dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += "/..";
          else
            res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += "/" + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i, dots = 0;
    } else if (code === 46 && dots !== -1)
      ++dots;
    else
      dots = -1;
  }
  return res;
}
function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root, base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir)
    return base;
  if (dir === pathObject.root)
    return dir + base;
  return dir + sep + base;
}
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false, cwd;
  for (var i = arguments.length - 1;i >= -1 && !resolvedAbsolute; i--) {
    var path;
    if (i >= 0)
      path = arguments[i];
    else {
      if (cwd === undefined)
        cwd = process.cwd();
      path = cwd;
    }
    if (assertPath(path), path.length === 0)
      continue;
    resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  if (resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute), resolvedAbsolute)
    if (resolvedPath.length > 0)
      return "/" + resolvedPath;
    else
      return "/";
  else if (resolvedPath.length > 0)
    return resolvedPath;
  else
    return ".";
}
function normalize(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var isAbsolute = path.charCodeAt(0) === 47, trailingSeparator = path.charCodeAt(path.length - 1) === 47;
  if (path = normalizeStringPosix(path, !isAbsolute), path.length === 0 && !isAbsolute)
    path = ".";
  if (path.length > 0 && trailingSeparator)
    path += "/";
  if (isAbsolute)
    return "/" + path;
  return path;
}
function isAbsolute(path) {
  return assertPath(path), path.length > 0 && path.charCodeAt(0) === 47;
}
function join() {
  if (arguments.length === 0)
    return ".";
  var joined;
  for (var i = 0;i < arguments.length; ++i) {
    var arg = arguments[i];
    if (assertPath(arg), arg.length > 0)
      if (joined === undefined)
        joined = arg;
      else
        joined += "/" + arg;
  }
  if (joined === undefined)
    return ".";
  return normalize(joined);
}
function relative(from, to) {
  if (assertPath(from), assertPath(to), from === to)
    return "";
  if (from = resolve(from), to = resolve(to), from === to)
    return "";
  var fromStart = 1;
  for (;fromStart < from.length; ++fromStart)
    if (from.charCodeAt(fromStart) !== 47)
      break;
  var fromEnd = from.length, fromLen = fromEnd - fromStart, toStart = 1;
  for (;toStart < to.length; ++toStart)
    if (to.charCodeAt(toStart) !== 47)
      break;
  var toEnd = to.length, toLen = toEnd - toStart, length = fromLen < toLen ? fromLen : toLen, lastCommonSep = -1, i = 0;
  for (;i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === 47)
          return to.slice(toStart + i + 1);
        else if (i === 0)
          return to.slice(toStart + i);
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === 47)
          lastCommonSep = i;
        else if (i === 0)
          lastCommonSep = 0;
      }
      break;
    }
    var fromCode = from.charCodeAt(fromStart + i), toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode)
      break;
    else if (fromCode === 47)
      lastCommonSep = i;
  }
  var out = "";
  for (i = fromStart + lastCommonSep + 1;i <= fromEnd; ++i)
    if (i === fromEnd || from.charCodeAt(i) === 47)
      if (out.length === 0)
        out += "..";
      else
        out += "/..";
  if (out.length > 0)
    return out + to.slice(toStart + lastCommonSep);
  else {
    if (toStart += lastCommonSep, to.charCodeAt(toStart) === 47)
      ++toStart;
    return to.slice(toStart);
  }
}
function _makeLong(path) {
  return path;
}
function dirname(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var code = path.charCodeAt(0), hasRoot = code === 47, end = -1, matchedSlash = true;
  for (var i = path.length - 1;i >= 1; --i)
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else
      matchedSlash = false;
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== "string")
    throw TypeError('"ext" argument must be a string');
  assertPath(path);
  var start = 0, end = -1, matchedSlash = true, i;
  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
    if (ext.length === path.length && ext === path)
      return "";
    var extIdx = ext.length - 1, firstNonSlashEnd = -1;
    for (i = path.length - 1;i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1)
          matchedSlash = false, firstNonSlashEnd = i + 1;
        if (extIdx >= 0)
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1)
              end = i;
          } else
            extIdx = -1, end = firstNonSlashEnd;
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  } else {
    for (i = path.length - 1;i >= 0; --i)
      if (path.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1)
        matchedSlash = false, end = i + 1;
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
}
function extname(path) {
  assertPath(path);
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, preDotState = 0;
  for (var i = path.length - 1;i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    return "";
  return path.slice(startDot, end);
}
function format(pathObject) {
  if (pathObject === null || typeof pathObject !== "object")
    throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
  return _format("/", pathObject);
}
function parse(path) {
  assertPath(path);
  var ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0)
    return ret;
  var code = path.charCodeAt(0), isAbsolute = code === 47, start;
  if (isAbsolute)
    ret.root = "/", start = 1;
  else
    start = 0;
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, i = path.length - 1, preDotState = 0;
  for (;i >= start; --i) {
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1)
      if (startPart === 0 && isAbsolute)
        ret.base = ret.name = path.slice(1, end);
      else
        ret.base = ret.name = path.slice(startPart, end);
  } else {
    if (startPart === 0 && isAbsolute)
      ret.name = path.slice(1, startDot), ret.base = path.slice(1, end);
    else
      ret.name = path.slice(startPart, startDot), ret.base = path.slice(startPart, end);
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0)
    ret.dir = path.slice(0, startPart - 1);
  else if (isAbsolute)
    ret.dir = "/";
  return ret;
}
var sep = "/", delimiter = ":", posix;
var init_path = __esm(() => {
  posix = ((p) => (p.posix = p, p))({ resolve, normalize, isAbsolute, join, relative, _makeLong, dirname, basename, extname, format, parse, sep, delimiter, win32: null, posix: null });
});

// node:util
var exports_util = {};
__export(exports_util, {
  TextDecoder: () => TextDecoder
});
function format2(f, ...args) {
  if (!isString(f)) {
    var objects = [f];
    for (var i = 0;i < args.length; i++)
      objects.push(inspect(args[i]));
    return objects.join(" ");
  }
  var i = 0, len = args.length, str = String(f).replace(formatRegExp, function(x) {
    if (x === "%%")
      return "%";
    if (i >= len)
      return x;
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x;
    }
  });
  for (var x = args[i];i < len; x = args[++i])
    if (isNull(x) || !isObject(x))
      str += " " + x;
    else
      str += " " + inspect(x);
  return str;
}
function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];
  if (style)
    return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
  else
    return str;
}
function stylizeNoColor(str, styleType) {
  return str;
}
function arrayToHash(array) {
  var hash = {};
  return array.forEach(function(val, idx) {
    hash[val] = true;
  }), hash;
}
function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect && !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret))
      ret = formatValue(ctx, ret, recurseTimes);
    return ret;
  }
  var primitive = formatPrimitive(ctx, value);
  if (primitive)
    return primitive;
  var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
  if (ctx.showHidden)
    keys = Object.getOwnPropertyNames(value);
  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0))
    return formatError(value);
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp(value))
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    if (isDate(value))
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    if (isError(value))
      return formatError(value);
  }
  var base = "", array = false, braces = ["{", "}"];
  if (isArray(value))
    array = true, braces = ["[", "]"];
  if (isFunction(value)) {
    var n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp(value))
    base = " " + RegExp.prototype.toString.call(value);
  if (isDate(value))
    base = " " + Date.prototype.toUTCString.call(value);
  if (isError(value))
    base = " " + formatError(value);
  if (keys.length === 0 && (!array || value.length == 0))
    return braces[0] + base + braces[1];
  if (recurseTimes < 0)
    if (isRegExp(value))
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    else
      return ctx.stylize("[Object]", "special");
  ctx.seen.push(value);
  var output;
  if (array)
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  else
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  return ctx.seen.pop(), reduceToSingleString(output, base, braces);
}
function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize("undefined", "undefined");
  if (isString(value)) {
    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull(value))
    return ctx.stylize("null", "null");
}
function formatError(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length;i < l; ++i)
    if (hasOwnProperty(value, String(i)))
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    else
      output.push("");
  return keys.forEach(function(key) {
    if (!key.match(/^\d+$/))
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
  }), output;
}
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  if (desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }, desc.get)
    if (desc.set)
      str = ctx.stylize("[Getter/Setter]", "special");
    else
      str = ctx.stylize("[Getter]", "special");
  else if (desc.set)
    str = ctx.stylize("[Setter]", "special");
  if (!hasOwnProperty(visibleKeys, key))
    name = "[" + key + "]";
  if (!str)
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes))
        str = formatValue(ctx, desc.value, null);
      else
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      if (str.indexOf(`
`) > -1)
        if (array)
          str = str.split(`
`).map(function(line) {
            return "  " + line;
          }).join(`
`).slice(2);
        else
          str = `
` + str.split(`
`).map(function(line) {
            return "   " + line;
          }).join(`
`);
    } else
      str = ctx.stylize("[Circular]", "special");
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/))
      return str;
    if (name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/))
      name = name.slice(1, -1), name = ctx.stylize(name, "name");
    else
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), name = ctx.stylize(name, "string");
  }
  return name + ": " + str;
}
function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0, length = output.reduce(function(prev, cur) {
    if (numLinesEst++, cur.indexOf(`
`) >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60)
    return braces[0] + (base === "" ? "" : base + `
 `) + " " + output.join(`,
  `) + " " + braces[1];
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function isArray(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isNull(arg) {
  return arg === null;
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isString(arg) {
  return typeof arg === "string";
}
function isUndefined(arg) {
  return arg === undefined;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === "[object RegExp]";
}
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === "[object Date]";
}
function isError(e) {
  return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
}
function isFunction(arg) {
  return typeof arg === "function";
}
function objectToString(o) {
  return Object.prototype.toString.call(o);
}
function _extend(origin, add) {
  if (!add || !isObject(add))
    return origin;
  var keys = Object.keys(add), i = keys.length;
  while (i--)
    origin[keys[i]] = add[keys[i]];
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
var formatRegExp, debuglog, inspect, promisify, TextEncoder, TextDecoder;
var init_util = __esm(() => {
  formatRegExp = /%[sdj%]/g;
  debuglog = ((debugs = {}, debugEnvRegex = {}, debugEnv) => ((debugEnv = typeof process < "u" && false) && (debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase()), debugEnvRegex = new RegExp("^" + debugEnv + "$", "i"), (set) => {
    if (set = set.toUpperCase(), !debugs[set])
      if (debugEnvRegex.test(set))
        debugs[set] = function(...args) {
          console.error("%s: %s", set, pid, format2.apply(null, ...args));
        };
      else
        debugs[set] = function() {};
    return debugs[set];
  }))();
  inspect = ((i) => (i.colors = { bold: [1, 22], italic: [3, 23], underline: [4, 24], inverse: [7, 27], white: [37, 39], grey: [90, 39], black: [30, 39], blue: [34, 39], cyan: [36, 39], green: [32, 39], magenta: [35, 39], red: [31, 39], yellow: [33, 39] }, i.styles = { special: "cyan", number: "yellow", boolean: "yellow", undefined: "grey", null: "bold", string: "green", date: "magenta", regexp: "red" }, i.custom = Symbol.for("nodejs.util.inspect.custom"), i))(function(obj, opts, ...rest) {
    var ctx = { seen: [], stylize: stylizeNoColor };
    if (rest.length >= 1)
      ctx.depth = rest[0];
    if (rest.length >= 2)
      ctx.colors = rest[1];
    if (isBoolean(opts))
      ctx.showHidden = opts;
    else if (opts)
      _extend(ctx, opts);
    if (isUndefined(ctx.showHidden))
      ctx.showHidden = false;
    if (isUndefined(ctx.depth))
      ctx.depth = 2;
    if (isUndefined(ctx.colors))
      ctx.colors = false;
    if (ctx.colors)
      ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  });
  promisify = ((x) => (x.custom = Symbol.for("nodejs.util.promisify.custom"), x))(function(original) {
    if (typeof original !== "function")
      throw TypeError('The "original" argument must be of type Function');
    if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
      var fn = original[kCustomPromisifiedSymbol];
      if (typeof fn !== "function")
        throw TypeError('The "nodejs.util.promisify.custom" argument must be of type Function');
      return Object.defineProperty(fn, kCustomPromisifiedSymbol, { value: fn, enumerable: false, writable: false, configurable: true }), fn;
    }
    function fn(...args) {
      var promiseResolve, promiseReject, promise = new Promise(function(resolve, reject) {
        promiseResolve = resolve, promiseReject = reject;
      });
      args.push(function(err, value) {
        if (err)
          promiseReject(err);
        else
          promiseResolve(value);
      });
      try {
        original.apply(this, args);
      } catch (err) {
        promiseReject(err);
      }
      return promise;
    }
    if (Object.setPrototypeOf(fn, Object.getPrototypeOf(original)), kCustomPromisifiedSymbol)
      Object.defineProperty(fn, kCustomPromisifiedSymbol, { value: fn, enumerable: false, writable: false, configurable: true });
    return Object.defineProperties(fn, Object.getOwnPropertyDescriptors(original));
  });
  ({ TextEncoder, TextDecoder } = globalThis);
});

// vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/validate-coverage-ledger.cjs
var require_validate_coverage_ledger = __commonJS(function(exports, module) {
  var fs = (() => ({}));
  var path = { join: function(...parts){ return parts.filter(Boolean).join("/").replace(/\/+/g,"/"); }, posix: { isAbsolute: function(v){ return typeof v==="string" && v.startsWith("/"); } }, win32: { isAbsolute: function(v){ return typeof v==="string" && /^[A-Za-z]:/.test(v); } } };
  var { TextDecoder } = globalThis;
  var LIMITS = Object.freeze({
    inputBytes: 5 * 1024 * 1024,
    units: 1e4,
    collectionItems: 1000,
    objectFields: 1000,
    nestingDepth: 64,
    preflightValues: 500000,
    validationErrors: 100
  });
  var MAX_INPUT_BYTES = LIMITS.inputBytes;
  var MAX_UNITS = LIMITS.units;
  var MAX_LIST_ITEMS = LIMITS.collectionItems;
  var MAX_TEXT_LENGTH = 4096;
  var REQUIRED_FIELDS = [
    "coverage_id",
    "canonical_refs",
    "surface",
    "boundary",
    "subsystem",
    "attack_class",
    "starting_paths",
    "ordinary_attack_class_block",
    "selected_companion_blocks",
    "excluded_blocks",
    "prior_status",
    "attempts",
    "wave",
    "status",
    "agent_id",
    "reviewed_paths",
    "local_checks",
    "result_fingerprints",
    "unresolved"
  ];
  var REF_FIELDS = ["surface", "boundary", "subsystem", "attack_class"];
  var STATUSES = new Set([
    "planned",
    "not_applicable",
    "out_of_scope",
    "in_progress",
    "covered",
    "candidate",
    "blocked",
    "deferred"
  ]);
  var ATTEMPT_STATUSES = new Set(["covered", "candidate", "blocked"]);
  var ATTEMPT_FIELDS = [
    "wave",
    "status",
    "agent_id",
    "reviewed_paths",
    "local_checks",
    "result_fingerprints",
    "unresolved",
    "reassignment_reason"
  ];
  var PRIOR_STATUSES = new Set([
    "new",
    "prior_confirmed_same_source",
    "prior_confirmed_changed_source",
    "prior_needs_validation",
    "prior_deferred",
    "prior_blocked",
    "prior_out_of_scope",
    "prior_covered_same_source",
    "prior_covered_changed_source",
    "prior_rejected_claim_changed",
    "none"
  ]);
  var FINGERPRINT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/;
  var AGENT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
  var WINDOWS_RESERVED_AGENT_ID = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
  var VISIBLE_CONTENT = /[^\p{White_Space}\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
  var PATH_FORBIDDEN_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u;
  var WINDOWS_RESERVED_COMPONENT = /^(?:con|prn|aux|nul|clock\$|conin\$|conout\$|com[1-9\u00b9\u00b2\u00b3]|lpt[1-9\u00b9\u00b2\u00b3])(?:\.|$)/iu;
  var UTF8_DECODER = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  var UNSAFE_DIAGNOSTIC_CHARACTER = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/gu;
  var MAX_DIAGNOSTIC_STRING_LENGTH = 256;
  var hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

  class JsonStructureError extends Error {
  }

  class SafeInputError extends Error {
  }
  function escapeUnsafeDiagnosticCharacters(value) {
    return String(value).replace(UNSAFE_DIAGNOSTIC_CHARACTER, (character) => {
      const codePoint = character.codePointAt(0);
      return codePoint <= 65535 ? `\\u${codePoint.toString(16).padStart(4, "0")}` : `\\u{${codePoint.toString(16)}}`;
    });
  }
  function safeQuote(value) {
    let serialized;
    if (typeof value === "string") {
      const clipped = value.length > MAX_DIAGNOSTIC_STRING_LENGTH ? `${value.slice(0, MAX_DIAGNOSTIC_STRING_LENGTH)}...` : value;
      serialized = JSON.stringify(clipped);
    } else if (value === null || typeof value === "boolean") {
      serialized = String(value);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      serialized = String(value);
    } else {
      serialized = `"<${Array.isArray(value) ? "array" : typeof value}>"`;
    }
    return escapeUnsafeDiagnosticCharacters(serialized);
  }
  function createErrorList() {
    const errors = [];
    Object.defineProperty(errors, "push", {
      value(...messages) {
        const remaining = LIMITS.validationErrors - this.length;
        if (remaining > 0) {
          Array.prototype.push.apply(this, messages.slice(0, remaining).map(escapeUnsafeDiagnosticCharacters));
        }
        return this.length;
      }
    });
    return errors;
  }
  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function preflightJsonText(contents) {
    const containers = [];
    let rootState = "value";
    let inString = false;
    let escaped = false;
    let totalValues = 0;
    function fail(message) {
      throw new JsonStructureError(`input ${message}`);
    }
    function currentContainer() {
      return containers[containers.length - 1];
    }
    function countValue() {
      totalValues++;
      if (totalValues > LIMITS.preflightValues) {
        fail(`exceeds ${LIMITS.preflightValues} total value limit`);
      }
    }
    function beginValue() {
      const container = currentContainer();
      if (!container) {
        if (rootState !== "value")
          fail("has malformed JSON structure");
        rootState = "end";
      } else if (container.type === "array") {
        if (container.state !== "firstValueOrEnd" && container.state !== "value") {
          fail("has malformed JSON array structure");
        }
        container.items++;
        const limit = container.topLevel ? MAX_UNITS : LIMITS.collectionItems;
        if (container.items > limit) {
          fail(container.topLevel ? `exceeds ${limit} top-level unit limit` : `exceeds ${limit} item array limit`);
        }
        container.state = "commaOrEnd";
      } else {
        if (container.state !== "value")
          fail("has malformed JSON object structure");
        container.state = "commaOrEnd";
      }
      countValue();
    }
    function beginString() {
      const container = currentContainer();
      if (container && container.type === "object" && (container.state === "firstKeyOrEnd" || container.state === "key")) {
        container.fields++;
        if (container.fields > LIMITS.objectFields) {
          fail(`exceeds ${LIMITS.objectFields} field object limit`);
        }
        container.state = "colon";
      } else {
        beginValue();
      }
      inString = true;
    }
    function beginContainer(type) {
      beginValue();
      if (containers.length >= LIMITS.nestingDepth) {
        fail(`exceeds nesting depth limit ${LIMITS.nestingDepth}`);
      }
      containers.push(type === "array" ? { type, state: "firstValueOrEnd", items: 0, topLevel: containers.length === 0 } : { type, state: "firstKeyOrEnd", fields: 0 });
    }
    function closeContainer(type) {
      const container = currentContainer();
      if (!container || container.type !== type)
        fail("has mismatched JSON containers");
      const canClose = type === "array" ? container.state === "firstValueOrEnd" || container.state === "commaOrEnd" : container.state === "firstKeyOrEnd" || container.state === "commaOrEnd";
      if (!canClose)
        fail(`has malformed JSON ${type} structure`);
      containers.pop();
    }
    function isWhitespace(character) {
      return character === " " || character === "\t" || character === "\r" || character === `
`;
    }
    function isTokenDelimiter(character) {
      return isWhitespace(character) || character === "," || character === ":" || character === "[" || character === "]" || character === "{" || character === "}" || character === '"';
    }
    for (let index = 0;index < contents.length; index++) {
      const character = contents[index];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }
      if (isWhitespace(character))
        continue;
      if (character === '"') {
        beginString();
      } else if (character === "[") {
        beginContainer("array");
      } else if (character === "{") {
        beginContainer("object");
      } else if (character === "]") {
        closeContainer("array");
      } else if (character === "}") {
        closeContainer("object");
      } else if (character === ":") {
        const container = currentContainer();
        if (!container || container.type !== "object" || container.state !== "colon") {
          fail("has malformed JSON object structure");
        }
        container.state = "value";
      } else if (character === ",") {
        const container = currentContainer();
        if (!container || container.state !== "commaOrEnd")
          fail("has malformed JSON collection structure");
        container.state = container.type === "array" ? "value" : "key";
      } else {
        beginValue();
        while (index + 1 < contents.length && !isTokenDelimiter(contents[index + 1]))
          index++;
      }
    }
    if (inString)
      fail("has an unterminated JSON string");
    if (containers.length > 0)
      fail("has truncated JSON structure");
    if (rootState !== "end")
      fail("has no JSON value");
  }
  function preflightDocument(root) {
    const errors = createErrorList();
    const stack = [{ value: root, depth: 0, location: "$" }];
    let visited = 0;
    while (stack.length > 0) {
      const { value, depth, location } = stack.pop();
      visited++;
      if (visited > LIMITS.preflightValues) {
        errors.push(`$: exceeds ${LIMITS.preflightValues} total values`);
        return errors;
      }
      if (value === null || typeof value !== "object")
        continue;
      if (depth >= LIMITS.nestingDepth) {
        errors.push(`${location}: exceeds nesting depth limit ${LIMITS.nestingDepth}`);
        return errors;
      }
      if (Array.isArray(value)) {
        const limit = location === "$" ? MAX_UNITS : MAX_LIST_ITEMS;
        if (value.length > limit) {
          errors.push(`${location}: exceeds ${limit} entries`);
          return errors;
        }
        for (let index = value.length - 1;index >= 0; index--) {
          stack.push({ value: value[index], depth: depth + 1, location: `${location}[${index}]` });
        }
        continue;
      }
      const keys = Object.keys(value);
      if (keys.length > LIMITS.objectFields) {
        errors.push(`${location}: exceeds ${LIMITS.objectFields} object fields`);
        return errors;
      }
      for (let index = keys.length - 1;index >= 0; index--) {
        const key = keys[index];
        stack.push({ value: value[key], depth: depth + 1, location: `${location}{${index}}` });
      }
    }
    return errors;
  }
  function hasValidUnicodeScalarValues(value) {
    let index = 0;
    while (index < value.length) {
      const first = value.charCodeAt(index++);
      if (first >= 55296 && first <= 56319) {
        if (index >= value.length)
          return false;
        const second = value.charCodeAt(index++);
        if (second < 56320 || second > 57343)
          return false;
      } else if (first >= 56320 && first <= 57343) {
        return false;
      }
    }
    return true;
  }
  function hasVisibleProse(value) {
    return hasValidUnicodeScalarValues(value) && VISIBLE_CONTENT.test(value);
  }
  function isVisibleText(value, maxLength = MAX_TEXT_LENGTH) {
    return typeof value === "string" && value.length > 0 && value.length <= maxLength && value.trim() === value && hasVisibleProse(value);
  }
  function isCanonicalRef(value) {
    return isVisibleText(value, 1024) && !PATH_FORBIDDEN_CHARACTER.test(value) && value.normalize("NFC") === value;
  }
  function encodeCanonicalRef(value) {
    if (!isCanonicalRef(value))
      throw new TypeError("invalid canonical reference");
    let encoded = "";
    for (const byte of Buffer.from(value, "utf8")) {
      const unreserved = byte >= 65 && byte <= 90 || byte >= 97 && byte <= 122 || byte >= 48 && byte <= 57 || byte === 45 || byte === 46 || byte === 95 || byte === 126;
      encoded += unreserved ? String.fromCharCode(byte) : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
    return encoded;
  }
  function canonicalCoverageId(refs) {
    if (!isObject(refs))
      throw new TypeError("canonical_refs must be an object");
    const fields = hasOwn(refs, "lifecycle") ? [...REF_FIELDS, "lifecycle"] : REF_FIELDS;
    if (Object.keys(refs).length !== fields.length || fields.some((field) => !hasOwn(refs, field))) {
      throw new TypeError("canonical_refs has missing or unexpected fields");
    }
    return fields.map((field) => encodeCanonicalRef(refs[field])).join("::");
  }
  function isSafeRelativePath(value) {
    if (typeof value !== "string" || value.length === 0 || !hasValidUnicodeScalarValues(value) || value.trim() !== value || PATH_FORBIDDEN_CHARACTER.test(value) || value.includes("\\") || value.includes(":"))
      return false;
    if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.startsWith("~"))
      return false;
    return value.split("/").every((segment) => segment !== "" && segment !== "." && segment !== ".." && !/[ .]$/u.test(segment) && !WINDOWS_RESERVED_COMPONENT.test(segment));
  }
  function isSafeAgentId(value) {
    return typeof value === "string" && AGENT_ID_PATTERN.test(value) && !WINDOWS_RESERVED_AGENT_ID.test(value);
  }
  function isOwnedArtifactPath(value, agentId) {
    if (!isSafeAgentId(agentId) || !isSafeRelativePath(value))
      return false;
    const prefix = `agents/${agentId}/artifacts/`;
    return value.startsWith(prefix) && value.length > prefix.length;
  }
  function validateStringArray(value, location, errors, options = {}) {
    const { allowEmpty = true, fingerprint = false, pathValue = false } = options;
    if (!Array.isArray(value)) {
      errors.push(`${location}: expected array`);
      return;
    }
    if (!allowEmpty && value.length === 0)
      errors.push(`${location}: must not be empty`);
    if (value.length > MAX_LIST_ITEMS)
      errors.push(`${location}: exceeds ${MAX_LIST_ITEMS} entries`);
    const seen = new Set;
    value.slice(0, MAX_LIST_ITEMS).forEach((entry, index) => {
      const entryLocation = `${location}[${index}]`;
      const valid = pathValue ? isSafeRelativePath(entry) : isVisibleText(entry);
      if (!valid)
        errors.push(`${entryLocation}: invalid ${pathValue ? "repository-relative path" : "text"}`);
      if (fingerprint && typeof entry === "string" && !FINGERPRINT_PATTERN.test(entry)) {
        errors.push(`${entryLocation}: invalid fingerprint`);
      }
      if (typeof entry === "string" && seen.has(entry))
        errors.push(`${entryLocation}: duplicate entry`);
      if (typeof entry === "string")
        seen.add(entry);
    });
  }
  function validateChecks(value, location, errors) {
    if (!Array.isArray(value)) {
      errors.push(`${location}: expected array`);
      return;
    }
    if (value.length > MAX_LIST_ITEMS)
      errors.push(`${location}: exceeds ${MAX_LIST_ITEMS} entries`);
    value.slice(0, MAX_LIST_ITEMS).forEach((check, index) => {
      const base = `${location}[${index}]`;
      if (!isObject(check)) {
        errors.push(`${base}: expected object`);
        return;
      }
      for (const field of ["agent_id", "reviewed_paths", "invariant", "method", "result", "artifact"]) {
        if (!hasOwn(check, field))
          errors.push(`${base}: missing required field ${safeQuote(field)}`);
      }
      if (!isSafeAgentId(check.agent_id))
        errors.push(`${base}.agent_id: expected a canonical lowercase agent ID`);
      validateStringArray(check.reviewed_paths, `${base}.reviewed_paths`, errors, { allowEmpty: false, pathValue: true });
      if (!isVisibleText(check.invariant))
        errors.push(`${base}.invariant: invalid text`);
      if (check.method !== "source" && check.method !== "local")
        errors.push(`${base}.method: expected "source" or "local"`);
      if (!isVisibleText(check.result))
        errors.push(`${base}.result: invalid text`);
      if (check.method === "source" && check.artifact !== null) {
        errors.push(`${base}.artifact: source-only check must use null`);
      } else if (check.method === "local") {
        if (!isOwnedArtifactPath(check.artifact, check.agent_id)) {
          errors.push(`${base}.artifact: local check requires an artifact owned by agent ${safeQuote(isSafeAgentId(check.agent_id) ? check.agent_id : "<agent-id>")}`);
        }
      } else if (check.method !== "source" && check.method !== "local" && check.artifact !== null && !isSafeRelativePath(check.artifact)) {
        errors.push(`${base}.artifact: expected null or a safe output-relative path`);
      }
    });
  }
  function validateReviewedPathOwnership(unit, base, errors) {
    if (!Array.isArray(unit.reviewed_paths) || !Array.isArray(unit.local_checks))
      return;
    const aggregatePaths = new Set(unit.reviewed_paths.filter((value) => typeof value === "string"));
    const ownedPaths = new Set;
    for (const check of unit.local_checks) {
      if (!isObject(check) || !Array.isArray(check.reviewed_paths))
        continue;
      for (const reviewedPath of check.reviewed_paths) {
        if (typeof reviewedPath === "string")
          ownedPaths.add(reviewedPath);
      }
    }
    for (const reviewedPath of aggregatePaths) {
      if (!ownedPaths.has(reviewedPath))
        errors.push(`${base}.reviewed_paths: ${safeQuote(reviewedPath)} has no check owner`);
    }
    for (const reviewedPath of ownedPaths) {
      if (!aggregatePaths.has(reviewedPath))
        errors.push(`${base}.local_checks: owned path ${safeQuote(reviewedPath)} is absent from aggregate reviewed_paths`);
    }
  }
  function validateExcludedBlocks(value, location, errors) {
    if (!Array.isArray(value)) {
      errors.push(`${location}: expected array`);
      return;
    }
    if (value.length > MAX_LIST_ITEMS)
      errors.push(`${location}: exceeds ${MAX_LIST_ITEMS} entries`);
    const seen = new Set;
    value.slice(0, MAX_LIST_ITEMS).forEach((entry, index) => {
      const base = `${location}[${index}]`;
      if (!isObject(entry)) {
        errors.push(`${base}: expected object`);
        return;
      }
      if (!isVisibleText(entry.block))
        errors.push(`${base}.block: invalid text`);
      if (!isVisibleText(entry.reason))
        errors.push(`${base}.reason: invalid text`);
      if (typeof entry.block === "string" && seen.has(entry.block))
        errors.push(`${base}.block: duplicate entry`);
      if (typeof entry.block === "string")
        seen.add(entry.block);
    });
  }
  function semanticKey(unit) {
    return JSON.stringify([
      unit.surface,
      unit.boundary,
      unit.subsystem,
      unit.attack_class,
      hasOwn(unit, "lifecycle") ? unit.lifecycle : null
    ]);
  }
  function hasValidSemanticFields(unit) {
    return ["surface", "boundary", "subsystem", "attack_class"].every((field) => isVisibleText(unit[field])) && (!hasOwn(unit, "lifecycle") || isVisibleText(unit.lifecycle));
  }
  function requireEmptyArray(unit, field, base, errors) {
    if (Array.isArray(unit[field]) && unit[field].length > 0) {
      errors.push(`${base}.${field}: unit with status ${safeQuote(unit.status)} must keep this array empty`);
    }
  }
  function requireNonemptyArray(unit, field, base, errors) {
    if (!Array.isArray(unit[field]) || unit[field].length === 0) {
      errors.push(`${base}.${field}: unit with status ${safeQuote(unit.status)} requires entries`);
    }
  }
  function validateStateInvariants(unit, base, errors) {
    const emptyEvidence = () => {
      requireEmptyArray(unit, "reviewed_paths", base, errors);
      requireEmptyArray(unit, "local_checks", base, errors);
    };
    const requireOwner = () => {
      if (!isSafeAgentId(unit.agent_id))
        errors.push(`${base}.agent_id: unit with status ${safeQuote(unit.status)} requires a canonical lowercase agent ID`);
    };
    if (unit.status !== "candidate")
      requireEmptyArray(unit, "result_fingerprints", base, errors);
    switch (unit.status) {
      case "planned":
        if (unit.agent_id !== null)
          errors.push(`${base}.agent_id: planned unit must be unassigned`);
        emptyEvidence();
        requireEmptyArray(unit, "unresolved", base, errors);
        break;
      case "not_applicable":
      case "out_of_scope":
      case "deferred":
        if (unit.agent_id !== null)
          errors.push(`${base}.agent_id: unit with status ${safeQuote(unit.status)} must be unassigned`);
        emptyEvidence();
        requireNonemptyArray(unit, "unresolved", base, errors);
        break;
      case "in_progress":
        requireOwner();
        emptyEvidence();
        requireEmptyArray(unit, "unresolved", base, errors);
        break;
      case "blocked":
        requireOwner();
        requireNonemptyArray(unit, "reviewed_paths", base, errors);
        requireNonemptyArray(unit, "local_checks", base, errors);
        requireNonemptyArray(unit, "unresolved", base, errors);
        break;
      case "covered":
        requireOwner();
        requireNonemptyArray(unit, "reviewed_paths", base, errors);
        requireNonemptyArray(unit, "local_checks", base, errors);
        requireEmptyArray(unit, "unresolved", base, errors);
        break;
      case "candidate":
        requireOwner();
        requireNonemptyArray(unit, "reviewed_paths", base, errors);
        requireNonemptyArray(unit, "local_checks", base, errors);
        requireNonemptyArray(unit, "result_fingerprints", base, errors);
        break;
    }
  }
  function validateAttempts(value, unit, base, errors) {
    if (!Array.isArray(value)) {
      errors.push(`${base}.attempts: expected array`);
      return;
    }
    if (value.length > MAX_LIST_ITEMS)
      errors.push(`${base}.attempts: exceeds ${MAX_LIST_ITEMS} entries`);
    const priorOwners = new Set;
    const priorArtifacts = new Set;
    let previousWave = 0;
    value.slice(0, MAX_LIST_ITEMS).forEach((attempt, index) => {
      const attemptBase = `${base}.attempts[${index}]`;
      if (!isObject(attempt)) {
        errors.push(`${attemptBase}: expected object`);
        return;
      }
      for (const field of ATTEMPT_FIELDS) {
        if (!hasOwn(attempt, field))
          errors.push(`${attemptBase}: missing required field ${safeQuote(field)}`);
      }
      if (!Number.isInteger(attempt.wave) || attempt.wave < 1) {
        errors.push(`${attemptBase}.wave: expected a positive integer`);
      } else {
        if (attempt.wave <= previousWave)
          errors.push(`${attemptBase}.wave: archived attempt waves must be strictly increasing`);
        if (Number.isInteger(unit.wave) && attempt.wave >= unit.wave) {
          errors.push(`${attemptBase}.wave: archived attempt wave must precede current wave ${safeQuote(unit.wave)}`);
        }
        previousWave = attempt.wave;
      }
      if (!ATTEMPT_STATUSES.has(attempt.status)) {
        errors.push(`${attemptBase}.status: expected "covered", "candidate", or "blocked"`);
      }
      let hasFreshOwner = false;
      if (!isSafeAgentId(attempt.agent_id)) {
        errors.push(`${attemptBase}.agent_id: archived attempt requires a canonical lowercase agent ID`);
      } else if (priorOwners.has(attempt.agent_id)) {
        errors.push(`${attemptBase}.agent_id: assignment owner must be fresh for each attempt`);
      } else {
        hasFreshOwner = true;
      }
      validateStringArray(attempt.reviewed_paths, `${attemptBase}.reviewed_paths`, errors, { pathValue: true });
      validateChecks(attempt.local_checks, `${attemptBase}.local_checks`, errors);
      validateReviewedPathOwnership(attempt, attemptBase, errors);
      validateStringArray(attempt.result_fingerprints, `${attemptBase}.result_fingerprints`, errors, { fingerprint: true });
      validateStringArray(attempt.unresolved, `${attemptBase}.unresolved`, errors);
      if (!isVisibleText(attempt.reassignment_reason))
        errors.push(`${attemptBase}.reassignment_reason: invalid text`);
      validateStateInvariants(attempt, attemptBase, errors);
      if (Array.isArray(attempt.local_checks)) {
        attempt.local_checks.forEach((check, checkIndex) => {
          if (!isObject(check))
            return;
          if (priorOwners.has(check.agent_id)) {
            errors.push(`${attemptBase}.local_checks[${checkIndex}].agent_id: prior assignment owner evidence must remain in its earlier attempt`);
          }
          if (typeof check.artifact === "string" && priorArtifacts.has(check.artifact)) {
            errors.push(`${attemptBase}.local_checks[${checkIndex}].artifact: artifact from an earlier attempt cannot be reused`);
          }
          if (check.method === "local" && typeof check.artifact === "string")
            priorArtifacts.add(check.artifact);
        });
      }
      if (hasFreshOwner)
        priorOwners.add(attempt.agent_id);
    });
    if (isSafeAgentId(unit.agent_id) && priorOwners.has(unit.agent_id)) {
      errors.push(`${base}.agent_id: current assignment owner must be fresh after reassignment`);
    }
    if (Array.isArray(unit.local_checks)) {
      unit.local_checks.forEach((check, index) => {
        if (!isObject(check))
          return;
        if (priorOwners.has(check.agent_id)) {
          errors.push(`${base}.local_checks[${index}].agent_id: prior assignment owner evidence must remain in its archived attempt`);
        }
        if (typeof check.artifact === "string" && priorArtifacts.has(check.artifact)) {
          errors.push(`${base}.local_checks[${index}].artifact: artifact from an archived attempt cannot be reused`);
        }
      });
    }
  }
  function collectUnitErrors(unit, index) {
    const errors = createErrorList();
    const base = `$[${index}]`;
    if (!isObject(unit))
      return [`${base}: expected object`];
    for (const field of REQUIRED_FIELDS) {
      if (!hasOwn(unit, field))
        errors.push(`${base}: missing required field ${safeQuote(field)}`);
    }
    for (const field of ["surface", "boundary", "subsystem", "attack_class"]) {
      if (!isVisibleText(unit[field]))
        errors.push(`${base}.${field}: invalid text`);
    }
    if (hasOwn(unit, "lifecycle") && !isVisibleText(unit.lifecycle))
      errors.push(`${base}.lifecycle: invalid text`);
    let expectedId = null;
    if (!isObject(unit.canonical_refs)) {
      errors.push(`${base}.canonical_refs: expected object`);
    } else {
      const expectedFields = hasOwn(unit.canonical_refs, "lifecycle") ? [...REF_FIELDS, "lifecycle"] : REF_FIELDS;
      for (const field of expectedFields) {
        if (!hasOwn(unit.canonical_refs, field)) {
          errors.push(`${base}.canonical_refs: missing required field ${safeQuote(field)}`);
        } else if (!isCanonicalRef(unit.canonical_refs[field])) {
          errors.push(`${base}.canonical_refs.${field}: invalid canonical reference`);
        }
      }
      if (Object.keys(unit.canonical_refs).some((field) => !expectedFields.includes(field))) {
        errors.push(`${base}.canonical_refs: contains unexpected fields`);
      }
      if (hasOwn(unit, "lifecycle") !== hasOwn(unit.canonical_refs, "lifecycle")) {
        errors.push(`${base}: lifecycle and canonical_refs.lifecycle must appear together`);
      }
      try {
        expectedId = canonicalCoverageId(unit.canonical_refs);
      } catch {}
    }
    if (!isVisibleText(unit.coverage_id, 65536)) {
      errors.push(`${base}.coverage_id: invalid text`);
    } else if (expectedId !== null && unit.coverage_id !== expectedId) {
      errors.push(`${base}.coverage_id: expected canonical ID ${safeQuote(expectedId)}`);
    }
    validateStringArray(unit.starting_paths, `${base}.starting_paths`, errors, { allowEmpty: false, pathValue: true });
    if (unit.ordinary_attack_class_block !== null && !isVisibleText(unit.ordinary_attack_class_block)) {
      errors.push(`${base}.ordinary_attack_class_block: expected null or non-empty text`);
    }
    validateStringArray(unit.selected_companion_blocks, `${base}.selected_companion_blocks`, errors);
    validateExcludedBlocks(unit.excluded_blocks, `${base}.excluded_blocks`, errors);
    if (Array.isArray(unit.selected_companion_blocks) && Array.isArray(unit.excluded_blocks)) {
      const selected = new Set(unit.selected_companion_blocks);
      unit.excluded_blocks.forEach((entry, blockIndex) => {
        if (isObject(entry) && selected.has(entry.block)) {
          errors.push(`${base}.excluded_blocks[${blockIndex}].block: block is also selected`);
        }
      });
    }
    if (!PRIOR_STATUSES.has(unit.prior_status))
      errors.push(`${base}.prior_status: invalid value ${safeQuote(unit.prior_status)}`);
    if (!STATUSES.has(unit.status))
      errors.push(`${base}.status: invalid value ${safeQuote(unit.status)}`);
    if (!Number.isInteger(unit.wave) || unit.wave < 1)
      errors.push(`${base}.wave: expected a positive integer`);
    if (unit.agent_id !== null && !isSafeAgentId(unit.agent_id))
      errors.push(`${base}.agent_id: expected null or a safe agent ID`);
    validateAttempts(unit.attempts, unit, base, errors);
    validateStringArray(unit.reviewed_paths, `${base}.reviewed_paths`, errors, { pathValue: true });
    validateChecks(unit.local_checks, `${base}.local_checks`, errors);
    validateReviewedPathOwnership(unit, base, errors);
    validateStringArray(unit.result_fingerprints, `${base}.result_fingerprints`, errors, { fingerprint: true });
    validateStringArray(unit.unresolved, `${base}.unresolved`, errors);
    validateStateInvariants(unit, base, errors);
    return errors;
  }
  function readFileWithinLimit(file) {
    const noFollow = fs.constants.O_NOFOLLOW;
    const nonBlock = fs.constants.O_NONBLOCK;
    if (!Number.isInteger(noFollow) || noFollow === 0 || !Number.isInteger(nonBlock) || nonBlock === 0) {
      throw new SafeInputError("OS no-follow and nonblocking input protection is unavailable");
    }
    let descriptor;
    try {
      descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow | nonBlock);
    } catch (error) {
      if (error && (error.code === "ELOOP" || error.code === "EMLINK"))
        throw new SafeInputError("input must not be a symlink");
      throw error;
    }
    try {
      const stat = fs.fstatSync(descriptor);
      if (!stat.isFile())
        throw new SafeInputError("input must be a regular file");
      if (stat.size > MAX_INPUT_BYTES)
        throw new SafeInputError(`input exceeds ${MAX_INPUT_BYTES} byte limit`);
      const chunks = [];
      const buffer = Buffer.allocUnsafe(64 * 1024);
      let bytesRead = 0;
      while (true) {
        const count = fs.readSync(descriptor, buffer, 0, buffer.length, null);
        if (count === 0)
          break;
        bytesRead += count;
        if (bytesRead > MAX_INPUT_BYTES)
          throw new SafeInputError(`input exceeds ${MAX_INPUT_BYTES} byte limit`);
        chunks.push(Buffer.from(buffer.subarray(0, count)));
      }
      try {
        return UTF8_DECODER.decode(Buffer.concat(chunks, bytesRead));
      } catch {
        throw new SafeInputError("input is not valid UTF-8");
      }
    } finally {
      fs.closeSync(descriptor);
    }
  }
  function validateDocument(ledger) {
    const errors = createErrorList();
    if (!Array.isArray(ledger)) {
      errors.push("$: expected a top-level array");
      return errors;
    }
    if (ledger.length > MAX_UNITS) {
      errors.push(`$: exceeds ${MAX_UNITS} coverage units`);
      return errors;
    }
    errors.push(...preflightDocument(ledger));
    if (errors.length > 0)
      return errors;
    const ids = new Map;
    const semantics = new Map;
    let previousId = null;
    for (let index = 0;index < ledger.length && errors.length < LIMITS.validationErrors; index++) {
      const unit = ledger[index];
      errors.push(...collectUnitErrors(unit, index));
      if (errors.length >= LIMITS.validationErrors)
        break;
      if (!isObject(unit) || typeof unit.coverage_id !== "string")
        continue;
      const key = hasValidSemanticFields(unit) ? semanticKey(unit) : null;
      if (ids.has(unit.coverage_id)) {
        const previous = ids.get(unit.coverage_id);
        const qualifier = key !== null && previous.key !== null && previous.key !== key ? "canonical identity collision with different semantic fields" : "duplicate coverage ID";
        errors.push(`$[${index}].coverage_id: ${qualifier} at $[${previous.index}]`);
      } else {
        ids.set(unit.coverage_id, { index, key });
      }
      if (key !== null && semantics.has(key) && semantics.get(key).id !== unit.coverage_id) {
        const previous = semantics.get(key);
        errors.push(`$[${index}].canonical_refs: semantic tuple already uses coverage ID ${safeQuote(previous.id)} at $[${previous.index}]`);
      } else if (key !== null) {
        semantics.set(key, { id: unit.coverage_id, index });
      }
      if (previousId !== null && previousId > unit.coverage_id) {
        errors.push(`$[${index}].coverage_id: units must be sorted lexicographically`);
      }
      previousId = unit.coverage_id;
    }
    return errors;
  }
  function run(file) {
    if (!file) {
      console.error("Usage: node validate-coverage-ledger.cjs <path-to-coverage-ledger.json>");
      return 1;
    }
    let contents;
    try {
      contents = readFileWithinLimit(file);
    } catch (error) {
      const reason = error instanceof SafeInputError ? error.message : "input could not be opened or read safely";
      console.error(`Failed to read coverage ledger: ${reason}`);
      return 1;
    }
    let ledger;
    try {
      preflightJsonText(contents);
    } catch (error) {
      const reason = error instanceof JsonStructureError ? error.message : "invalid JSON structure";
      console.error(`Failed to parse coverage ledger: ${reason}`);
      return 1;
    }
    try {
      ledger = JSON.parse(contents);
    } catch {
      console.error("Failed to parse coverage ledger: invalid JSON syntax");
      return 1;
    }
    let errors;
    try {
      errors = validateDocument(ledger);
    } catch {
      console.error("Failed to validate coverage ledger: unexpected validation error");
      return 1;
    }
    for (const message of errors)
      console.error("ERROR:", message);
    if (errors.length > 0) {
      const cap = errors.length === LIMITS.validationErrors ? `; output capped at ${LIMITS.validationErrors}` : "";
      console.error(`FAIL: ${errors.length} validation error(s)${cap}`);
      return 1;
    }
    console.log(`PASS: ${ledger.length} coverage units valid`);
    return 0;
  }
  module.exports = {
    LIMITS,
    PATH_FORBIDDEN_CHARACTER,
    UNSAFE_DIAGNOSTIC_CHARACTER,
    VISIBLE_CONTENT,
    WINDOWS_RESERVED_COMPONENT,
    canonicalCoverageId,
    encodeCanonicalRef,
    hasVisibleProse,
    isSafeAgentId,
    isSafeRelativePath,
    preflightJsonText,
    readFileWithinLimit,
    safeQuote,
    validateDocument
  };
  if (import.meta.main)
    process.exit(run(process.argv[2]));
});
export default require_validate_coverage_ledger();
