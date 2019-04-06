run: build
	docker run xbox-smartglass-core-node

run_discovery: build
	docker run xbox-smartglass-core-node -d

run_boot: build
	docker run xbox-smartglass-core-node -b -i 127.0.0.1 -l FD000000000000

run_help: build
	docker run xbox-smartglass-core-node --help

test:
	npm test
	
build:
	docker build -t xbox-smartglass-core-node .
