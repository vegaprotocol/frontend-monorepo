.PHONY: latest-release
latest-release:
	gh release list | head -n 1 | awk '{print $1}'

.PHONY: show-latest-release
show-latest-release:
	gh release view `gh release list | head -n 1 | awk '{print $1}'`

.PHONY: recalculate-ipfs
recalculate-ipfs:
	echo "ipfs hash inside the image"
	docker run --rm ${TAG} cat /ipfs-hash
	echo "recalculating ipfs hash"
	docker run --rm ${TAG} ipfs add -rQ /usr/share/nginx/html

.PHONY: eject-ipfs-hash
unpack:
	docker create --name=dist ${TAG}
	docker cp dist:/usr/share/nginx/html dist
	docker rm dist
