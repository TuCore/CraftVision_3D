module.exports = {
  'craftvision-frontend': {
    input: './openapi.yaml',
    output: {
      mode: 'tags-split',
      // Code sẽ được sinh tự động vào thư mục frontend
      target: '../frontend/src/api/generated/endpoints.ts',
      schemas: '../frontend/src/api/generated/models',
      // Dùng React Query là chuẩn mực hiện hành của Next.js/React
      client: 'react-query', 
      // Tự động sinh ra Data giả (MSW) cho Frontend test
      mock: true, 
      override: {
        mutator: {
          // File này có thể được tạo ở frontend để config chung header/token
          path: '../frontend/src/api/axios-instance.ts',
          name: 'customInstance'
        }
      }
    }
  }
};
