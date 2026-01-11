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
