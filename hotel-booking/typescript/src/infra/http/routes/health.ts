import { FastifyInstance } from "fastify";

export default async function healthRoute(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const request_id = (req as any).request_id;
    return reply
      .code(200)
      .send({
        status: "ok",
        service: "hotel-booking-api",
        version: "0.1.0",
        request_id,
      });
  });
}
