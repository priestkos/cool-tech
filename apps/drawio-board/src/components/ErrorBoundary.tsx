import { Component, type ErrorInfo, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Props = {
  children: ReactNode
}

type State = {
  error: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error: error.message || "Something went wrong." }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Diagram Desk error boundary", error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Could not render this panel</AlertTitle>
          <AlertDescription>{this.state.error}</AlertDescription>
        </Alert>
      )
    }
    return this.props.children
  }
}
