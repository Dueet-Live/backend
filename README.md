# Dueet-Live Backend

<p align="center">
  <img src="/docs/logo.jpg" alt="Dueet Live Logo"/
</p>

The backend of Dueet-Live!

## Development Setup

### Install dependencies

```bash
npm install
```

### Start Postgres server

Start the Postgres server and create a database called `dueet-live` (or any name you like).

Sample SQL command:

```sql
CREATE DATABASE "dueet-live";
```

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
npm run build
npm run seed
```

### Build and run the project

Run the following 3 commands in 3 different terminal windows.

```bash
npm run watch:build
npm run watch:rest
npm run watch:ws
```

This will let `nodemon` observe file changes and automatically recompile the server as you modify the files.

### Manipulating the database

To drop the database, run

```bash
npm run db:drop
```

To synchronise the database schema with the entities in the source code, run

```bash
npm run db:sync
```

Remember to re-seed after you re-create the database.

To drop, sync, and then reseed the database, run

```bash
npm run reseed
```

You might also be interested in other `npm` scripts. Take a look at `package.json`.

### Caveats

The database schema is set to automatically update whenever the entities change.
When this happens, all the pre-existing data is lost.
