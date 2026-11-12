# Nexus Web — guía para agentes

React 19 + TypeScript + Vite + React Router. Sin Expo ni React Native. Solo web.

- Arquitectura **MVC + Repository** por feature (`src/features/<feature>/{model,repository,controller,view}`). Ver README.md.
- **TDD obligatorio con AAA**: primero la prueba (rojo), luego el código (verde). Comentarios `// Arrange`, `// Act`, `// Assert`.
- Pruebas con Vitest (globals: `describe`, `it`, `vi`) + Testing Library. Consulta por rol/etiqueta, no por clase CSS.
- Estilos con CSS Modules y **solo** variables de `src/core/theme/tokens.css` (nada de hex en componentes). Color solo para estados.
- Textos en español de tú; etiquetas en versalitas; botones con verbo (DESIGN.md de la app móvil).
- Antes de terminar: `npm test` y `npm run typecheck`.
