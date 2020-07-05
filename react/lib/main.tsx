import React, { Fragment, hydrate, render } from "react";

const isNode =
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined";

const emptyFunc = () => {};

type Options<T> = {
  id: string;
  component: () => T;
  container?: Function;
  suspense?: Function;
  lazy?: boolean;
  ssr?: boolean;
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const components: Record<string, any> = {};

export const inject = function ({ logInjects = false } = {}) {
  for (const [id, { component, ssr, suspense, lazy }] of Object.entries(
    components
  )) {
    let jsonElList = document.querySelectorAll(`[data-interactive="${id}"`);
    if (jsonElList.length === 0) {
      return;
    }

    const jsonEls = Array.from(jsonElList);

    (async () => {
      const ASuspense = !ssr && suspense;
      let ComponentPromise = component();
      const LoadingComponent = ASuspense
        ? React.lazy(async () => ({ default: await ComponentPromise }))
        : await ComponentPromise;
      const injector = ssr ? hydrate : render;

      for (const el of jsonEls) {
        const containerEl = el.nextElementSibling;
        const aInject = function () {
          if (logInjects) {
            console.info("Injected: " + id);
          }

          const props = JSON.parse(el.innerHTML);
          let vdom = <LoadingComponent {...props} />;
          if (ASuspense) {
            vdom = <ASuspense>{vdom}</ASuspense>;
          }
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
      }
    })();
  }
};

const defaultContainer = function ({ children }) {
  return <div>{children}</div>;
};

export const interactive = async function <T, C = ThenArg<T>>({
  id,
  container = defaultContainer,
  component,
  suspense,
  lazy = false,
  ssr = false,
}: Options<T>): Promise<{ server: C }> {
  if (suspense && ssr) {
    console.warn("Using suspense and ssr together isn't supported");
  }

  lazy = lazy && typeof IntersectionObserver === "function";

  if (isNode) {
    const Container = container;
    let Component;

    if (ssr) {
      Component = await component();
    }

    return {
      server: function (props) {
        return (
          <Fragment>
            <script
              type="application/json"
              data-interactive={id}
              dangerouslySetInnerHTML={{ __html: JSON.stringify(props) }}
            />
            <Container>{ssr && <Component {...props} />}</Container>
          </Fragment>
        );
      } as any,
    };
  } else {
    components[id] = { component, ssr, suspense, lazy };

    return {
      server: emptyFunc as any,
    };
  }
};
