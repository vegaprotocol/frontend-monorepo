package main

import (
	// "bytes"
	//  "compress/gzip"

	"encoding/hex"
	"encoding/json"
	_ "encoding/json"
	"errors"
	_ "fmt"
	_ "net/http"
	"strconv"
	"strings"

	commandspb "code.vegaprotocol.io/protos/vega/commands/v1"
	"google.golang.org/protobuf/runtime/protoiface"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	"github.com/tendermint/tendermint/crypto/tmhash"
)

type UnsignedTx struct {
	Type    string
	Command string
}

type SignedTx struct {
	Type    string
	Command string
	Sig     string
	PubKey  string
	Nonce   uint64
	TxHash  string
}

func getCommand(inputData *commandspb.InputData) (protoiface.MessageV1, string, error) {
	switch cmd := inputData.Command.(type) {
	case *commandspb.InputData_OrderSubmission:
		return cmd.OrderSubmission, "OrderSubmission", nil
	case *commandspb.InputData_OrderCancellation:
		return cmd.OrderCancellation, "OrderCancellation", nil
	case *commandspb.InputData_OrderAmendment:
		return cmd.OrderAmendment, "OrderAmendment", nil
	case *commandspb.InputData_VoteSubmission:
		return cmd.VoteSubmission, "VoteSubmission", nil
	case *commandspb.InputData_WithdrawSubmission:
		return cmd.WithdrawSubmission, "WithdrawSubmission", nil
	case *commandspb.InputData_LiquidityProvisionSubmission:
		return cmd.LiquidityProvisionSubmission, "LiquidityProvisionSubmission", nil
	case *commandspb.InputData_LiquidityProvisionCancellation:
		return cmd.LiquidityProvisionCancellation, "LiquidityProvisionCancellation", nil
	case *commandspb.InputData_LiquidityProvisionAmendment:
		return cmd.LiquidityProvisionAmendment, "LiquidityProvisionAmendment", nil
	case *commandspb.InputData_ProposalSubmission:
		return cmd.ProposalSubmission, "ProposalSubmission", nil
	case *commandspb.InputData_NodeVote:
		return cmd.NodeVote, "NodeVote", nil
	case *commandspb.InputData_NodeSignature:
		return cmd.NodeSignature, "NodeSignature", nil
	case *commandspb.InputData_ChainEvent:
		return cmd.ChainEvent, "ChainEvent", nil
	case *commandspb.InputData_OracleDataSubmission:
		return cmd.OracleDataSubmission, "OracleDataSubmission", nil
	case *commandspb.InputData_DelegateSubmission:
		return cmd.DelegateSubmission, "DelegateSubmission", nil
	case *commandspb.InputData_UndelegateSubmission:
		return cmd.UndelegateSubmission, "UndelegateSubmission", nil
	case *commandspb.InputData_RestoreSnapshotSubmission:
		return cmd.RestoreSnapshotSubmission, "RestoreSnapshotSubmission", nil
	case *commandspb.InputData_KeyRotateSubmission:
		return cmd.KeyRotateSubmission, "KeyRotateSubmission", nil
	case *commandspb.InputData_StateVariableProposal:
		return cmd.StateVariableProposal, "StateVariableProposal", nil
	case *commandspb.InputData_Transfer:
		return cmd.Transfer, "Transfer", nil
	case *commandspb.InputData_CancelTransfer:
		return cmd.CancelTransfer, "CancelTransfer", nil
	case *commandspb.InputData_ValidatorHeartbeat:
		return cmd.ValidatorHeartbeat, "ValidatorHeartbeat", nil
	case *commandspb.InputData_EthereumKeyRotateSubmission:
		return cmd.EthereumKeyRotateSubmission, "EthereumKeyRotateSubission", nil
	default:
		return nil, "", errors.New("unsupported command")
	}
}

func unpackSignedTx(rawtx []byte) (interface{}, error) {
	tx := commandspb.Transaction{}
	err := proto.Unmarshal(rawtx, &tx)
	if err != nil {
		return nil, err
	}

	hash := tmhash.Sum(rawtx)
	hashString := "0x" + strings.ToUpper(hex.EncodeToString(hash))

	inputData := commandspb.InputData{}
	err = proto.Unmarshal(tx.InputData, &inputData)
	if err != nil {
		return nil, err
	}

	cmd, cmdName, err := getCommand(&inputData)
	if err != nil {
		return nil, err
	}

	m := jsonpb.Marshaler{}
	marshalTx, err := m.MarshalToString(cmd)
	if err != nil {
		return nil, err
	}

	return &SignedTx{
		Type:    cmdName,
		Command: marshalTx,
		Sig:     tx.Signature.Value,
		PubKey:  "0x" + tx.GetPubKey(),
		Nonce:   inputData.Nonce,
		TxHash:  hashString,
	}, nil
}

func unpack(tx []byte) (interface{}, error) {
	return unpackSignedTx(tx)
}

type request struct {
	NodeURL     string  `json:"node_url"`
	BlockHeight *uint64 `json:"block_height"`
	TxHash      *string `json:"tx_hash"`
}

func handler(ev events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "POST",
		"Access-Control-Allow-Headers": "*",
	}
	multiValHeaders := map[string][]string{
		"Access-Control-Allow-Methods": {"POST"},
		"Access-Control-Allow-Headers": {"*"},
	}

	if strings.EqualFold(ev.HTTPMethod, "OPTIONS") {
		// cors
		return &events.APIGatewayProxyResponse{
			StatusCode:        200,
			Headers:           headers,
			MultiValueHeaders: multiValHeaders,
		}, nil
	}

	if !strings.EqualFold(ev.HTTPMethod, "POST") {
		return nil, errors.New("method POST supported only")
	}

	req := request{}
	err := json.Unmarshal([]byte(ev.Body), &req)
	if err != nil {
		return nil, err
	}

	if len(req.NodeURL) <= 0 {
		return nil, errors.New("node_url is required")
	}

	if req.BlockHeight == nil && req.TxHash == nil {
		return nil, errors.New("one of block_height or tx_hash is required")
	} else if req.BlockHeight != nil && req.TxHash != nil {
		return nil, errors.New("only one of block_height or tx_hash is required")
	}

	var out interface{}
	if req.BlockHeight != nil {
		out, err = getTxsAtBlockHeight(req.NodeURL, *req.BlockHeight)
		if err != nil {
			return nil, err
		}
	}

	if req.TxHash != nil {
		out, err = getTx(req.NodeURL, *req.TxHash)
		if err != nil {
			return nil, err
		}
	}

	buf, err := json.Marshal(out)
	if err != nil {
		return nil, err
	}

	var ret string = string(buf)

	headers["Content-Type"] = "application/json"
	headers["Content-Length"] = strconv.Itoa(len(ret))

	return &events.APIGatewayProxyResponse{
		StatusCode:        200,
		Body:              ret,
		Headers:           headers,
		MultiValueHeaders: multiValHeaders,
	}, nil
}

func hasGzipEncoding(m map[string]string) bool {
	for k, v := range m {
		if strings.EqualFold(k, "Accept-Encoding") && strings.EqualFold(v, "gzip") {
			return true
		}
	}
	return false
}

func main() {
	// Make the handler available for Remote Procedure Call by AWS Lambda
	lambda.Start(handler)
}
