import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { authRoutes } from "./auth/routes.js";
import { deckRoutes } from "./decks/routes.js";
import { dataSourceRoutes } from "./data-sources/routes.js";
import { blockRoutes } from "./blocks/routes.js";

const fastify = Fastify({ logger: true });

const PORT = Number(process.env.PORT ?? 3000);
const DATABASE_URL = process.env.DATABASE_URL ?? "";
const CORS_ORIGINS = process.env.CORS_ORIGINS?.trim() ?? "";

// Shared CORS options for dev and production (add new methods/headers here if needed)
const corsMethods = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const corsAllowedHeaders = ["Content-Type", "Authorization", "Accept", "Accept-Language"];

fastify.get("/", async () => ({ ok: true, message: "API" }));

fastify.get("/health", async () => {
  return {
    ok: true,
    database: DATABASE_URL ? "configured" : "not configured",
  };
});

async function start() {
  try {
    if (process.env.NODE_ENV === "production" && !CORS_ORIGINS) {
      fastify.log.warn("Production must set CORS_ORIGINS; refusing to run with permissive CORS.");
      process.exit(1);
    }
    const corsOrigin = CORS_ORIGINS
      ? CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
      : true;
    await fastify.register(cors, {
      origin: corsOrigin,
      methods: corsMethods,
      allowedHeaders: corsAllowedHeaders,
    });
    await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
    await fastify.register(authRoutes);
    await fastify.register(deckRoutes);
    await fastify.register(dataSourceRoutes);
    await fastify.register(blockRoutes);
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
