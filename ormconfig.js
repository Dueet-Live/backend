/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  type: 'postgres',
  url: process.env.DB_URL,
  synchronize: !isProd,
  logging: true,
  entities: ['dist/resources/entity/**/*.js'],
  migrations: ['dist/db/migrations/**/*.js'],
};
