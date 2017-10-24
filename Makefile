.PHONY: all image package dist clean

all: package

image:
	docker build --tag amazonlinux:nodejs .

package:
	docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs npm install --production

dist:
	mkdir -p dist
	rm -f dist/function.zip
	cd lambda && zip -q -r ../dist/function.zip index.js node_modules/*

clean:
	rm -rf lambda/node_modules

clean-dist:
	rm -rf dist
