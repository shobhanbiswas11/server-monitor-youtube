---
name: nest-unit-test
description: Guidelines for writing unit tests in this NestJS project
---

# Unit Testing Skill for NestJS

## Stack

- **Test runner**: Vitest
- **Mocking**: `vitest-mock-extended` — `mock()` and `Mocked<T>` are **globals** (declared in `test.d.ts`, set up in `vitest.setup.ts`). Do **not** import them.
- **DI**: `@nestjs/testing` `Test.createTestingModule` + `.useMocker(() => mock())`
- **DB**: `@nestjs/typeorm` — get mocked repos via `module.get(getRepositoryToken(Entity))`

---

## Core Principles

### What to test

- Business logic and branching (if/else, switch, early returns)
- Side-effects: what methods are called, with what args, how many times
- Return values and thrown errors

### What NOT to test

- Things enforced by TypeScript types or the linter (e.g. "should accept a string", "should not accept null")
- `toBeDefined()` for every dependency — one top-level sanity check is enough
- Implementation details that don't affect observable behaviour

---

## Module Setup

Always use `.useMocker(() => mock())` so every dependency is auto-mocked. Only override when a specific mock behaviour is needed.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MyEntity } from './entities/my.entity';
import { MyService } from './my.service';

// `mock` and `Mocked<T>` are globals — no import needed

describe('MyService', () => {
  let service: MyService;
  let repo: Mocked<Repository<MyEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(MyService);
    repo = module.get(getRepositoryToken(MyEntity));
  });
```

---

## Payload / Entity Factories

Extract repetitive object construction into factory helpers co-located in the spec file (or a shared `test/factories/` file for cross-spec reuse). Factories accept partial overrides so each test only declares what is relevant.

```typescript
// --- factories (top of spec file, or imported from test/factories/) ---

function createRemoteServer(
  overrides: Partial<RemoteServer> = {}
): RemoteServer {
  return {
    id: "server-1",
    name: "prod-db",
    description: "Production database",
    ownerId: "user-1",
    ...overrides,
  };
}

function createRemoteServerDto(
  overrides: Partial<CreateRemoteServerDto> = {}
): CreateRemoteServerDto {
  return {
    name: "prod-db",
    description: "Production database",
    ...overrides,
  };
}
```

Use them in tests:

```typescript
it("should create a remote server", async () => {
  const dto = createRemoteServerDto({ name: "staging-db" });

  await service.create(dto, "user-1");

  expect(repo.save).toHaveBeenCalledWith({ ...dto, ownerId: "user-1" });
});
```

---

## Error / Edge Cases

Test thrown errors by asserting on `rejects`:

```typescript
it("should throw when server not found", async () => {
  repo.findOneOrFail.mockRejectedValue(
    new EntityNotFoundError(RemoteServer, {})
  );

  await expect(service.findOne("missing")).rejects.toThrow(EntityNotFoundError);
});
```

---

## Structure

Group by method using nested `describe` blocks. Name tests as plain English sentences that describe the observable outcome, not the implementation.

```
describe('MyService')
  it('should be defined')          ← single sanity check
  describe('create')
    it('should persist the entity with the caller's ownerId')
    it('should throw ConflictException when name already exists')
  describe('findOne')
    it('should return the matching entity')
    it('should propagate the repository error when not found')
```

---

## Anti-patterns to Avoid

| Anti-pattern                                                              | Why                                        |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| `expect(x).toBeDefined()` on every dep                                    | TypeScript already guarantees types        |
| Testing method existence (`toBeDefined` on a function)                    | The compiler enforces this                 |
| Duplicated literal objects in every `it`                                  | Use factories                              |
| `any` casts to satisfy mocks                                              | Fix the mock type instead                  |
| Testing that `repo.save` was called 1 time when only one call is possible | Prefer asserting _what_ it was called with |
