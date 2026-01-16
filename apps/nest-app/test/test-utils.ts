import { DataSource } from 'typeorm';

export async function resetDatabase(dataSource: DataSource) {
  if (dataSource.isInitialized) {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  }
}
