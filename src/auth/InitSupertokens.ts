import supertokens from "supertokens-node";
import { recipes } from "./recipes.js";

export const InitSupertokens = () => {
  supertokens.init({
    framework: "fastify",
    supertokens: {
      connectionURI: "http://localhost:3567", // your self-hosted Core
      apiKey: undefined // if Core is configured with an API key provide value
    },
    appInfo: {
      appName: "xdbackend",
      apiDomain: "http://localhost:3000",
      websiteDomain: "http://localhost:5173",
      apiBasePath: "/auth",
      websiteBasePath: "/"
    },
    recipeList: recipes
  });
}
