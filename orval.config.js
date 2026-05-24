module.exports = {
  schoolERP: {
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/schoolERP.ts',
      schemas: 'src/api/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/services/api/axiosInstance.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: 'https://schoolmanagement.mahispark.com/swagger/v1/swagger.json',
    },
  },
};
