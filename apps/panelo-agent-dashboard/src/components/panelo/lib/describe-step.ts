export function describeAgentStep({ ref, action, args = [] }: { ref: string; action: string; args?: unknown[] }) {
  const [arg] = args
  switch (action) {
    case "press":
      return args.length ? `Chose ${arg} in ${ref}` : `Pressed ${ref}`
    case "setValue":
      return `Set ${ref} to “${arg}”`
    case "setPressed":
    case "setChecked":
      return arg ? ref : `Turned off ${ref}`
    case "setOpen":
      return `${arg ? "Opened" : "Closed"} ${ref}`
    case "clear":
      return `Cleared ${ref}`
    default:
      return `${action} ${ref}`
  }
}
