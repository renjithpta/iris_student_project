const { roles } = require('../../../config');

exports.registerSchema = {
  type: 'object',
  required: [
    'body',
  ],
  properties: {
    body: {
      type: 'object',
      required: [
        'name',
        'username',
        'password',
        'userType',
      ],
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          errorMessage: 'Invalid Name',
        },
        username: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          errorMessage: 'Invalid userName',
        },
        password: {
          type: 'string',
          minLength: 4,
          maxLength: 50,
          errorMessage: 'Invalid password',
        },
        userType: {
          type: 'string',
          enum: Object.values(roles),
          errorMessage: 'Invalid userType',
        },
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          name: 'name is required',
          email: 'username is required',
          password: 'password is required',
          userType: 'userType is required',
        },
        additionalProperties: 'only name, email, password and userType are allowed',
      },
    },
    query: {},
    params: {},
  },
};
