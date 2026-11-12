# Nexus Web

Plataforma web de Nexus (no es una landing). **React 19 + TypeScript + Vite**, con React Router.
Por ahora incluye solo el **inicio de sesión** (no hay registro: las cuentas se crean desde la app móvil).

## Arrancar

```bash
npm install
cp .env.example .env      # define VITE_API_URL
npm run dev               # http://localhost:5173
```

Sin `VITE_API_URL`, `npm run dev` usa un **login de demostración**: `demo@nexus.app` / `nexus123`.
`npm run build` sin la variable genera una app que falla al arrancar (a propósito: nunca cae al modo demo en producción).

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas una vez (Vitest + Testing Library) |
| `npm run test:watch` | Pruebas en modo TDD |
| `npm run test:coverage` | Cobertura |
| `npm run typecheck` | TypeScript estricto |
| `npm run build` | Typecheck + build de producción en `dist/` |

## Arquitectura: MVC + Repository

```
src/
├── main.tsx                  Punto de entrada: AuthProvider + BrowserRouter
├── app/                      Rutas y guardas (RequireAuth / PublicOnly), 404
├── core/
│   ├── config/env.ts         Variables VITE_*
│   ├── di/container.ts       Raíz de composición: elige implementaciones
│   ├── http/                 HttpClient (interfaz) + FetchHttpClient, HttpError, NetworkError
│   └── theme/                tokens.css (DESIGN.md como variables CSS) + global.css
├── shared/components/        EditorialLabel, Ledger/LedgerCell/LedgerInput, PrimaryButton, TextAction, Icon
├── features/<feature>/
│   ├── model/                M — Entidades, validación y errores de dominio (TS puro)
│   ├── repository/           M — Acceso a datos detrás de una interfaz
│   ├── controller/           C — Hooks/providers con estado y acciones
│   └── view/                 V — Componentes que solo pintan estado y disparan acciones (+ .module.css)
└── test/                     Setup, builders y fakes compartidos
```

Flujo del login:

```
LoginView ──acciones──▶ useLoginController ──signIn──▶ AuthController ──▶ AuthRepository (interfaz)
   ▲                         │ valida (model)                                ├─ HttpAuthRepository → HttpClient → API
   └──────── estado ─────────┘                                               └─ DemoAuthRepository (solo dev)
                                                                              ambos persisten en localStorage
```

Reglas:
- La **vista** no importa repositorios ni hace `fetch`. Recibe `state` y `actions`.
- El **controlador** depende de interfaces (`AuthRepository`), nunca de implementaciones.
- Solo `core/di/container.ts` conoce las clases concretas.
- Los repositorios traducen errores técnicos (HTTP, red) a `AuthError`; el modelo los convierte en mensajes en español de tú.

### Contrato de API esperado

| Petición | Respuesta |
|---|---|
| `POST /auth/login` `{ email, password }` | `200 { accessToken, refreshToken?, expiresAt?, user: { id, name, email, avatarUrl? } }` |
| `POST /auth/logout` (Bearer token) | `2xx` |

Errores: `400/401` → credenciales incorrectas · `403` → cuenta desactivada · `429` → demasiados intentos · otro → error genérico.
Si el backend real difiere, solo cambian `HttpAuthRepository` y `parseSession`.

## TDD con AAA

1. **Rojo:** escribe la prueba junto al archivo (`Foo.test.ts(x)`) y comprueba que falla.
2. **Verde:** implementa lo mínimo para que pase.
3. **Refactor** con las pruebas en verde.

Cada prueba separa `// Arrange`, `// Act`, `// Assert`. Por capa:
- `model/` → funciones puras.
- `repository/` → `FakeHttpClient` e `InMemorySessionStorage`.
- `controller/` → `renderHook` con `FakeAuthRepository`.
- `view/` y `app/` → `render` + `userEvent`, consultando por rol y etiqueta accesible.

## Diseño

Sigue el `DESIGN.md` de la app móvil: negro editorial, monocromo, secciones numeradas, fichas (`Ledger`) en vez de tarjetas, un solo botón principal blanco. Los tokens viven en `src/core/theme/tokens.css` con nombres equivalentes a Flutter (`AppColors.textPrimary` → `--app-text-primary`, `NexusTones.danger` → `--tone-danger`).
