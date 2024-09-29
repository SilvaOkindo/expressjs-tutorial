export const createUserValidationSchema = {
    username: {
      isLength: {
        options: { min: 5, max: 32 },
        errorMessage: "Username must be at least 5 characters with a max of 32 characters",
      },
      notEmpty: {
        errorMessage: "Username cannot be empty",
      },
      isString: {
        errorMessage: "Username must be a string",
      },
    },
    age: {
      notEmpty: {
        errorMessage: "Age cannot be empty",
      },
      isInt: {
        options: { min: 0 },  // Ensure age is a non-negative integer
        errorMessage: "Age must be a non-negative integer",
      },
    },
  };