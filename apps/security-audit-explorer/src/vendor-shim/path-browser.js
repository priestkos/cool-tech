function isAbsolute(value) {
  if (typeof value !== "string") return false
  return value.startsWith("/") || /^[A-Za-z]:/.test(value)
}

function join(...parts) {
  return parts.filter(Boolean).join("/").replace(/\/+/g, "/")
}

const posix = { isAbsolute }
const win32 = { isAbsolute }

export default {
  join,
  posix,
  win32,
  isAbsolute,
}
