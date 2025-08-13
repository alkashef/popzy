# GitHub Copilot Instructions for Educational Game Project

## Project Context and Goals

This repository is for an **educational 2D browser game** aimed at kindergarten and primary school kids, focusing on math and language arts skills. It is built with **HTML5, CSS3, and vanilla JavaScript** (no frameworks or heavy libraries). The primary goals are to keep the code **maintainable, modular, and well-documented**, ensuring the project remains easy to understand and extend over time.

**Key Objectives:** The codebase should be clean, simple, and **easy to maintain**. We prioritize code quality and clarity over quick hacks or shortcuts (thoughtfulness over speed). All development should adhere to industry-standard best practices for HTML, CSS, and JavaScript.

## Guiding Principles

- **Maintainability & Clarity:** Write code that is **self-explanatory, readable, and easy to modify**. Future contributors (or your future self) should quickly grasp what the code does and why. Favor clarity over cleverness in implementations.
- **Consistency in Style:** Follow a consistent coding style across the entire project. Adhere to a well-known JavaScript style guide (e.g., Airbnb or Google) or a customized set of conventions. Use consistent naming conventions (camelCase for variables/functions, PascalCase for classes) and formatting rules. Consider using linters (like **ESLint**) and formatters (like **Prettier**).
- **Single Responsibility & Modular Design:** Ensure every module, class, and function has **one focused purpose**. Avoid “god functions” or catch-all classes. Break the game’s functionality into modular pieces – for example, separate modules for game logic, rendering/animation, user input, math quiz generation, language quiz generation, etc.
- **DRY – No Redundant Code:** **Avoid code duplication**. If you find similar code in multiple places, refactor by extracting a common function or module. 
- **Small, Focused Functions & Files:** Do not let any single function or file grow too large. **Long functions** (generally, anything longer than ~10-15 lines) should be split into smaller helper functions. Likewise, break up large files.
- **Thoughtfulness Over Speed:** Favor readability and maintainability over speed.

## Coding Best Practices

### JavaScript
- Use modern ES6+ syntax: `const`/`let`, arrow functions, template literals.
- Avoid global variables; use modules.
- Use descriptive names.
- Keep functions small and focused.
- Separate concerns (logic, DOM manipulation, styling).
- Avoid deeply nested loops/conditionals.
- Handle errors gracefully.
- Use `requestAnimationFrame` for game loops.

### HTML & CSS
- Use semantic HTML.
- Keep HTML structure separate from styling (CSS) and behavior (JS).
- Organize CSS modularly.
- Use simple class names; avoid excessive specificity.
- Ensure responsive design for various devices.

## Documentation
- Use **JSDoc-style comments** for all functions/classes.
- Maintain an up-to-date **README** with:
  - Overview
  - Installation/Usage
  - Architecture & structure
  - Contribution guide
  - License/credits
- Delete unused code/files.

## Testing
- Write tests for new features (unit tests for logic, simple browser tests for UI).
- Cover edge cases.
- Maintain tests alongside production code.
- Run all tests before merging changes.

## Continuous Refactoring
- Regularly review and refactor code.
- Remove duplicate code.
- Keep methods and classes small.
- Avoid dead code.
- Keep modules loosely coupled.
- Optimize for clarity first, then performance if needed.
