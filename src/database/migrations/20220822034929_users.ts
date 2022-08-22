import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists('users', (table: Knex.TableBuilder) => {
    table.bigIncrements('userId').primary();
    table.string('email', 360).notNullable();
    table.string('password', 500).notNullable();
    table.string('name', 500).notNullable();
    table.string('mobileNumber', 15);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
