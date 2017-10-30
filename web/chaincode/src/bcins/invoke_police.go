package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listTheftClaims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	results := []interface{}{}
	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixClaim, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		kvResult, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		claim := claim{}
		err = json.Unmarshal(kvResult.Value, &claim)
		if err != nil {
			return shim.Error(err.Error())
		}
		// Filter out the irrelevant claims
		if !claim.IsTheft || claim.Status != ClaimStatusNew {
			continue
		}

		contract, err := claim.Contract(stub)
		if err != nil {
			return shim.Error(err.Error())
		}
		if contract == nil {
			return shim.Error("Error acquiring contracts.")
		}

		result := struct {
			UUID         string `json:"uuid"`
			ContractUUID string `json:"contract_uuid"`
			Item         item   `json:"item"`
			Description  string `json:"description"`
			Name         string `json:"name"`
		}{}

		// Fetch key and set other properties
		prefix, keyParts, err := stub.SplitCompositeKey(kvResult.Key)
		if len(keyParts) < 2 {
			result.UUID = prefix
		} else {
			result.ContractUUID = keyParts[0]
			result.UUID = keyParts[1]
		}
		user, err := contract.User(stub)
		if err != nil {
			return shim.Error(err.Error())
		}
		if user == nil {
			return shim.Error("Error acquiring user.")
		}

		result.Item = contract.Item
		result.Description = claim.Description
		result.Name = fmt.Sprintf("%s %s", user.FirstName, user.LastName)

		results = append(results, result)
	}

	claimsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(claimsAsBytes)
}

func processTheftClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	dto := struct {
		UUID          string `json:"uuid"`
		ContractUUID  string `json:"contract_uuid"`
		IsTheft       bool   `json:"is_theft"`
		FileReference string `json:"file_reference"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixClaim, []string{dto.ContractUUID, dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	claimAsBytes, _ := stub.GetState(key)
	if len(claimAsBytes) == 0 {
		return shim.Error("Claim cannot be found.")
	}

	claim := claim{}
	err = json.Unmarshal(claimAsBytes, &claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Check if the correct kind of claim is about to be processed
	if !claim.IsTheft || claim.Status != ClaimStatusNew {
		return shim.Error("Claim is either not related to theft, or has invalid status.")
	}

	if dto.IsTheft {
		claim.Status = ClaimStatusTheftConfirmed
	} else {
		claim.Status = ClaimStatusRejected // by authorities
	}
	claim.FileReference = dto.FileReference

	claimAsBytes, err = json.Marshal(claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, claimAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}
