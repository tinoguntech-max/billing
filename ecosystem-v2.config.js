module.exports = {
  apps: [
    {
      name: 'billing-frontend-v2',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: './logs/frontend-v2-err.log',
      out_file: './logs/frontend-v2-out.log',
      time: true
    },
    {
      name: 'billing-backend-v2',
      script: './billing-express/backend/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5005
      },
      error_file: './logs/backend-v2-err.log',
      out_file: './logs/backend-v2-out.log',
      time: true
    }
  ]
}
