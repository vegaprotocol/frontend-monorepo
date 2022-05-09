package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path"
)

const (
	pathBlock = "/block"
)

type Result struct {
	Block Block `json:"block"`
}

type Block struct {
	Data BlockData `json:"data"`
}

type BlockData struct {
	Txs [][]byte `json:"txs"`
}

type BlockResponse struct {
	Result Result `json:"result"`
}

func getTxsAtBlockHeight(nodeAddress string, height uint64) (interface{}, error) {
	// prepare the request
	req, err := http.NewRequest("GET", nodeAddress, nil)
	if err != nil {
		return nil, err
	}
	values := req.URL.Query()
	values.Add("height", fmt.Sprintf("%v", height))
	req.URL.RawQuery = values.Encode()
	req.URL.Path = path.Join(req.URL.Path, pathBlock)

	// build client
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	// extract the response
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	blockResp := BlockResponse{}
	err = json.Unmarshal(body, &blockResp)
	if err != nil {
		return nil, err
	}

	var out []interface{}
	for _, v := range blockResp.Result.Block.Data.Txs {
		tx, err := unpack(v)
		if err != nil {
			return nil, err
		}
		out = append(out, tx)
	}
	return out, nil
}
