package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path"
)
const (
	pathSearch = "/tx_search"
)

type SearchResult struct {
	Txs []Txs `json:"txs"`
}

type Txs struct {
	Tx []byte `json:"tx"`
}

type SearchTxResponse struct {
	SearchResult SearchResult `json:"result"`
}

func getTxsFromSearch(nodeAddress string, height uint64, per_page uint64, page uint64) (interface{}, error) {
	// prepare the request
	req, err := http.NewRequest("GET", nodeAddress, nil)
	if err != nil {
		return nil, err
	}
	values := req.URL.Query()
	values.Add("query", fmt.Sprintf("\"tx.height<%v\"", height))
	values.Add("per_page", fmt.Sprintf("%v", per_page))
	values.Add("page", fmt.Sprintf("%v", page))
	values.Add("order_by", "\"desc\"")

	req.URL.RawQuery = values.Encode()
	req.URL.Path = path.Join(req.URL.Path, pathSearch)

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

	blockResp := SearchTxResponse{}
	err = json.Unmarshal(body, &blockResp)
	if err != nil {
		return nil, err
	}


	var out []interface{}
	for _, v := range blockResp.SearchResult.Txs {
		tx, err := unpack(v.Tx)
		if err != nil {
			return nil, err
		}
		out = append(out, tx)
	}
	return out, nil
}
