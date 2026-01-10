# Tic Tac Toe

A full-stack Tic Tac Toe game with a PHP backend and React/TypeScript frontend.

## Prerequisites

- PHP 8.0 or higher
- Composer
- Node.js 18+ and npm

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
