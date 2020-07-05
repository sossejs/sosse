import React, { Suspense } from "react";
import { interactive } from "sosse/preact";

class ErrorBoundary extends React.Component {
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
