import { nanoid } from "nanoid";
import { FastifyRequest, FastifyReply } from "fastify";

export async function requestIdHook(req: FastifyRequest, reply: FastifyReply) {
  const heaeder = (req.headers["x-request-id"] || req.headers["request-id"]) as
    | string
    | undefined;
  const id = heaeder?.toString() || nanoid();
  (req as any).request_id = id;
  reply.header("x-request-id", id);
}
