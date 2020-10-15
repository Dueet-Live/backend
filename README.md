# Dueet-Live Backend

The backend of Dueet-Live!

## Developement Setup

### Clone the repository

```bash
git clone git@github.com:Dueet-Live/backend.git
```

### Install dependencies

```bash
cd backend
npm install
```

### Start Postgres server

Start the Postgres server and create a database called `dueet-live` (or any name you like).

### Configure the environment variables

First, create a `.env` file from the template.

```bash
cp .env.example .env
```

Then, modify `.env` to change the configuration options. In particular, you might need to change the database URL.
Remember to use the database name that you created in the previous step.

### Seed the database

Seed the database with initial songs and genres by running

```bash
npm run seed
```

### Build and run the project

```bash
npm run dev
```

This will let `nodemon` observe file changes and automatically recompile the server as you modify the files (live reload).

You might also be interested in other `npm` scripts. Take a look at `package.json`.

### (Optional) Manipulating the database

To drop the database, run

```bash
npx typeorm schema:drop
```

To synchronise the database schema with the entities in the source code, run

```bash
npx typeorm schema:sync
```

Remember to re-seed after you re-create the database.

### Caveats

The database schema is set to automatically update whenever the entities change.
When this happens, all the pre-existing data is lost.
