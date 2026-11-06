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
cp apps/web/.env.example apps/web/.env.local
```

Set the same `API_KEY` value in both copied files, for example one generated with `openssl rand -hex 32`.

```sh
npm run dev   # starts both: Functions host on http://localhost:7071, Vite on http://localhost:5173
```

`npm run dev` runs the API and the web app together with labelled output, and stops both if either exits. To run one on its own, use `npm run dev:api` or `npm run dev:web`.

The web app is server-rendered with TanStack Start. Its server fetches the product from the Functions API with the API key and sends ready HTML, together with the data, to the browser. Later requests from the browser, such as switching colour, go to the web app's own server, never straight to the API, so the key stays on the server and no CORS setup is needed.

To check that the API is running: `curl http://localhost:7071/api/health`
