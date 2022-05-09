build: go
	yarn nx run explorer:build-netlify
go:
	mkdir -p functions
	cd api && \
	go get ./... && \
	GO111MODULE=on go build -o "../functions/chain-explorer-api"
