set dotenv-load := true

default:
    just --list

install:
    pnpm install

dev:
    pnpm dev

dev-reference:
    pnpm dev:reference

build:
    pnpm build

lint:
    pnpm lint

typecheck:
    pnpm typecheck

format:
    pnpm format

check: lint typecheck format-check skills-check skills-test template-test test-unit test-api-e2e

format-check:
    pnpm format:check

test-unit:
    pnpm test:unit

test-api-e2e:
    pnpm test:api:e2e

test-api-smoke:
    pnpm test:api:smoke

package-create name:
    pnpm package:create {{name}}

skills-create name description:
    pnpm skills:create {{name}} --description "{{description}}"

skills-sync:
    pnpm skills:sync

skills-check:
    pnpm skills:check

skills-test:
    pnpm skills:test

template-test:
    pnpm template:test

template-test-integration:
    pnpm template:test:integration

skills-remove name:
    pnpm skills:remove {{name}}
