# Marimekko preassignment

A mobile product page with a "Notify me when back in stock" feature. The product is sold out in every size, so the customer picks a size, leaves an email, and the subscription is saved in Azure Table Storage through an Azure Functions API.

## Tech

- **Web app:** React 19, TanStack Start, TanStack Query, Tailwind CSS, TypeScript
- **API:** Azure Functions (Node.js), TypeScript, Azure Table Storage, Azurite locally
- **Monorepo:** npm workspaces
- **Tools:** Biome for linting and formatting, Vitest, strict TypeScript (just for the sake of it)

## Project structure

```text
apps/
  web/        Server-rendered React app
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

Azurite is installed with the project dependencies.

### Install and run

```sh
npm ci
cp apps/api/local.settings.example.json apps/api/local.settings.json
cp apps/web/.env.example apps/web/.env.local
```

Set the same `API_KEY` value in both copied files.

```sh
npm run dev   # starts Azurite, the API on http://localhost:7071 and the web app on http://localhost:5173
npm test      # API unit tests
```

Open <http://localhost:5173>. The product is sold out in every size. The light blue colour has sizes 36 and 38 in stock, to show the other case. Delete `.azurite/` to empty the subscriptions table.

## Design decisions and trade-offs

- **Server rendering.** The web app's server fetches the product, so the page arrives ready and an unknown product gets a real 404. The browser only talks to the web app's server, never to the API. The trade-off is running a Node server instead of serving static files.
- **API key.** Not asked for, and not user authentication: Function endpoints are public, so a shared secret keeps the API for the web app's server. The key never reaches the browser.
- **Duplicates.** Each subscription is one row keyed by product + size and email. Saving the same one again returns "already subscribed" instead of adding a row. Grouping by product + size also means everyone waiting for a size can be read in one go.
- **Validation.** Unknown SKU is a 404, invalid email or unknown size a 400. I also reject sizes that are in stock, since that alert would never fire.
- **Size picker.** A slide-up sheet instead of a dropdown, so every size and its stock is visible at once. More code than a `<select>`.
- **Second colour.** It's there to show colour switching and in-stock sizes. Its image is the original with the hue shifted. Just something I wanted to add.
- **Caching.** Products are cached for 60 seconds. Fine for name and price, but stock changes faster.
- **Privacy.** Emails are never written to logs.

## What I skipped

- Sending emails, confirming the address and unsubscribing
- Frontend tests
- Deployment and Infrastructure as Code (I picked unit tests as the optional extra)
- Rate limiting on subscribing
- CI pipelines and workflows
- Skills / agentic development setup

## What I'd do next

- Send the notifications: the inventory system publishes stock changes (for example to Azure Service Bus), and a function picks up sizes coming back in stock and queues an email for everyone in that size's partition.
- Double opt-in, unsubscribe links and deleting old subscriptions
- Serve stock separately from product content, so stock can stay fresh while content is cached
- Infrastructure as Code, managed identity instead of connection strings, and CI
- Component and end-to-end tests
