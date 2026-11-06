# Marimekko preassignment

A mobile product page for an e-commerce site. A React app fetches product data from an API running on Azure Functions.

## Tech

- **Web app:** React 19, Vite, TypeScript
- **API:** Azure Functions (written in Node.js), TypeScript
- **Monorepo:** npm workspaces
- **Tools:** Biome for linting and formatting, strict TypeScript (just for the sake of it)

## Project structure

```
apps/
  web/        React app (builds with Vite)
  api/        Azure Functions app
packages/
  shared/     API contract types, imported by both apps
```

The API and the web app compile against the same types in `packages/shared`, so a change to the contract shows up as a type error on both sides.

## How to

### Prerequisites

- Node.js 24

`nvm use`
or install latest v24:
`nvm install 24`

- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local):

to install Azure Functions, run

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4
```

### Install and run

```sh
npm install
cp apps/api/local.settings.example.json apps/api/local.settings.json

npm run dev:api   # Functions host on http://localhost:7071
npm run dev:web   # Vite dev server on http://localhost:5173
```

In development, Vite proxies `/api/*` to the Functions host, so the web app uses relative URLs and needs no CORS setup.

To check that the API is running: `curl http://localhost:7071/api/health`
