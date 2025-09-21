
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";

export const recipes = [
  EmailPassword.init({
    signUpFeature: {
      formFields: [
        {
          id: "email", // still called "email" internally
          validate: async (value) => {
            if (typeof value !== "string") {
              return "Please provide a valid username";
            }
            if (value.length < 3) {
              return "Username must be at least 3 characters long";
            }
            // Add more username rules here
            return undefined; // no error
          }
        },
        {
          id: "password"
        }
      ]
    }
  }),
  Session.init()
];