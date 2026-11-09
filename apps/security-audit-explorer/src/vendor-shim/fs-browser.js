export default {
  constants: { O_RDONLY: 0, O_NOFOLLOW: 0, O_NONBLOCK: 0 },
  openSync() {
    throw new Error("fs unavailable in browser validator bundle")
  },
  fstatSync() {
    throw new Error("fs unavailable in browser validator bundle")
  },
  readSync() {
    throw new Error("fs unavailable in browser validator bundle")
  },
  closeSync() {
    throw new Error("fs unavailable in browser validator bundle")
  },
  readFileSync() {
    throw new Error("fs unavailable in browser validator bundle")
  },
}
