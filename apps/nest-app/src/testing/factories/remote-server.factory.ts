import { RemoteServer } from '@/remote-servers';
import { faker } from '@faker-js/faker';
import { DataSource, DeepPartial } from 'typeorm';

export const createRemoteServer = (
  datasource: DataSource,
  overrides?: DeepPartial<RemoteServer>,
): Promise<RemoteServer> => {
  const repo = datasource.getRepository(RemoteServer);
  return repo.save({
    name: faker.internet.domainName(),
    config: { url: faker.internet.url() },
    ownerId: faker.string.uuid(),
    ...overrides,
  });
};
