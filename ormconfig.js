/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  type: 'postgres',
  url: process.env.DB_URL,
  synchronize: false,
  logging: true,
  entities: ['dist/db/entities/**/*.js'],
  migrations: ['dist/db/migrations/**/*.js'],
  cli: {
    migrationsDir: 'src/db/migrations/',
  },
};
