module.exports = {
  apps: [{
    name: 'chat-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork', // Utiliser 'fork' au lieu de 'cluster' pour éviter les erreurs
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Options pour éviter les erreurs
    kill_timeout: 5000,
    wait_ready: false,
    listen_timeout: 10000
  }]
};

