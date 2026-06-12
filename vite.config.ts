import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import askHandler from "./api/ask";

export default defineConfig({
  plugins: [
    localApiPlugin(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
    }),
    tailwindcss(),
    tsconfigPaths(),
    react(),
  ],
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

function localApiPlugin(): Plugin {
  return {
    name: "predeparture-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/api/ask") {
          return next();
        }

        try {
          const body = await readJsonBody(req);
          await askHandler(
            { method: req.method, body },
            {
              setHeader(name, value) {
                res.setHeader(name, value);
              },
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(payload) {
                res.end(JSON.stringify(payload));
              },
            },
          );
        } catch (error) {
          console.error("Local API route error", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Local API route failed. Please try again." }));
        }
      });
    },
  };
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        resolve(raw);
      }
    });
    req.on("error", () => resolve(undefined));
  });
}
