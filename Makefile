.PHONY: dev build preview install

install:
	npm install

dev: install
	npm run dev

build: install
	npm run build

preview: build
	npm run preview
