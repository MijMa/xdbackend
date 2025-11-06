// auth/recipes.ts (backend)
import Session from "supertokens-node/recipe/session";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import EmailPassword from "supertokens-node/recipe/emailpassword";

export const recipes = [
  Session.init(),
  UserMetadata.init(),
  EmailPassword.init({
    signUpFeature: {
      formFields: [
        // {
        //   id: "emailAddress", // still called "email" internally
        //   validate: async (value) => {
        //     if (typeof value !== "string") {
        //       return "Please provide a valid username";
        //     }
        //     if (value.length < 3) {
        //       return "Username must be at least 3 characters long";
        //     }
        //     if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        //       return "Username can only contain letters, numbers, and underscores";
        //     }
        //     return undefined; //Means it's valid
        //   }
        // },
        {
          id: "email",
          optional: true,
          validate: async (value) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return "Invalid email";
            }
            return undefined;
          },
        },
        {
          id: "password",
          validate: async (value) => {
            if (value.length < 8) {
              return "Password must be at least 8 characters long";
            }
            if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
              return "Password must contain at least one uppercase letter and one number";
            }
            return undefined;
          }
        },
      ]
    },

  //This override makes it so signing up(adding a user) in actual application logic
  // does not make the user automatically sign in, enabling the admin to create many users
  // during one session without being disrupted
  override: {
    functions: (originalImplementation) => {
      return {
        ...originalImplementation,
        signUp: async (input) => {
          // Call the original signUp logic
          const response = await originalImplementation.signUp(input);

          if (response.status === "OK") {
            // Return only the user, no session, user cannot login right after signup
            return {
              status: "OK",
              user: response.user,
              recipeUserId: response.recipeUserId,
              // session: response.session  // keep it
            };
          }
          return response;
        },
      };
    },
    apis: (originalImplementation) => {
      return {
        ...originalImplementation,
        signUpPOST: undefined,
      }
    },
  },

    // override: {
    //   functions: (original) => ({
    //     ...original,
    //     signUp: async (input) => {
    //       // Username (stored in SuperTokens' "email" column)
    //       const username = input.email;

    //       // Actual email address from your custom field
    //       const extraFields = (input.userContext)._default?.formFields ?? [];
    //       const realEmail = extraFields.find((f: any) => f.id === "emailAddress")?.value;

    //       const response = await original.signUp(input);

    //       if (response.status === "OK" && realEmail) {
    //         const userId = response.user.id;

    //         // Store the real email somewhere — either in your DB or SuperTokens metadata
    //         // Example with metadata recipe:
    //         await UserMetadata.updateUserMetadata(userId, { emailAddress: realEmail });
    //         console.log(`User ${userId} signed up with username: ${username}, email: ${realEmail}`);
    //       }

    //       return response;
    //     }
    //   })
    // }
  }),

];
