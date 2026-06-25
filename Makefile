ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: dev build preview install deploy

install:
	npm install

dev: install
	npm run dev

build: install
	npm run build

preview: build
	npm run preview

deploy: build
	npx wrangler pages deploy dist --project-name palito
