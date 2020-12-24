import { h, Component } from "preact";
import { Suspense } from "preact/compat";
import { interactive, hydratedContext } from "sosse/iso";
import { ColorContext, colorRef } from "./context";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const MySuspense = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
  </ErrorBoundary>
);

export const HydrateColorContext = hydratedContext({
  id: "colorContext",
  context: ColorContext,
  ref: colorRef,
});

export const SsrInjectCounter = interactive({
  id: "ssrCounter",
  component: async () => (await import("./components/counter")).Counter,
  ssr: true,
});

export const SuspenseInjectCounter = interactive({
  id: "suspenseCounter",
  component: async () => (await import("./components/counter")).Counter,
  suspense: MySuspense,
});

export const LazyInjectCounter = interactive({
  id: "lazyCounter",
  lazy: true,
  component: async () => (await import("./components/counter")).Counter,
  suspense: MySuspense,
});

export const Box = interactive({
  id: "box",
  lazy: true,
  component: async () => (await import("./components/box")).Box,
  wrapper: [HydrateColorContext],
});
