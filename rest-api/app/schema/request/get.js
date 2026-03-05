exports.getSchema = {
  type: 'object',
  required: [
    'params',
  ],
  properties: {
    body: {},
    params: {},
    query: {
      type: 'object',
      properties: {
        pageNumber: {
          type: 'string',
          pattern: '^[1-9][0-9]*$',
          errorMessage: 'pageNumber should be an integer bigger than zero',
        },
      },
      additionalProperties: false,
    },
  },
};
