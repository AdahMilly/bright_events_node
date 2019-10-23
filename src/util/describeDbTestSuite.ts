import Knex, { Config } from 'knex';
import { getConfig, AppConfig } from '../config/config';
import { knexInstance } from '../database/knexInstance';

/* tslint:disable-next-line */
const knexCleaner = require('knex-cleaner');
/* tslint:disable-next-line */
const configs = require('../database/knexfile');

const envConfig: AppConfig = getConfig();

if (envConfig.env !== 'test' || envConfig.db.testDbName !== 'bright-events-test') {
    throw Error('Not in test environment');
}

const config: Config = configs[envConfig.env];

// const knexCleanerOptions = {
    // ignoreTables: [
        // 'knex_migrations',
        // 'knex_migrations_lock',
    // ],
// };

export function describeDbTestSuite(name: string, func: (knex: Knex) => void): void {
    describe(name, () => {
        beforeAll(async () => {
            await knexInstance.migrate.rollback(config.migrations, true);
            await knexInstance.migrate.latest(config.migrations);
        });

        beforeEach(async () => {
            // We need to rollback fully, if you terminate tests
            // prematurely you might have stuff left in the DB.
            await knexInstance.migrate.rollback(config.migrations, true);
            await knexInstance.migrate.latest(config.migrations);
        });

        afterEach(async () => {
            await knexInstance.migrate.rollback(config.migrations, true);
        });

        afterAll(async () => {
            await knexInstance.migrate.rollback(config.migrations, true);
        });

        func(knexInstance);
    });
}