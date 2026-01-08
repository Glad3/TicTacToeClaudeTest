# CLAUDE.md - AI Assistant Guide for TicTacToeClaudeTest

## Project Overview

This is a Tic Tac Toe game implementation project. The repository is currently in its initial stages with minimal structure.

**Project Name:** TicTacToeClaudeTest
**Repository:** Glad3/TicTacToeClaudeTest
**Last Updated:** 2026-01-08

## Current Repository State

### Existing Files
- `README.md` - Project documentation header
- `.git/` - Git repository infrastructure

### Development Status
The project is in its **initial setup phase**. No game implementation currently exists.

## Expected Repository Structure

When fully implemented, the repository should follow this structure:

```
TicTacToeClaudeTest/
├── README.md                 # Project overview and usage instructions
├── CLAUDE.md                 # This file - AI assistant guidelines
├── src/                      # Source code directory
│   ├── game/                 # Game logic
│   │   ├── board.js/py/etc  # Board state management
│   │   ├── player.js/py/etc # Player logic
│   │   └── game.js/py/etc   # Main game controller
│   ├── ui/                   # User interface components
│   │   ├── cli.js/py/etc    # Command-line interface
│   │   └── web/             # Web interface (if applicable)
│   └── utils/                # Utility functions
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── docs/                     # Additional documentation
├── package.json              # Dependencies (if Node.js)
├── requirements.txt          # Dependencies (if Python)
└── .gitignore               # Git ignore rules
```

## Development Workflows

### Initial Setup
1. Determine technology stack (JavaScript, Python, etc.)
2. Create basic project structure
3. Implement core game logic
4. Add user interface
5. Write comprehensive tests
6. Document usage and API

### Feature Development Workflow
1. **Read existing code** before making changes
2. **Plan the implementation** - use TodoWrite for complex tasks
3. **Implement incrementally** - small, focused changes
4. **Test thoroughly** - add tests for new features
5. **Document changes** - update relevant docs
6. **Commit with clear messages** - follow commit conventions

### Testing Workflow
1. Write tests for new features
2. Run existing test suite
3. Fix any broken tests
4. Ensure 100% pass rate before committing

## Key Conventions

### Code Style

**General Principles:**
- Keep functions small and focused (single responsibility)
- Use clear, descriptive variable and function names
- Avoid deep nesting (max 3 levels preferred)
- Comment only when logic is non-obvious
- Prefer composition over inheritance

**Naming Conventions:**
- Functions/methods: `camelCase` (JS) or `snake_case` (Python)
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: prefix with `_` (Python) or use `#` (modern JS)

**Game-Specific Conventions:**
- Board positions: Use 0-indexed coordinates (row, col) or 0-8 for flat array
- Player markers: Use consistent symbols (X, O) or enums
- Game states: Use clear state enums (PLAYING, WON, DRAW)
- Win conditions: Check after each move, not continuously

### File Organization
- One class/module per file when possible
- Group related functionality together
- Keep test files parallel to source files
- Use index files for clean imports

### Error Handling
- Validate user input at boundaries
- Use exceptions for exceptional cases
- Return error objects/tuples for expected failures
- Provide clear error messages
- Don't catch exceptions you can't handle

## Git Workflow

### Branch Naming
- **Feature branches:** `claude/claude-md-<session-id>`
- **Working branches:** Always start with `claude/` prefix
- Current branch: `claude/claude-md-mk5qrnm1zq38ye6z-iUp9e`

### Commit Message Format
```
<type>: <subject>

<optional body>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks

**Examples:**
```
feat: implement board initialization logic

Add Board class with 3x3 grid initialization and
basic validation methods.

fix: correct win condition check for diagonals

The diagonal win detection was checking wrong indices.
Updated to properly check both diagonals.
```

### Commit Practices
- Commit frequently with logical units of work
- Keep commits focused on single concerns
- Write clear, descriptive commit messages
- Don't commit commented-out code
- Don't commit console.log/print statements for debugging

### Push Protocol
- Always use: `git push -u origin <branch-name>`
- Branch MUST start with `claude/` and match session ID
- Retry on network failures (up to 4 times with exponential backoff: 2s, 4s, 8s, 16s)
- Never force push without explicit permission

## AI Assistant Guidelines

### Before Making Changes

1. **Always read files before editing**
   - Never propose changes to unread code
   - Understand context and existing patterns
   - Check for similar existing implementations

2. **Understand the request fully**
   - Clarify ambiguous requirements
   - Ask about technology preferences if not specified
   - Confirm scope before large changes

3. **Plan complex tasks**
   - Use TodoWrite for multi-step tasks
   - Break down large features into smaller tasks
   - Track progress and mark tasks complete

### When Implementing Features

1. **Minimal, focused changes**
   - Only change what's necessary
   - Don't add unsolicited features
   - Don't refactor unrelated code
   - Avoid over-engineering

2. **Security considerations**
   - Validate all user input
   - Avoid injection vulnerabilities
   - Don't expose sensitive data
   - Follow OWASP guidelines

3. **Code quality**
   - Write self-documenting code
   - Add comments only for complex logic
   - Keep functions pure when possible
   - Avoid side effects

4. **Testing**
   - Write tests for new functionality
   - Ensure existing tests pass
   - Test edge cases and error conditions
   - Include both positive and negative test cases

### When Answering Questions

1. **Research first**
   - Read relevant source files
   - Understand the full context
   - Verify assumptions

2. **Provide complete answers**
   - Include file paths with line numbers (e.g., `src/game/board.js:42`)
   - Show relevant code snippets
   - Explain the "why" not just the "what"

### Tool Usage

1. **Use specialized tools**
   - `Read` for viewing files (not `cat`)
   - `Edit` for modifications (not `sed`)
   - `Write` for new files (not `echo >`)
   - `Grep` for searching code (not `grep` command)
   - `Glob` for finding files (not `find`)

2. **Parallel execution**
   - Run independent operations in parallel
   - Use sequential execution only when there are dependencies
   - Never use placeholders in tool parameters

3. **Task delegation**
   - Use Task tool with `subagent_type=Explore` for codebase exploration
   - Use Task tool for complex multi-step searches
   - Delegate when appropriate to reduce context usage

### Common Pitfalls to Avoid

❌ **Don't:**
- Create files unnecessarily (prefer editing existing ones)
- Add features not explicitly requested
- Write backwards-compatibility hacks for new code
- Leave commented-out code
- Add console.log/print statements in production code
- Make assumptions about technology stack without confirming
- Commit without testing
- Push to wrong branches

✅ **Do:**
- Read before editing
- Make minimal, focused changes
- Test thoroughly
- Write clear commit messages
- Ask for clarification when uncertain
- Use proper tools for each task
- Track progress with TodoWrite
- Follow existing code patterns

## Technology Stack

**Current:** Not yet determined

**Common Options for Tic Tac Toe:**
- **JavaScript/Node.js**: Good for web-based implementations
- **Python**: Excellent for CLI and learning projects
- **TypeScript**: Adds type safety to JavaScript
- **React**: For interactive web UI
- **HTML/CSS/Vanilla JS**: For simple web version

**Recommendation:** Confirm with user before implementing.

## Game Implementation Checklist

When implementing the Tic Tac Toe game, ensure these components:

### Core Game Logic
- [ ] Board representation (3x3 grid)
- [ ] Player turn management
- [ ] Move validation (check if cell is empty)
- [ ] Win condition detection (rows, columns, diagonals)
- [ ] Draw condition detection (board full, no winner)
- [ ] Game state management (playing, won, draw)

### User Interface
- [ ] Display current board state
- [ ] Accept player input
- [ ] Display game results
- [ ] Option to restart game
- [ ] Input validation and error messages

### Testing
- [ ] Test board initialization
- [ ] Test valid/invalid moves
- [ ] Test all win conditions
- [ ] Test draw condition
- [ ] Test game flow
- [ ] Test edge cases

### Documentation
- [ ] Update README with usage instructions
- [ ] Document game rules
- [ ] Provide examples
- [ ] Document API (if applicable)

## Quick Reference

### Essential Commands

```bash
# Check current status
git status

# View recent commits
git log --oneline -5

# Run tests (once implemented)
npm test          # Node.js
python -m pytest  # Python

# View file tree
ls -R src/
```

### File References
- Project docs: `README.md`
- This guide: `CLAUDE.md`
- Git status shows clean working tree as of 2026-01-08

### Current Branch
`claude/claude-md-mk5qrnm1zq38ye6z-iUp9e`

---

## Notes for Future Updates

When updating this document:
1. Keep it current with actual repository state
2. Add language-specific conventions once tech stack is chosen
3. Update file structure as project evolves
4. Document any custom scripts or tools
5. Add troubleshooting section if common issues arise
6. Include performance considerations if relevant

**Last Review:** 2026-01-08
**Status:** Initial creation - repository in setup phase
