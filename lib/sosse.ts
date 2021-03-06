import { hsr as _hsr } from "./hsr";
import {
  EntryOptions,
  bundle,
  bundleClients,
  BundleEntryOptions,
} from "./bundle";
import { resolve } from "path";
import { writeFile, mkdirp, pathExists, emptyDir } from "fs-extra";
import { resolveServerMain } from "./resolveServerMain";
import { Ctx, ServeClientOptions, OtionOptions } from "./ctx";
import {} from "fs";

export type SosseOptions = {
  cwd?: string;
  libDir?: string;
  serverMain?: string;
  serveClient?: ServeClientOptions;
  otion?: OtionOptions;
  distDir?: string;
  productionBuild?: boolean;
  isDev?: boolean;
  restart?: boolean;
  bundleServer?: {
    enable?: boolean;
    entryOptions?: BundleEntryOptions;
  };
  bundleClient?: {
    enable?: boolean;
    entryOptions?: EntryOptions;
  };
};

export const sosse = async function ({
  cwd = process.cwd(),
  libDir = ".",
  distDir = "dist",
  productionBuild = false,
  isDev = true,
  restart = isDev,
  serverMain = "main",
  serveClient = {},
  otion = {},
  bundleServer = {},
  bundleClient = {},
}: SosseOptions = {}) {
  serveClient = {
    enable: true,
    ...serveClient,
  };

  otion = {
    enable: true,
    ...otion,
  };

  bundleClient = {
    enable: true,
    ...bundleClient,
  };

  bundleServer = {
    enable: true,
    ...bundleServer,
  };

  if (productionBuild) {
    process.env.NODE_ENV = "production";
  }

  cwd = resolve(cwd);
  libDir = resolve(cwd, libDir);
  await mkdirp(libDir);
  distDir = resolve(cwd, distDir);
  if (restart || productionBuild) {
    await emptyDir(distDir);
  }

  const serverDist = resolve(distDir, "server", "main.js");
  const clientSrcDir = resolve(libDir, "client");
  const clientDistDir = resolve(distDir, "client");

  if (!(await pathExists(clientSrcDir))) {
    bundleClient.enable = false;
  }

  let serverSrcMain = await resolveServerMain({
    serverMain,
    libDir,
  });

  if (!serverSrcMain) {
    if (bundleServer.enable) {
      serverSrcMain = resolve(libDir, `${serverMain}.js`);
      await writeFile(
        serverSrcMain,
        `import { useCtx, jsx } from "sosse";
import { css } from "sosse/iso";
import { h } from "preact";

export default () => {
  const ctx = useCtx();
  const server = ctx.createServer((req, res) => {
    if (req.url !== "/") return res.writeHead(500).end();

    res.end(
      ctx.html(() => ({
        body: jsx(<h1 class={css({ color: "orange" })}>Hello world</h1>),
      }))
    );
  });

  return () => {
    const port = 8080;
    server.listen(port);
    console.log(\`Started http://localhost:\${port}\`);

    return server;
  };
};
`
      );
    } else {
      console.error(`Could not resolve server main in "${libDir}"`);
      process.exit(1);
    }
  }

  const ctx = new Ctx({
    isDev,
    libDir,
    distDir,
    serveClient,
    otion,
  });

  const bundleServerOptions = {
    ctx,
    cwd,
    src: serverSrcMain,
    dist: serverDist,
    server: true,
    watch: restart && !productionBuild,
    entryOptions: bundleServer.entryOptions,
  };
  const bundleClientOptions = {
    ctx,
    cwd,
    src: clientSrcDir,
    dist: clientDistDir,
    watch: restart && !productionBuild,
    entryOptions: bundleClient.entryOptions,
  };

  if (bundleServer.enable) {
    const serverBuiltInProd =
      !productionBuild && !isDev && !(await pathExists(serverDist));
    if (serverBuiltInProd) {
      console.warn(
        `Server main "${serverDist}" doesn't exist and has to be built.`
      );
      console.warn(`I will try to build "${serverDist}" automatically.`);
      console.warn(
        `Recommendation: build server main with "sosse bundle" in advance.`
      );
    }

    if (isDev || productionBuild || serverBuiltInProd) {
      await bundle(bundleServerOptions);
    }
  }

  if (bundleClient.enable) {
    await bundleClients(bundleClientOptions);
  }

  if (productionBuild) {
    process.exit();
  }

  const main = bundleServer.enable ? bundleServerOptions.dist : serverSrcMain;

  const hsrOptions: any = {
    ctx,
    cwd,
    restart,
    main() {
      const server = require(main);
      return (server.default || server)();
    },
  };

  if (bundleServer.enable) {
    hsrOptions.watch = [];
  }

  _hsr(hsrOptions);
};
