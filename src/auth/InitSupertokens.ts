import SuperTokens from "supertokens-node";
import { recipes } from "./recipes.js";

export const InitSupertokens = () => {
  const coreURI = process.env.SUPERTOKENS_CORE_URI ?? "http://localhost:3567";
  
  SuperTokens.init({
    framework: "fastify",
    supertokens: {
      connectionURI: coreURI, // your self-hosted Core
      //apiKey: undefined // if Core is configured with an API key provide value
    },
    appInfo: {
      appName: "riski-ilmo-backend",
      apiDomain: "http://localhost:3000",
      websiteDomain: "http://localhost:5173",
      apiBasePath: "/auth",
      websiteBasePath: "/"
    },
    recipeList: recipes
  });
}
