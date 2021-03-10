/// <reference path="./index.d.ts" />

import { useCtx } from "sosse";

export const decorate = (fastify) => {
  fastify.decorate("ctx", useCtx());
};

export const serverFactory = (h) => {
  const ctx = useCtx();
  return ctx.createServer(h);
};
