module.exports = {
  apps: [
    {
      name: 'billing-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://localhost:5001'
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      time: true
    },
    {
      name: 'billing-backend',
      script: './billing-express/backend/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        FONNTE_TOKEN: 'cu9f5cxAcqci6czQfFQT'
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      time: true
    }
  ]
}
