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

// vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/validate-findings.cjs
var require_validate_findings = __commonJS(function(exports, module) {
  var __dirname = "/agent/repos/cool-tech/apps/security-audit-explorer/vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8";
  var fs = (() => ({}));
  var path = { join: function(...parts){ return parts.filter(Boolean).join("/").replace(/\/+/g,"/"); }, posix: { isAbsolute: function(v){ return typeof v==="string" && v.startsWith("/"); } }, win32: { isAbsolute: function(v){ return typeof v==="string" && /^[A-Za-z]:/.test(v); } } };
  var { TextDecoder } = globalThis;
  var hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  var SUPPORTED_TYPES = new Set(["object", "array", "string", "integer", "number", "boolean", "null"]);
  var SUPPORTED_KEYWORDS = new Set([
    "$comment",
    "additionalProperties",
    "const",
    "description",
    "enum",
    "items",
    "minimum",
    "minItems",
    "minLength",
    "oneOf",
    "pattern",
    "properties",
    "required",
    "type",
    "uniqueItems",
    "visibleContent"
  ]);
  var SEVERITY_RANK = new Map([
    ["informational", 0],
    ["low", 1],
    ["medium", 2],
    ["high", 3],
    ["critical", 4]
  ]);
  var LIMITS = Object.freeze({
    inputBytes: 5 * 1024 * 1024,
    nestingDepth: 64,
    arrayItems: 1000,
    canonicalKeyBytes: 1024 * 1024,
    uniqueSetBytes: 5 * 1024 * 1024,
    validationErrors: 100
  });
  var VISIBLE_CONTENT = /[^\p{White_Space}\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
  var PATH_FORBIDDEN_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u;
  var WINDOWS_RESERVED_COMPONENT = /^(?:con|prn|aux|nul|clock\$|conin\$|conout\$|com[1-9\u00b9\u00b2\u00b3]|lpt[1-9\u00b9\u00b2\u00b3])(?:\.|$)/iu;
  var UTF8_DECODER = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  var UNSAFE_DIAGNOSTIC_CHARACTER = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/gu;
  var MAX_DIAGNOSTIC_STRING_LENGTH = 256;

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
  function propertyPath(base, key) {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${base}.${key}` : `${base}[${safeQuote(key)}]`;
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
  function typeOf(value) {
    if (Array.isArray(value))
      return "array";
    if (value === null)
      return "null";
    return typeof value;
  }
  function deepEqual(left, right) {
    if (left === right)
      return true;
    if (typeOf(left) !== typeOf(right))
      return false;
    if (Array.isArray(left)) {
      return left.length === right.length && left.every((value, index) => deepEqual(value, right[index]));
    }
    if (left !== null && typeof left === "object") {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      return leftKeys.length === rightKeys.length && leftKeys.every((key) => hasOwn(right, key) && deepEqual(left[key], right[key]));
    }
    return false;
  }
  function codePointLength(value) {
    let length = 0;
    let index = 0;
    while (index < value.length) {
      const first = value.charCodeAt(index++);
      if (first >= 55296 && first <= 56319 && index < value.length) {
        const second = value.charCodeAt(index);
        if (second >= 56320 && second <= 57343)
          index++;
      }
      length++;
    }
    return length;
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
  function canonicalKey(value) {
    const chunks = [];
    let bytes = 0;
    function append(chunk) {
      bytes += Buffer.byteLength(chunk);
      if (bytes > LIMITS.canonicalKeyBytes) {
        throw new Error(`canonical key exceeds ${LIMITS.canonicalKeyBytes} byte limit`);
      }
      chunks.push(chunk);
    }
    function encode(item) {
      const type = typeOf(item);
      if (type === "null") {
        append("null");
      } else if (type === "string") {
        append(`string:${JSON.stringify(item)}`);
      } else if (type === "number") {
        append(`number:${Object.is(item, -0) ? "0" : String(item)}`);
      } else if (type === "boolean") {
        append(`boolean:${item ? "true" : "false"}`);
      } else if (type === "array") {
        append("array:[");
        item.forEach((entry, index) => {
          if (index > 0)
            append(",");
          encode(entry);
        });
        append("]");
      } else if (type === "object") {
        append("object:{");
        Object.keys(item).sort().forEach((key, index) => {
          if (index > 0)
            append(",");
          append(JSON.stringify(key));
          append(":");
          encode(item[key]);
        });
        append("}");
      } else {
        append(`${type}:${String(item)}`);
      }
    }
    encode(value);
    return { key: chunks.join(""), bytes };
  }
  function collectDataLimitErrors(value, location = "$data") {
    const stack = [{ value, location, depth: value !== null && typeof value === "object" ? 1 : 0 }];
    const seen = new WeakSet;
    while (stack.length > 0) {
      const current = stack.pop();
      if (current.value === null || typeof current.value !== "object")
        continue;
      if (current.depth > LIMITS.nestingDepth) {
        return [escapeUnsafeDiagnosticCharacters(`${current.location}: exceeds ${LIMITS.nestingDepth} level nesting depth limit`)];
      }
      if (seen.has(current.value)) {
        return [escapeUnsafeDiagnosticCharacters(`${current.location}: input must not contain repeated or cyclic object references`)];
      }
      seen.add(current.value);
      if (Array.isArray(current.value)) {
        if (current.value.length > LIMITS.arrayItems) {
          return [escapeUnsafeDiagnosticCharacters(`${current.location}: exceeds ${LIMITS.arrayItems} item array limit`)];
        }
        for (let index = current.value.length - 1;index >= 0; index--) {
          const child = current.value[index];
          if (child !== null && typeof child === "object") {
            stack.push({ value: child, location: `${current.location}[${index}]`, depth: current.depth + 1 });
          }
        }
      } else {
        const keys = Object.keys(current.value);
        for (let index = keys.length - 1;index >= 0; index--) {
          const key = keys[index];
          const child = current.value[key];
          if (child !== null && typeof child === "object") {
            stack.push({ value: child, location: propertyPath(current.location, key), depth: current.depth + 1 });
          }
        }
      }
    }
    return [];
  }
  function collectSchemaErrors(schema, location = "schema") {
    const errors = createErrorList();
    function check(node, p) {
      if (node === null || typeof node !== "object" || Array.isArray(node)) {
        errors.push(`${p}: schema must be an object`);
        return;
      }
      for (const key of Object.keys(node)) {
        if (!SUPPORTED_KEYWORDS.has(key))
          errors.push(`${p}: unsupported schema keyword ${safeQuote(key)}`);
      }
      if (hasOwn(node, "$comment") && typeof node.$comment !== "string") {
        errors.push(`${p}.$comment: expected string`);
      }
      if (hasOwn(node, "description") && typeof node.description !== "string") {
        errors.push(`${p}.description: expected string`);
      }
      if (hasOwn(node, "type") && !SUPPORTED_TYPES.has(node.type)) {
        errors.push(`${p}.type: unsupported type ${safeQuote(node.type)}`);
      }
      if (hasOwn(node, "properties")) {
        if (node.properties === null || typeof node.properties !== "object" || Array.isArray(node.properties)) {
          errors.push(`${p}.properties: expected object`);
        } else {
          for (const key of Object.keys(node.properties))
            check(node.properties[key], propertyPath(`${p}.properties`, key));
        }
      }
      if (hasOwn(node, "required")) {
        if (!Array.isArray(node.required) || node.required.some((key) => typeof key !== "string")) {
          errors.push(`${p}.required: expected an array of strings`);
        } else if (new Set(node.required).size !== node.required.length) {
          errors.push(`${p}.required: entries must be unique`);
        }
      }
      if (hasOwn(node, "additionalProperties") && typeof node.additionalProperties !== "boolean") {
        errors.push(`${p}.additionalProperties: only boolean values are supported`);
      }
      if (hasOwn(node, "enum")) {
        if (!Array.isArray(node.enum) || node.enum.length === 0) {
          errors.push(`${p}.enum: expected a non-empty array`);
        } else {
          const seen = new Set;
          for (const value of node.enum) {
            let key;
            try {
              key = canonicalKey(value).key;
            } catch (error) {
              errors.push(`${p}.enum: ${error.message}`);
              break;
            }
            if (seen.has(key)) {
              errors.push(`${p}.enum: entries must be unique`);
              break;
            }
            seen.add(key);
          }
        }
      }
      if (hasOwn(node, "items"))
        check(node.items, `${p}.items`);
      for (const keyword of ["minItems", "minLength"]) {
        if (hasOwn(node, keyword) && (!Number.isInteger(node[keyword]) || node[keyword] < 0)) {
          errors.push(`${p}.${keyword}: expected a non-negative integer`);
        }
      }
      if (hasOwn(node, "minimum") && (typeof node.minimum !== "number" || !Number.isFinite(node.minimum))) {
        errors.push(`${p}.minimum: expected a finite number`);
      }
      if (hasOwn(node, "pattern")) {
        if (typeof node.pattern !== "string") {
          errors.push(`${p}.pattern: expected string`);
        } else {
          try {
            new RegExp(node.pattern);
          } catch (error) {
            errors.push(`${p}.pattern: invalid regular expression`);
          }
        }
      }
      if (hasOwn(node, "uniqueItems") && typeof node.uniqueItems !== "boolean") {
        errors.push(`${p}.uniqueItems: expected boolean`);
      }
      if (hasOwn(node, "visibleContent")) {
        if (typeof node.visibleContent !== "boolean") {
          errors.push(`${p}.visibleContent: expected boolean`);
        } else if (node.visibleContent === true && node.type !== "string") {
          errors.push(`${p}.visibleContent: requires type "string"`);
        }
      }
      if (hasOwn(node, "oneOf")) {
        if (!Array.isArray(node.oneOf) || node.oneOf.length === 0) {
          errors.push(`${p}.oneOf: expected a non-empty array`);
        } else {
          node.oneOf.forEach((branch, index) => check(branch, `${p}.oneOf[${index}]`));
        }
      }
    }
    check(schema, location);
    return errors;
  }
  function findDiscriminator(schema) {
    if (!hasOwn(schema, "properties") || typeof schema.properties !== "object")
      return null;
    for (const key of Object.keys(schema.properties)) {
      const subSchema = schema.properties[key];
      if (subSchema && typeof subSchema === "object" && hasOwn(subSchema, "const")) {
        return { key, value: subSchema.const };
      }
    }
    return null;
  }
  function validate(value, schema, p, errors) {
    if (errors.length >= LIMITS.validationErrors)
      return;
    if (hasOwn(schema, "oneOf")) {
      const results = schema.oneOf.map((branch) => collectUnchecked(value, branch, p));
      const passingIndexes = results.map((branchErrors, index) => branchErrors.length === 0 ? index : -1).filter((index) => index !== -1);
      if (passingIndexes.length !== 1) {
        errors.push(`${p}: must match exactly one schema in oneOf; matched ${passingIndexes.length}`);
        if (passingIndexes.length === 0 && value !== null && typeof value === "object" && !Array.isArray(value)) {
          const matchingDiscriminators = schema.oneOf.map((branch, index) => ({ discriminator: findDiscriminator(branch), index })).filter(({ discriminator }) => discriminator && hasOwn(value, discriminator.key) && deepEqual(value[discriminator.key], discriminator.value));
          if (matchingDiscriminators.length === 1) {
            errors.push(...results[matchingDiscriminators[0].index]);
          }
        }
      }
    }
    if (hasOwn(schema, "const") && !deepEqual(value, schema.const)) {
      errors.push(`${p}: must equal ${safeQuote(schema.const)}, got ${safeQuote(value)}`);
    }
    if (hasOwn(schema, "enum") && !schema.enum.some((allowed) => deepEqual(value, allowed))) {
      const allowed = schema.enum.map(safeQuote).join(", ");
      errors.push(`${p}: invalid value ${safeQuote(value)} (expected one of ${allowed})`);
    }
    if (hasOwn(schema, "type") && typeOf(value) !== schema.type && !(schema.type === "integer" && typeOf(value) === "number" && Number.isInteger(value))) {
      errors.push(`${p}: expected ${schema.type}, got ${typeOf(value)}`);
      return;
    }
    if (typeOf(value) === "object") {
      for (const req of hasOwn(schema, "required") ? schema.required : []) {
        if (!hasOwn(value, req))
          errors.push(`${p}: missing required field ${safeQuote(req)}`);
      }
      for (const key of Object.keys(value)) {
        if (hasOwn(schema, "properties") && hasOwn(schema.properties, key)) {
          validate(value[key], schema.properties[key], propertyPath(p, key), errors);
        } else if (hasOwn(schema, "additionalProperties") && schema.additionalProperties === false) {
          errors.push(`${p}: unexpected field ${safeQuote(key)}`);
        }
      }
    }
    if (Array.isArray(value)) {
      if (hasOwn(schema, "minItems") && value.length < schema.minItems) {
        errors.push(`${p}: must have at least ${schema.minItems} item(s), got ${value.length}`);
      }
      if (hasOwn(schema, "uniqueItems") && schema.uniqueItems === true) {
        const seen = new Set;
        let setBytes = 0;
        for (let i = 0;i < value.length; i++) {
          let canonical;
          try {
            canonical = canonicalKey(value[i]);
          } catch (error) {
            errors.push(`${p}[${i}]: ${error.message}`);
            break;
          }
          if (seen.has(canonical.key)) {
            errors.push(`${p}: items must be unique; duplicate at index ${i}`);
            continue;
          }
          setBytes += canonical.bytes;
          if (setBytes > LIMITS.uniqueSetBytes) {
            errors.push(`${p}: canonical uniqueness set exceeds ${LIMITS.uniqueSetBytes} byte limit`);
            break;
          }
          seen.add(canonical.key);
        }
      }
      if (hasOwn(schema, "items")) {
        value.forEach((item, index) => validate(item, schema.items, `${p}[${index}]`, errors));
      }
    }
    if (typeof value === "string") {
      if (hasOwn(schema, "minLength") && codePointLength(value) < schema.minLength) {
        errors.push(`${p}: must have at least ${schema.minLength} character(s)`);
      }
      if (schema.visibleContent === true) {
        if (!hasValidUnicodeScalarValues(value)) {
          errors.push(`${p}: must contain only valid Unicode scalar values`);
        } else if (!VISIBLE_CONTENT.test(value)) {
          errors.push(`${p}: must contain a visible character`);
        }
      }
      if (hasOwn(schema, "pattern") && !new RegExp(schema.pattern).test(value)) {
        errors.push(`${p}: must match pattern ${JSON.stringify(schema.pattern)}`);
      }
    }
    if (typeof value === "number" && hasOwn(schema, "minimum") && value < schema.minimum) {
      errors.push(`${p}: must be at least ${schema.minimum}, got ${value}`);
    }
  }
  function collectUnchecked(value, schema, p) {
    const errors = createErrorList();
    validate(value, schema, p, errors);
    return errors;
  }
  function collect(value, schema, p = "$data") {
    const limitErrors = collectDataLimitErrors(value, p);
    if (limitErrors.length > 0)
      return limitErrors;
    return collectUnchecked(value, schema, p);
  }
  function isSafeRelativeSourcePath(value) {
    if (typeof value !== "string" || value.length === 0 || !hasValidUnicodeScalarValues(value) || value.trim() !== value || PATH_FORBIDDEN_CHARACTER.test(value) || value.includes("\\") || value.includes(":"))
      return false;
    if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.startsWith("~"))
      return false;
    const segments = value.split("/");
    return segments.every((segment) => segment !== "" && segment !== "." && segment !== ".." && !/[ .]$/u.test(segment) && !WINDOWS_RESERVED_COMPONENT.test(segment));
  }
  function collectFindingSemanticErrors(findings) {
    const errors = createErrorList();
    if (!Array.isArray(findings))
      return errors;
    const fingerprints = new Map;
    let previousFingerprint = null;
    findings.forEach((finding, index) => {
      if (errors.length >= LIMITS.validationErrors)
        return;
      if (!finding || typeof finding !== "object" || Array.isArray(finding))
        return;
      const base = `$[${index}]`;
      if (hasOwn(finding, "fingerprint") && typeof finding.fingerprint === "string") {
        if (fingerprints.has(finding.fingerprint)) {
          errors.push(`${base}.fingerprint: duplicate of $[${fingerprints.get(finding.fingerprint)}].fingerprint`);
        } else {
          fingerprints.set(finding.fingerprint, index);
        }
        if (previousFingerprint !== null && previousFingerprint > finding.fingerprint) {
          errors.push(`${base}.fingerprint: findings must be sorted lexicographically`);
        }
        previousFingerprint = finding.fingerprint;
      }
      for (const field of ["trace", "evidence"]) {
        if (!hasOwn(finding, field) || !Array.isArray(finding[field]))
          continue;
        finding[field].forEach((entry, entryIndex) => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry))
            return;
          if (hasOwn(entry, "line") && (!Number.isInteger(entry.line) || entry.line < 1)) {
            errors.push(`${base}.${field}[${entryIndex}].line: must be a positive integer`);
          }
          if (hasOwn(entry, "file") && !isSafeRelativeSourcePath(entry.file)) {
            errors.push(`${base}.${field}[${entryIndex}].file: must be a safe repository-relative source path`);
          }
        });
      }
      if (finding.remediation && Array.isArray(finding.remediation.code_changes)) {
        finding.remediation.code_changes.forEach((change, changeIndex) => {
          if (change && hasOwn(change, "file_name") && !isSafeRelativeSourcePath(change.file_name)) {
            errors.push(`${base}.remediation.code_changes[${changeIndex}].file_name: must be a safe repository-relative source path`);
          }
        });
      }
      if (Array.isArray(finding.trace) && finding.trace.length === 1) {
        const kind = finding.trace[0] && finding.trace[0].kind;
        if (kind !== "entrypoint" && kind !== "sink") {
          errors.push(`${base}.trace[0].kind: a one-line trace must be "entrypoint" or "sink"`);
        }
      } else if (Array.isArray(finding.trace) && finding.trace.length > 1) {
        const last = finding.trace.length - 1;
        if (finding.trace[0] && finding.trace[0].kind !== "entrypoint") {
          errors.push(`${base}.trace[0].kind: must be "entrypoint", got ${safeQuote(finding.trace[0].kind)}`);
        }
        if (finding.trace[last] && finding.trace[last].kind !== "sink") {
          errors.push(`${base}.trace[${last}].kind: must be "sink", got ${safeQuote(finding.trace[last].kind)}`);
        }
        for (let traceIndex = 1;traceIndex < last; traceIndex++) {
          if (finding.trace[traceIndex] && finding.trace[traceIndex].kind !== "propagation") {
            errors.push(`${base}.trace[${traceIndex}].kind: must be "propagation", got ${safeQuote(finding.trace[traceIndex].kind)}`);
          }
        }
      }
      const verdict = finding.verdict;
      if (verdict === "confirmed") {
        for (const forbidden of ["claimed_root_cause", "blockers", "validation_plan", "reason"]) {
          if (hasOwn(finding, forbidden))
            errors.push(`${base}: confirmed finding must not contain ${safeQuote(forbidden)}`);
        }
        if (!finding.execution || typeof finding.execution !== "object" || typeof finding.execution.observed_result !== "string" || !hasVisibleProse(finding.execution.observed_result)) {
          errors.push(`${base}: confirmed finding requires a visible execution observed_result`);
        }
        if (!finding.remediation || typeof finding.remediation !== "object" || typeof finding.remediation.strategy !== "string" || !hasVisibleProse(finding.remediation.strategy)) {
          errors.push(`${base}: confirmed finding requires visible remediation`);
        }
        const overall = finding.severity && finding.severity.overall_severity;
        const impact = finding.severity && finding.severity.impact && finding.severity.impact.score;
        if (SEVERITY_RANK.has(overall) && SEVERITY_RANK.has(impact) && SEVERITY_RANK.get(overall) > SEVERITY_RANK.get(impact)) {
          errors.push(`${base}.severity.overall_severity: cannot exceed demonstrated impact ${safeQuote(impact)}`);
        }
      } else if (verdict === "needs_validation") {
        if (hasOwn(finding, "severity"))
          errors.push(`${base}: needs_validation finding must not contain "severity"`);
        for (const forbidden of ["execution", "remediation", "reason", "root_cause"]) {
          if (hasOwn(finding, forbidden))
            errors.push(`${base}: needs_validation finding must not contain ${safeQuote(forbidden)}`);
        }
        const plan = finding.validation_plan;
        const hasLocalPlan = plan && typeof plan.local === "string" && hasVisibleProse(plan.local);
        const hasDeploymentPlan = plan && typeof plan.deployment === "string" && hasVisibleProse(plan.deployment);
        if (!hasLocalPlan && !hasDeploymentPlan) {
          errors.push(`${base}.validation_plan: requires at least one visible local or deployment plan`);
        }
      } else if (verdict === "rejected") {
        for (const forbidden of ["severity", "execution", "remediation", "blockers", "validation_plan", "root_cause"]) {
          if (hasOwn(finding, forbidden))
            errors.push(`${base}: rejected finding must not contain ${safeQuote(forbidden)}`);
        }
      }
    });
    return errors;
  }
  function validateDocument(findings, schema) {
    const schemaErrors = collectSchemaErrors(schema);
    if (schemaErrors.length > 0)
      return schemaErrors;
    const limitErrors = collectDataLimitErrors(findings, "$");
    if (limitErrors.length > 0)
      return limitErrors;
    const errors = collectUnchecked(findings, schema, "$");
    if (errors.length < LIMITS.validationErrors) {
      errors.push(...collectFindingSemanticErrors(findings));
    }
    return errors;
  }
  function loadSchema(schemaPath) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    const errors = collectSchemaErrors(schema);
    if (errors.length > 0)
      throw new Error(`unsupported or invalid report schema:
${errors.join(`
`)}`);
    return schema;
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
      if (error && (error.code === "ELOOP" || error.code === "EMLINK")) {
        throw new SafeInputError("input must not be a symlink");
      }
      throw error;
    }
    try {
      const stat = fs.fstatSync(descriptor);
      if (!stat.isFile()) {
        throw new SafeInputError("input must be a regular file");
      }
      if (stat.size > LIMITS.inputBytes) {
        throw new SafeInputError(`input exceeds ${LIMITS.inputBytes} byte limit`);
      }
      const chunks = [];
      const buffer = Buffer.allocUnsafe(64 * 1024);
      let bytesRead = 0;
      while (true) {
        const count = fs.readSync(descriptor, buffer, 0, buffer.length, null);
        if (count === 0)
          break;
        bytesRead += count;
        if (bytesRead > LIMITS.inputBytes) {
          throw new SafeInputError(`input exceeds ${LIMITS.inputBytes} byte limit`);
        }
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
  function enforceJsonTextLimits(contents) {
    const containers = [];
    let inString = false;
    let escaped = false;
    function markArrayItem() {
      const container = containers[containers.length - 1];
      if (!container || container.type !== "array" || !container.expectsItem)
        return;
      container.expectsItem = false;
      container.items++;
      if (container.items > LIMITS.arrayItems) {
        throw new JsonStructureError(`input exceeds ${LIMITS.arrayItems} item array limit`);
      }
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
      if (character === '"') {
        markArrayItem();
        inString = true;
      } else if (character === "[" || character === "{") {
        markArrayItem();
        if (containers.length >= LIMITS.nestingDepth) {
          throw new JsonStructureError(`input exceeds ${LIMITS.nestingDepth} level nesting depth limit`);
        }
        containers.push({
          type: character === "[" ? "array" : "object",
          expectsItem: character === "[",
          items: 0
        });
      } else if (character === "]" || character === "}") {
        containers.pop();
      } else if (character === ",") {
        const container = containers[containers.length - 1];
        if (container && container.type === "array")
          container.expectsItem = true;
      } else if (!/\s/.test(character)) {
        markArrayItem();
      }
    }
  }
  function run(file) {
    if (!file) {
      console.error("Usage: node validate-findings.cjs <path-to-findings.json>");
      return 1;
    }
    let schema;
    try {
      schema = loadSchema(join(__dirname, "report-schema.json"));
    } catch (error) {
      console.error("Failed to load report-schema.json:", error.message);
      return 1;
    }
    let contents;
    try {
      contents = readFileWithinLimit(file);
    } catch (error) {
      const reason = error instanceof SafeInputError ? error.message : "input could not be opened or read safely";
      console.error(`Failed to read findings JSON: ${reason}`);
      return 1;
    }
    try {
      enforceJsonTextLimits(contents);
    } catch (error) {
      const reason = error instanceof JsonStructureError ? error.message : "invalid JSON structure";
      console.error(`Failed to parse findings JSON: ${reason}`);
      return 1;
    }
    let findings;
    try {
      findings = JSON.parse(contents);
    } catch {
      console.error("Failed to parse findings JSON: invalid JSON syntax");
      return 1;
    }
    let errors;
    try {
      errors = validateDocument(findings, schema);
    } catch {
      console.error("Failed to validate findings JSON: unexpected validation error");
      return 1;
    }
    for (const message of errors)
      console.error("ERROR:", escapeUnsafeDiagnosticCharacters(message));
    if (errors.length > 0) {
      const cap = errors.length === LIMITS.validationErrors ? `; output capped at ${LIMITS.validationErrors}` : "";
      console.error(`FAIL: ${errors.length} validation error(s)${cap}`);
      return 1;
    }
    console.log(`PASS: ${findings.length} findings valid`);
    return 0;
  }
  module.exports = {
    LIMITS,
    PATH_FORBIDDEN_CHARACTER,
    UNSAFE_DIAGNOSTIC_CHARACTER,
    VISIBLE_CONTENT,
    WINDOWS_RESERVED_COMPONENT,
    collect,
    collectFindingSemanticErrors,
    collectSchemaErrors,
    hasVisibleProse,
    isSafeRelativeSourcePath,
    validateDocument
  };
  if (import.meta.main)
    process.exit(run(process.argv[2]));
});
export default require_validate_findings();
