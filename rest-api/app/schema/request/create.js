exports.createSchema = {
  type: 'object',
  required: [
    'body',
  ],
  properties: {
    body: {
      type: 'object',
      required: [
        'content',
        'subject',
       
      ],
      properties: {
        content: {
          type: 'string',
          minLength: 1,
          maxLength: 1000,
          errorMessage: 'Invalid content',
        },
        subject: {
          type: 'string',
          minLength: 1,
          maxLength: 250,
          errorMessage: 'Invalid subject',
        },
       
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          content: 'content is required',
          subject: 'subject is required',
        
        },
        additionalProperties: 'only content, subject are allowed',
      },
    },
    query: {},
    params: {},
  },
};
