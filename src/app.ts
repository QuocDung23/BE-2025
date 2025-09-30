import "reflect-metadata";
import {connectionDB} from "./configs/database.connection"

import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import passport from "./configs/passport";
import { authRouter } from "./modules/auth/auth.router";
import cookieParser from "cookie-parser";

import { openAPIRouter } from "./swagger";
import { Modules } from "./modules";
import { appEnv } from "./configs";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());


app.use("/health-check", Modules.healthCheckRouter);
app.use("/auth", Modules.authRouter);
app.use("/auth", authRouter);
app.use(openAPIRouter);
connectionDB();

app.listen(appEnv.PORT, () => {
  const { NODE_ENV, HOST, PORT } = appEnv;
  console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});