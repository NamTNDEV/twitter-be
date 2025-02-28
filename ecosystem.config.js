module.exports = {
  apps: [
    {
      name: 'twitter-clone',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: ''
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_staging: {
        NODE_ENV: 'staging'
      }
    }
  ]
}
