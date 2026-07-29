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

check: lint typecheck format-check skills-check skills-test

format-check:
    pnpm format:check

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

skills-remove name:
    pnpm skills:remove {{name}}
