import joi from '@hapi/joi';
import dotenv from 'dotenv';

dotenv.config();

const envVarsSchema = joi
.object({
  NODE_ENV: joi
    .string()
    .allow(['development', 'production', 'test', 'staging'])
    .required(),
  PORT: joi.number().default(8080),
  DATABASE: joi.string().required(),
  TEST_DB: joi.string().default('events_test_db'),
  DATABASE_DIALECT: joi.string().default('postgres'),
  DATABASE_PASSWORD: joi.string().default(null),
  DATABASE_USER: joi.string().required(),
  DATABASE_URL: joi.string().default(null),
  HOST: joi.string().required(),
})
.unknown()
.required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV || 'development',
  port: envVars.PORT,
  dbName: envVars.DATABASE,
  testDbName: envVars.TEST_DB,
  dbUsername: envVars.DATABASE_USER,
  dbDialect: envVars.DATABASE_DIALECT,
  dbPassword: envVars.DATABASE_PASSWORD,
  databaseUrl: envVars.DATABASE_URL,
  host: envVars.HOST,
};

export default config;