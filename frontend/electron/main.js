const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
let nextServer = null;

const createWindow = () => {
  const iconPath = path.join(__dirname, '../build/icon.ico');
  const fs = require('fs');
  const iconExists = fs.existsSync(iconPath);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    ...(iconExists && { icon: iconPath }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide menu bar
  });

  // Remove menu bar completely
  mainWindow.setMenuBarVisibility(false);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the app
  if (isDev) {
    // In development, connect to Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    
    // Start Next.js dev server if not running
    startNextDevServer();
  } else {
    // In production, serve the static export or use a local server
    const port = 3000;
    startProductionServer(port).then(() => {
      mainWindow.loadURL(`http://localhost:${port}`);
    }).catch((err) => {
      console.error('Failed to start production server:', err);
      mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    });
  }
};

const startNextDevServer = () => {
  // Check if server is already running
  const http = require('http');
  const checkServer = () => {
    const req = http.get('http://localhost:3000', (res) => {
      // Server is running
      req.destroy();
    });
    req.on('error', () => {
      // Server not running, start it
      const nextPath = path.join(__dirname, '../node_modules/.bin/next');
      nextServer = spawn('node', [nextPath, 'dev'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        shell: true,
      });
    });
  };
  
  setTimeout(checkServer, 2000);
};

const startProductionServer = async (port) => {
  return new Promise((resolve, reject) => {
    try {
      let express;
      try {
        express = require('express');
      } catch (err) {
        // Express not available, use simple HTTP server
        const http = require('http');
        const fs = require('fs');
        const outPath = path.join(__dirname, '../out');
        
        const server = http.createServer((req, res) => {
          let filePath = path.join(outPath, req.url === '/' ? 'index.html' : req.url);
          
          // Check if file exists
          fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
              // File doesn't exist, serve index.html for SPA routing
              filePath = path.join(outPath, 'index.html');
            }
            
            const ext = path.extname(filePath).toLowerCase();
            const contentTypes = {
              '.html': 'text/html',
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon',
            };
            
            fs.readFile(filePath, (err, data) => {
              if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
              }
              
              res.writeHead(200, {
                'Content-Type': contentTypes[ext] || 'application/octet-stream',
              });
              res.end(data);
            });
          });
        });
        
        nextServer = server.listen(port, '127.0.0.1', () => {
          console.log(`Production server running on http://127.0.0.1:${port}`);
          resolve();
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            startProductionServer(nextPort).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
        return;
      }
      
      // Use Express if available
      const expressApp = express();
      const outPath = path.join(__dirname, '../out');
      
      // Serve static files
      expressApp.use(express.static(outPath, {
        maxAge: '1y',
        etag: false,
      }));
      
      // Handle Next.js routing - all routes serve index.html for client-side routing
      expressApp.get('*', (req, res) => {
        const filePath = path.join(outPath, req.path === '/' ? 'index.html' : `${req.path}/index.html`);
        const fallbackPath = path.join(outPath, 'index.html');
        
        // Try to serve the specific route, fallback to index.html
        res.sendFile(filePath, (err) => {
          if (err) {
            res.sendFile(fallbackPath);
          }
        });
      });
      
      nextServer = expressApp.listen(port, '127.0.0.1', () => {
        console.log(`Production server running on http://127.0.0.1:${port}`);
        resolve();
      });
      
      nextServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // Port already in use, try next port
          const nextPort = port + 1;
          startProductionServer(nextPort).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    if (nextServer.kill) {
      nextServer.kill();
    } else if (nextServer.close) {
      nextServer.close();
    }
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationURL);
  });
});

