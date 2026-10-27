import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { createSeo } from "./seo";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");
  const seo = createSeo(distPath);

  let shell: string | null = null;
  const getShell = () => (shell ??= fs.readFileSync(indexPath, "utf-8"));

  // Real files first — assets, robots.txt, sitemap.xml, content markdown.
  // index:false so "/" falls through and gets its head tags injected too.
  app.use(express.static(distPath, { index: false }));

  // No mount path on purpose: app.use("*", fn) strips the matched prefix, so
  // req.path would always read "/" and every route would get the homepage tags.
  app.use((req, res) => {
    const routeSeo = seo.resolve(req.path);

    if (routeSeo?.redirect) {
      return res.redirect(301, routeSeo.redirect);
    }

    const html = seo.inject(getShell(), routeSeo);

    // A path this app doesn't serve gets a real 404 rather than a soft 200
    // copy of the homepage, so search engines stop indexing junk URLs.
    res
      .status(routeSeo ? 200 : 404)
      .set({ "Content-Type": "text/html; charset=utf-8" })
      .send(html);
  });
}
