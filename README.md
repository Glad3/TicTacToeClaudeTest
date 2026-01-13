# Tic Tac Toe

A full-stack Tic Tac Toe game with a PHP backend and React/TypeScript frontend.

## Prerequisites

- PHP 8.0 or higher
- Composer
- Node.js 18+ and npm

## Windows PHP Installation Guide

### Option 1: Using XAMPP (Recommended for beginners)

1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Run the installer and select PHP (Apache and MySQL are optional for this project)
3. Add PHP to your PATH:
   - Open System Properties → Environment Variables
   - Under "System variables", find `Path` and click Edit
   - Add `C:\xampp\php` (or your XAMPP installation path)
4. Open a new terminal and verify: `php -v`

### Option 2: Standalone PHP Installation

1. Download PHP from [https://windows.php.net/download/](https://windows.php.net/download/)
   - Choose the **VS16 x64 Thread Safe** zip file for PHP 8.x
2. Extract to `C:\php` (or your preferred location)
3. Copy `php.ini-development` to `php.ini`
4. Edit `php.ini` and enable required extensions:
   ```ini
   extension_dir = "ext"
   extension=curl
   extension=mbstring
   extension=openssl
   ```
5. Add PHP to your PATH:
   - Open System Properties → Environment Variables
   - Under "System variables", find `Path` and click Edit
   - Add `C:\php`
6. Open a new terminal and verify: `php -v`

### Installing Composer

1. Download the Composer installer from [https://getcomposer.org/download/](https://getcomposer.org/download/)
2. Run `Composer-Setup.exe`
3. The installer will detect your PHP installation automatically
4. Verify installation: `composer -V`

### Verify Your Setup

```bash
php -v          # Should show PHP 8.x
composer -V     # Should show Composer version
node -v         # Should show Node.js 18+
npm -v          # Should show npm version
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
composer install
php -S localhost:8000 -t public
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## How to Play

1. Open `http://localhost:3000` in your browser
2. Player X goes first - click any cell to make a move
3. Players alternate turns (X, O, X, O...)
4. First player to get 3 in a row (horizontal, vertical, or diagonal) wins
5. If all 9 cells are filled with no winner, it's a draw
6. Click "Reset Game" or "Play Again" to start a new game

## Project Structure

```
TicTacToeClaudeTest/
├── backend/                  # PHP Backend
│   ├── composer.json
│   ├── public/
│   │   └── index.php         # API entry point
│   ├── src/
│   │   ├── Api/
│   │   │   └── routes.php    # API routes
│   │   ├── Game/
│   │   │   ├── Board.php
│   │   │   ├── Player.php
│   │   │   └── GameController.php
│   │   └── Utils/
│   │       └── helpers.php
│   └── tests/
│
├── frontend/                 # React + TypeScript Frontend
│   ├── package.json
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API client
│   │   ├── styles/           # CSS files
│   │   └── types/            # TypeScript types
│   └── index.html
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/game` | Get current game state |
| POST | `/api/game/move` | Make a move (body: `{"position": 0-8}`) |
| POST | `/api/game/reset` | Reset the game |

## Tech Stack

**Backend:**
- PHP 8.x
- Composer for dependency management

**Frontend:**
- React 18
- TypeScript
- Vite

## Development

### Run Tests (Backend)

```bash
cd backend
./vendor/bin/phpunit
```

### Build Frontend for Production

```bash
cd frontend
npm run build
```

### Type Check Frontend

```bash
cd frontend
npm run type-check
```

## Deployment to GitHub Pages

This project can be deployed to GitHub Pages for the **frontend only** (local game mode). The multiplayer features require a backend server and won't work on GitHub Pages.

### Automatic Deployment

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

**Setup Steps:**

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to the **Actions** tab in your repository
   - Wait for the "Deploy to GitHub Pages" workflow to complete (usually 1-2 minutes)

4. **Access your game:**
   - Your game will be available at: `https://YOUR_USERNAME.github.io/TicTacToeClaudeTest/`
   - Or check the URL in Settings → Pages

### Manual Deployment

To deploy manually:

```bash
cd frontend
npm install
npm run build

# The build output will be in frontend/dist/
# Upload the contents of frontend/dist/ to GitHub Pages
```

### Important Notes

- **Only local game mode works on GitHub Pages** (single-player)
- **Multiplayer features require a PHP backend server** which GitHub Pages doesn't support
- For full multiplayer functionality, consider deploying to:
  - **Heroku** (with PHP buildpack)
  - **Railway.app**
  - **DigitalOcean App Platform**
  - **AWS EC2** or **AWS Elastic Beanstalk**
  - Any **VPS with PHP support**

### Alternative: Full Deployment Options

**Option 1: Deploy backend to a hosting service**
- Deploy backend PHP to a service like Railway, Heroku, or a VPS
- Update `frontend/vite.config.ts` proxy to point to your backend URL
- Deploy frontend to GitHub Pages

**Option 2: Deploy everything together**
- Use a full-stack hosting service like Heroku, Railway, or DigitalOcean
- This gives you both local AND multiplayer functionality
