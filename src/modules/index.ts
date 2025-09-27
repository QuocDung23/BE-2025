import {
    healthCheckRegistry,
    healthCheckRouter,
  } from "./healtCheck/healthCheck.router";
  import { authRouter, authRegistry } from "./auth/auth.router";

  export const Registries = [healthCheckRegistry, authRegistry];
  
  export const Modules = {
    healthCheckRouter,
    authRouter
  };