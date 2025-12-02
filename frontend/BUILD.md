# Guide de Build pour Windows

Ce guide explique comment construire l'application Instant Chat pour Windows.

## Prérequis

1. Node.js (version 18 ou supérieure)
2. npm ou yarn
3. Windows 10/11 (pour build Windows)

## Installation des dépendances

```bash
npm install
```

## Développement avec Electron

Pour lancer l'application en mode développement avec Electron :

```bash
npm run electron:dev
```

Cela lancera Next.js en mode dev et Electron simultanément.

## Build pour Windows

### Build complet (Installer + Portable)

```bash
npm run build:win
```

Cela créera :
- Un installateur NSIS dans `dist/Instant Chat-{version}-x64.exe`
- Une version portable dans `dist/Instant Chat-{version}-portable.exe`

### Build portable uniquement

```bash
npm run build:win:portable
```

### Build avec toutes les options

```bash
npm run dist
```

## Fichiers générés

Après le build, les fichiers seront dans le dossier `dist/` :

- `Instant Chat-{version}-x64.exe` - Installateur 64-bit
- `Instant Chat-{version}-ia32.exe` - Installateur 32-bit (si configuré)
- `Instant Chat-{version}-portable.exe` - Version portable (pas d'installation)

## Configuration

### Icône de l'application

Placez votre fichier `icon.ico` dans le dossier `build/`. L'icône doit être au format ICO avec plusieurs tailles (256x256, 128x128, 64x64, 48x48, 32x32, 16x16).

Vous pouvez créer une icône à partir d'une image PNG en utilisant :
- Outils en ligne : https://convertio.co/png-ico/
- ImageMagick : `magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`

### Personnalisation

Modifiez `electron-builder.json` pour personnaliser :
- Nom de l'application
- ID de l'application
- Options d'installation
- Et plus...

## Dépannage

### Erreur "Port already in use"

Si le port 3000 est déjà utilisé, l'application essaiera automatiquement le port suivant.

### Build échoue

1. Vérifiez que toutes les dépendances sont installées : `npm install`
2. Vérifiez que Next.js build fonctionne : `npm run build`
3. Vérifiez que l'icône existe : `build/icon.ico`

### L'application ne se lance pas

1. Vérifiez les logs dans la console
2. Essayez de lancer en mode dev : `npm run electron:dev`
3. Vérifiez que le dossier `out/` existe après le build Next.js


