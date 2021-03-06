import "module-alias/register";
import { Server } from "@hapi/hapi";
import path from "path";
import * as routes from "@route/index";
import { connection } from "@database/connection";
import { forEach as lodashForeach } from "lodash";
import jwt from "hapi-auth-jwt2";
import logger from "@utils/logger";
import { checkJwt } from "@utils/checkJwt";
import Inert from "@hapi/inert";
import chalk from "chalk";

const serverInit = async (): Promise<Server> => {
  let serverRoutes: any = [];

  const server = new Server({
    host: "localhost",
    port: process.env.PORT || 3010,
    routes: {
      cors: true,
      files: {
        relativeTo: path.join(__dirname, "../../public"),
      },
    },
  });

  lodashForeach(routes, (value: any, key: any) => {
    serverRoutes.push(
      ...value.map((route: any) => {
        route.path = "/api" + route.path;
        return route;
      })
    );
  });

  server.register(jwt);
  server.register(Inert);
  server.register({
    plugin: require("hapi-cors"),
    options: {
      origins: ["http://localhost:3000", "https://scraping.apsyadira.com/"],
    },
  });

  server.auth.strategy("jwt", "jwt", {
    key: "1q@w3e4r5t6y",
    validate: checkJwt,
    verifyOptions: { algorithms: ["HS256"] },
  });

  // server.auth.default("jwt");

  server.route({
    method: "GET",
    path: "/public/{path*}",
    handler: {
      directory: {
        path: path.join(__dirname, "../../public"),
        index: true,
        listing: true,
      },
    },
  });
  server.route(serverRoutes);
  return server;
};

export const startServer = async (): Promise<void> => {
  try {
    const server: Server = await serverInit();
    server.start();
    server.events.on("response", function (request: any) {
      logger.info(
        `${chalk.cyan(
          `[${request.info.remoteAddress}]`
        )}: ${request.method.toUpperCase()} ${request.path} ${chalk.cyan(
          request.response.statusCode
        )}`
      );
    });
    console.info(chalk.white(`Server running at: ${server.info.uri} 🚀`));
    // DB Connection
    connection();
  } catch (e) {
    logger.error(e.message);
  }
};
