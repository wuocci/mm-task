import { RestError, TableClient } from '@azure/data-tables';

export interface Subscription {
  sku: string;
  size: string;
  email: string;
}

export type SaveResult = 'created' | 'exists';
export type SaveSubscription = (subscription: Subscription) => Promise<SaveResult>;

const DEFAULT_TABLE_NAME = 'subscriptions';

let tableClient: Promise<TableClient> | undefined;

/**
 * Connects on first use and creates the table if it's missing (a no-op when it exists).
 * The connection string comes from settings: Azurite locally, the storage account in Azure.
 */
function getTable(): Promise<TableClient> {
  tableClient ??= (async () => {
    const connectionString = process.env.SUBSCRIPTIONS_STORAGE;
    if (!connectionString) throw new Error('SUBSCRIPTIONS_STORAGE is not configured.');
    const table = TableClient.fromConnectionString(
      connectionString,
      process.env.SUBSCRIPTIONS_TABLE ?? DEFAULT_TABLE_NAME,
    );
    await table.createTable();
    return table;
  })().catch((error: unknown) => {
    // Don't cache a failed connection: the next request tries again.
    tableClient = undefined;
    throw error;
  });
  return tableClient;
}

/** Keys can't contain / \ # ? or control characters; URL-encoding escapes all of them. */
const toKey = (value: string) => encodeURIComponent(value);

/**
 * One row per product, size and email. Partitioning by product and size means everyone to notify
 * when a size is restocked is a single-partition query. Inserting a row that already exists fails
 * with 409, which is what makes a repeat subscription a no-op instead of a duplicate.
 */
export const saveSubscription: SaveSubscription = async ({ sku, size, email }) => {
  const table = await getTable();
  try {
    await table.createEntity({
      partitionKey: `${toKey(sku)}_${toKey(size)}`,
      rowKey: toKey(email),
      sku,
      size,
      email,
      createdAt: new Date(),
    });
    return 'created';
  } catch (error) {
    if (error instanceof RestError && error.statusCode === 409) return 'exists';
    throw error;
  }
};
