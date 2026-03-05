exports.loginSchema = {
  type: 'object',
  required: [
    'body',
  ],
  properties: {
    body: {
      type: 'object',
      required: [
        'username',
        'password',
      ],
      properties: {
        username: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
          errorMessage: 'Invalid employee ID',
        },
        password: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
          errorMessage: 'Invalid password',
        },
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          username: 'employee is required',
          password: 'password is required',
        },
        additionalProperties: 'only employee and password are allowed',
      },
    },
    query: {},
    params: {},
  },
};
