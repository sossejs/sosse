import { h } from "preact";
import { Fragment, useContext, useEffect, useState } from "preact/compat";
import { lazy as _lazy, hydrate, ErrorBoundary } from "preact-iso";
export { lazy, ErrorBoundary } from "preact-iso";
import { isNode } from "./isNode";

const emptyFunc = () => {};

type Options<T> = {
  id: string;
  component: () => T;
  container?: Function;
  suspense?: Function;
  lazy?: boolean;
  ssr?: boolean;
  wrapper?: any[];
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const injectCache: Record<string, any> = {};

export const inject = function ({
  logInjects = process.env.NODE_ENV !== "production",
} = {}) {
  let jsonElList = document.getElementsByClassName(`sosse-interactive`);
  if (jsonElList.length === 0) {
    return;
  }

  const componentPromises: Record<string, any> = {};

  const jsonEls = Array.from(jsonElList);
  jsonEls.forEach(async (el) => {
    const id = el["dataset"].interactive;
    const { component, suspense, lazy, wrapper } = injectCache[id];
    const ASuspense = suspense;

    componentPromises[id] =
      componentPromises[id] ||
      (async () => {
        let ComponentPromise = component();
        return ASuspense
          ? _lazy(async () => ({ default: await ComponentPromise }))
          : await ComponentPromise;
      })();

    const LoadingComponent = await componentPromises[id];
    const containerEl = el.nextElementSibling;

    const aInject = function () {
      if (logInjects) {
        console.info("Injected: " + id);
      }

      const props = JSON.parse(el.innerHTML);
      let vdom = <LoadingComponent {...props} />;
      if (wrapper.length) {
        for (const Wrapper of wrapper) {
          vdom = <Wrapper>{vdom}</Wrapper>;
        }
      }
      if (ASuspense) {
        vdom = <ASuspense>{vdom}</ASuspense>;
      }
      hydrate(vdom, containerEl);
    };

    if (lazy) {
      new IntersectionObserver(([entry], obs) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(containerEl);
        aInject();
      }).observe(containerEl);
    } else {
      aInject();
    }
  });
};

const defaultContainer = function ({ children }) {
  return <div>{children}</div>;
};

export const interactive = function <T, C = ThenArg<T>>({
  id,
  container = defaultContainer,
  component,
  suspense = ErrorBoundary,
  lazy = false,
  ssr = false,
  wrapper = [],
}: Options<T>): C {
  lazy = lazy && typeof IntersectionObserver === "function";

  injectCache[id] = {
    component,
    suspense: suspense,
    lazy,
    wrapper,
  };

  if (isNode) {
    const Container = container;

    const Component = _lazy(component);

    return function (props) {
      return (
        <Fragment>
          <script
            type="application/json"
            class="sosse-interactive"
            data-interactive={id}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(props) }}
          />
          <Container>{ssr && <Component {...props} />}</Container>
        </Fragment>
      );
    } as any;
  } else {
    return emptyFunc as any;
  }
};

const defaultSerializer = function (value) {
  return JSON.stringify(value);
};

const defaultDeserializer = function (value) {
  return JSON.parse(value);
};

export const valueRef = function <T = any>(
  value?: T
): {
  value: T;
  update?: (newValue: T) => void;
} {
  return {
    value,
  };
};

export const hydratedContext = function ({
  id,
  context,
  ref = valueRef(),
  serialize = defaultSerializer,
  deserialize = defaultDeserializer,
}): any {
  const elClass = "sosse-context-" + id;

  if (isNode) {
    return function () {
      const value = useContext(context);

      return (
        <script
          type="application/json"
          class={elClass}
          dangerouslySetInnerHTML={{ __html: serialize(value) }}
        />
      );
    };
  } else {
    const el = document.getElementsByClassName(elClass);
    if (el[0]) {
      ref.value = deserialize(el[0].innerHTML);
    }

    const subs = [];
    ref.update = function (newValue) {
      this.value = newValue;
      for (const sub of subs) {
        sub();
      }
    };
    const Context = context;

    const comp = function ({ children }) {
      const [_, setValue] = useState({});

      useEffect(function () {
        subs.push(function () {
          setValue({});
        });
      }, []);

      return <Context.Provider value={ref.value}>{children}</Context.Provider>;
    };

    return comp;
  }
};
