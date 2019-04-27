run: build
	docker run xbox-smartglass-core-node

run_discovery: build
	docker run --rm=true xbox-smartglass-core-node -d -i 192.168.2.5

run_boot: build
	docker run --rm=true xbox-smartglass-core-node -b -i 192.168.2.5 -l FD000000000000

run_connect: build
	docker run --rm=true xbox-smartglass-core-node -c -i 192.168.2.5

run_help: build
	docker run --rm=true xbox-smartglass-core-node --help

run_test: build
	docker run --rm=true --entrypoint=npm xbox-smartglass-core-node test

test:
	npm test

build:
	docker build -t xbox-smartglass-core-node .
