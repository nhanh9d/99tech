# 99tech Technical Assessment

This repository contains solutions for the 99tech technical assessment problems, implemented in TypeScript with a focus on code quality, testing, and documentation.

## Project Structure

```
99tech/
├── src/
│   ├── problem4/      # Sum to N implementations (3 algorithms)
│   ├── problem5/      # Express.js CRUD API (full implementation)
│   └── problem6/      # Scoreboard specification (documentation only)
│       ├── README.md              # API specification
│       ├── flow-diagram.md        # System diagrams
│       ├── implementation-guide.md # Developer guide
│       └── examples/              # Reference code (not executable)
├── tests/             # Test files for problems 4 & 5
├── data/              # SQLite database files (for problem 5)
└── dist/              # Compiled JavaScript (generated)
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nhanh9d/99tech.git
cd 99tech
```

2. Install dependencies:
```bash
npm install
```

3. Create data directory for SQLite:
```bash
mkdir -p data
```

## Running the Solutions

### Problem 4: Sum to N

Three unique implementations of a function that calculates the sum from 1 to n.

```bash
# Run demo
npm run start:problem4

# Run tests
npm run test:problem4
```

### Problem 5: Express.js CRUD API

A complete backend server with CRUD operations for resource management.

```bash
# Start the server
npm run start:problem5

# Run tests
npm run test:problem5
```

The API will be available at `http://localhost:3000`. See [src/problem5/README.md](src/problem5/README.md) for detailed API documentation.

### Problem 6: Real-time Scoreboard Specification

A comprehensive specification document for a real-time scoreboard system (documentation only - no implementation required).

View the deliverables:
- [API Specification](src/problem6/README.md) - Complete REST API and WebSocket documentation
- [Flow Diagrams](src/problem6/flow-diagram.md) - System architecture and execution flow diagrams
- [Implementation Guide](src/problem6/implementation-guide.md) - Step-by-step guide for engineering teams
- [Example Code](src/problem6/examples/) - Reference implementations (not executable)

## Development Commands

```bash
# Run all tests
npm test

# Run specific problem tests
npm run test:problem4
npm run test:problem5

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Build TypeScript
npm run build

# Development mode with auto-reload
npm run dev

# Clean build artifacts
npm run clean
```

## Code Quality

This project maintains high code quality standards:
- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for consistent formatting
- **Jest** for comprehensive testing
- **Pre-commit hooks** for quality checks

## Problem Descriptions

### Problem 4: Sum to N
Implement three different solutions to calculate the sum from 1 to n:
- Mathematical formula (O(1))
- Iterative approach (O(n))
- Recursive approach (O(n))

### Problem 5: CRUD API Service
Build a RESTful API with:
- Complete CRUD operations
- SQLite database integration
- Input validation
- Error handling
- Comprehensive tests

### Problem 6: Scoreboard System Design
Create specification documentation for a real-time scoreboard system including:
- Complete API specification with endpoints and WebSocket events
- System architecture and flow diagrams
- Security considerations and anti-cheating measures
- Implementation guide for backend engineering team
- Example code snippets (for reference only)

## Testing

The project includes comprehensive tests for all implementations:

```bash
# Run all tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/problem4/index.test.ts
```

## Architecture Decisions

1. **TypeScript**: Chosen for type safety and better developer experience
2. **Express.js**: Lightweight and flexible web framework for Problem 5
3. **SQLite**: Simple, file-based database perfect for the CRUD demo
4. **Jest**: Popular testing framework with great TypeScript support
5. **Socket.io**: Recommended for real-time features in Problem 6

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Run `npm run lint` and `npm run typecheck` before committing

## License

ISC