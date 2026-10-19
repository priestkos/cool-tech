import { plugin } from 'bun'
import path from 'node:path'

await plugin({
  name: 'tsconfig-paths',
  setup(build) {
    build.onResolve({ filter: /^@\// }, args => ({
      path: path.join(import.meta.dir, 'src', args.path.replace(/^@\//, '')),
    }))
  },
})
