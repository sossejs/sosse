import { h, Fragment } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { render, hydrate } from "preact";
import _lazy, { ErrorBoundary } from "preact-iso/lazy";
export { default as lazy, ErrorBoundary } from "preact-iso/lazy";
import { isNode } from "./isNode";
import { encodeURI, decode } from "js-base64";

const emptyFunc = () => {};

type Options<T> = {
  id: string;
  component: () => T;
  container?: Function;
  suspense?: Function;
  lazy?: boolean;
  ssr?: boolean;
  wrapper?: any[];
  serialize?: typeof defaultSerializer;
  deserialize?: typeof defaultDeserializer;
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const injectCache: Record<string, any> = {};

export const inject = function ({
  logInjects = process.env.NODE_ENV !== "production",
} = {}) {
  let containerElList = document.getElementsByClassName(`sosse-interactive`);
  if (containerElList.length === 0) {
    return;
  }

  const componentPromises: Record<string, any> = {};

  const containerEls = Array.from(containerElList);
  containerEls.forEach(async (el) => {
    const { interactive: id, props } = el["dataset"];
    const {
      deserialize,
      component,
      suspense,
      lazy,
      wrapper,
      ssr,
    } = injectCache[id];
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

    const aInject = function () {
      if (logInjects) {
        console.info("Injected: " + id);
      }

      let vdom = <LoadingComponent {...deserialize(props)} />;
      if (wrapper.length) {
        for (const Wrapper of wrapper) {
          vdom = <Wrapper>{vdom}</Wrapper>;
        }
      }
      if (ASuspense) {
        vdom = <ASuspense>{vdom}</ASuspense>;
      }

      (ssr ? hydrate : render)(vdom, el);
    };

    if (lazy) {
      new IntersectionObserver(([entry], obs) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        aInject();
      }).observe(el);
    } else {
      aInject();
    }
  });
};

const defaultContainer = function (props) {
  return <div {...props} />;
};

export const interactive = function <T, C = ThenArg<T>>({
  id,
  container = defaultContainer,
  component,
  suspense = ErrorBoundary,
  lazy = false,
  ssr = false,
  wrapper = [],
  serialize = defaultSerializer,
  deserialize = defaultDeserializer,
}: Options<T>): C {
  lazy = lazy && typeof IntersectionObserver === "function";

  injectCache[id] = {
    ssr,
    component,
    suspense: suspense,
    deserialize,
    lazy,
    wrapper,
  };

  if (isNode) {
    const Container = container;

    const Component: any = _lazy(component as any);

    return function (props) {
      return (
        <Container
          class="sosse-interactive"
          data-interactive={id}
          data-props={serialize(props)}
        >
          {ssr && <Component {...props} />}
        </Container>
      );
    } as any;
  } else {
    return emptyFunc as any;
  }
};

const defaultSerializer = function (value) {
  return encodeURI(JSON.stringify(value));
};

const defaultDeserializer = function (value) {
  return JSON.parse(decode(value));
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
