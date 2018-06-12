run: build
	docker run xbox-smartglass-core-node

run_discovery: build
	docker run xbox-smartglass-core-node discovery

build:
	docker build -t xbox-smartglass-core-node .
