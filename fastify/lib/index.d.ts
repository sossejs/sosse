import { Ctx } from "sosse";

declare module "fastify" {
  interface FastifyInstance {
    ctx: Ctx;
  }
}
