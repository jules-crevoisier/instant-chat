# Configuration Nginx pour Socket.IO

## Problème

L'erreur 503 (Service Unavailable) sur Socket.IO en production est généralement due à une mauvaise configuration du reverse proxy (Nginx).

## Solution

### 1. Configuration Nginx pour Socket.IO

Ajoutez cette configuration dans votre fichier Nginx (généralement `/etc/nginx/sites-available/votre-site` ou `/etc/nginx/nginx.conf`) :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name chat.srko.fr;

    # Redirection HTTPS (recommandé)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name chat.srko.fr;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/chat.srko.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.srko.fr/privkey.pem;

    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Root directory (votre frontend)
    root /var/www/chat.srko.fr;
    index index.html;

    # Configuration Socket.IO (IMPORTANT !)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers pour WebSocket
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Headers standards
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts pour WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # API REST
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads (fichiers statiques)
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (fichiers statiques)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 2. Points importants pour Socket.IO

Les lignes critiques pour Socket.IO sont :

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Ces headers permettent à Socket.IO de passer du polling HTTP au WebSocket.

### 3. Vérification

Après avoir modifié la configuration Nginx :

```bash
# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Vérifier que le backend écoute

Sur votre VPS, vérifiez que le backend Node.js est bien démarré :

```bash
# Vérifier si le processus écoute sur le port 3000
sudo netstat -tlnp | grep 3000
# ou
sudo ss -tlnp | grep 3000
```

Vous devriez voir quelque chose comme :
```
tcp  0  0  0.0.0.0:3000  0.0.0.0:*  LISTEN  1234/node
```

### 5. Démarrer le backend en production

Utilisez PM2 pour gérer le processus Node.js :

```bash
# Installer PM2
npm install -g pm2

# Démarrer le serveur
cd /chemin/vers/backend
pm2 start server.js --name "chat-backend"

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

### 6. Logs de débogage

Pour déboguer les problèmes :

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs PM2
pm2 logs chat-backend

# Logs en temps réel
pm2 logs chat-backend --lines 100
```

## Problèmes courants

### Erreur 502 Bad Gateway
- Le backend Node.js n'est pas démarré
- Le backend n'écoute pas sur `0.0.0.0:3000`
- Solution : Vérifiez que le serveur est démarré avec PM2

### Erreur 503 Service Unavailable
- Nginx ne peut pas se connecter au backend
- Configuration Socket.IO incorrecte
- Solution : Vérifiez la configuration Nginx ci-dessus

### WebSocket ne fonctionne pas
- Headers `Upgrade` et `Connection` manquants dans Nginx
- Solution : Ajoutez les headers dans la section `/socket.io/`

### CORS errors
- Vérifiez que `CORS_ORIGIN` dans `.env` contient votre domaine
- Exemple : `CORS_ORIGIN=https://chat.srko.fr`

## Configuration complète avec variables d'environnement

Dans votre fichier `.env` sur le VPS :

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=votre_cle_secrete_tres_longue
CORS_ORIGIN=https://chat.srko.fr
HOST=0.0.0.0
```

## Test de connexion Socket.IO

Pour tester si Socket.IO fonctionne :

```bash
curl https://chat.srko.fr/socket.io/?EIO=4&transport=polling
```

Vous devriez recevoir une réponse JSON, pas une erreur 503.

