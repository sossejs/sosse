import React, {
  Fragment,
  hydrate,
  render,
  useContext,
  useEffect,
  useState,
} from "react";
import { isNode } from "sosse/uni";

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

let components: Record<string, any> = {};
const injectCache: Record<string, any> = {};

export const preload = async function () {
  const importPromises = [];
  for (const [id, { component, ssr }] of Object.entries(injectCache)) {
    if (!ssr) {
      continue;
    }

    const importPromise = (async () => {
      components[id] = await component();
    })();

    importPromises.push(importPromise);
  }

  await Promise.all(importPromises);
};

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
    const { component, ssr, suspense, lazy, wrapper } = injectCache[id];
    const ASuspense = suspense;

    componentPromises[id] =
      componentPromises[id] ||
      (async () => {
        let ComponentPromise = component();
        return ASuspense
          ? React.lazy(async () => ({ default: await ComponentPromise }))
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
      const injector = ssr ? hydrate : render;
      injector(vdom, containerEl);
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
  suspense,
  lazy = false,
  ssr = false,
  wrapper = [],
}: Options<T>): C {
  if (suspense && ssr) {
    console.warn("Using suspense and ssr together isn't supported");
  }

  lazy = lazy && typeof IntersectionObserver === "function";

  injectCache[id] = {
    component,
    ssr,
    suspense: !ssr && suspense,
    lazy,
    wrapper,
  };

  if (isNode) {
    const Container = container;

    return function (props) {
      const Component = components[id];

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

export const hydratedContext = function ({
  id,
  context,
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
    let value;

    const el = document.getElementsByClassName(elClass);
    if (el[0]) {
      value = deserialize(el[0].innerHTML);
    }

    const subs = [];
    const Context = context;

    const comp = function ({ children }) {
      const [localValue, setValue] = useState(value);

      useEffect(function () {
        subs.push(function () {
          setValue(value);
        });
      });

      return <Context.Provider value={localValue}>{children}</Context.Provider>;
    };

    comp["value"] = function (newValue?) {
      if (newValue !== undefined) {
        value = newValue;
        for (const sub of subs) {
          sub();
        }
      }

      return value;
    };

    return comp;
  }
};
