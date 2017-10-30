package main

import (
	"encoding/json"

	"strings"

	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listContractTypes(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	callingAsMerchant := len(args) == 1
	input := struct {
		ShopType string `json:"shop_type"`
	}{}
	if callingAsMerchant {
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixContractType, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	results := []interface{}{}
	for resultsIterator.HasNext() {
		kvResult, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		ct := struct {
			UUID string `json:"uuid"`
			*contractType
		}{}
		err = json.Unmarshal(kvResult.Value, &ct)
		if err != nil {
			return shim.Error(err.Error())
		}
		prefix, keyParts, err := stub.SplitCompositeKey(kvResult.Key)
		if err != nil {
			return shim.Error(err.Error())
		}
		if len(keyParts) > 0 {
			ct.UUID = keyParts[0]
		} else {
			ct.UUID = prefix
		}

		// Apply proper filtering, merchants should only see active contracts
		if !callingAsMerchant ||
			(strings.Contains(strings.ToTitle(ct.ShopType), strings.ToTitle(input.ShopType)) && ct.Active) {
			results = append(results, ct)
		}
	}

	returnBytes, err := json.Marshal(results)
	return shim.Success(returnBytes)
}

func createContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	partial := struct {
		UUID string `json:"uuid"`
	}{}
	ct := contractType{}

	err := json.Unmarshal([]byte(args[0]), &partial)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal([]byte(args[0]), &ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContractType, []string{partial.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	value, err := json.Marshal(ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, value)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func setActiveContractType(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	req := struct {
		UUID   string `json:"uuid"`
		Active bool   `json:"active"`
	}{}
	ct := contractType{}

	err := json.Unmarshal([]byte(args[0]), &req)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixContractType, []string{req.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	valAsBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(err.Error())
	}
	if len(valAsBytes) == 0 {
		return shim.Error("Contract Type could not be found")
	}
	err = json.Unmarshal(valAsBytes, &ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	ct.Active = req.Active

	valAsBytes, err = json.Marshal(ct)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(key, valAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func listContracts(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	input := struct {
		Username string `json:"username"`
	}{}
	if len(args) == 1 {
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	filterByUsername := len(input.Username) > 0

	var resultsIterator shim.StateQueryIteratorInterface
	var err error
	// Filtering by username if required
	if filterByUsername {
		resultsIterator, err = stub.GetStateByPartialCompositeKey(prefixContract, []string{input.Username})
	} else {
		resultsIterator, err = stub.GetStateByPartialCompositeKey(prefixContract, []string{})
	}
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	results := []interface{}{}
	// Iterate over the results
	for resultsIterator.HasNext() {
		kvResult, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		// Construct response struct
		result := struct {
			UUID string `json:"uuid"`
			*contract
			Claims []claim `json:"claims,omitempty"`
		}{}

		err = json.Unmarshal(kvResult.Value, &result)
		if err != nil {
			return shim.Error(err.Error())
		}

		// Fetch key
		prefix, keyParts, err := stub.SplitCompositeKey(kvResult.Key)
		if len(keyParts) == 2 {
			result.UUID = keyParts[1]
		} else {
			result.UUID = prefix
		}

		// Fetch the claims, if the the username parameter is specified
		if len(input.Username) > 0 {
			result.Claims, err = result.contract.Claims(stub)
			if err != nil {
				return shim.Error(err.Error())
			}
		}
		result.ClaimIndex = []string{} // Remove internal data
		results = append(results, result)
	}

	resultsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(resultsAsBytes)
}

func listClaims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var status ClaimStatus
	if len(args) > 0 {
		input := struct {
			Status ClaimStatus `json:"status"`
		}{}
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
		status = input.Status
	}

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

		result := struct {
			UUID string `json:"uuid"`
			*claim
		}{}
		err = json.Unmarshal(kvResult.Value, &result)
		if err != nil {
			return shim.Error(err.Error())
		}

		// Skip the processing of the result, if the status
		// does not equal the query status; list all, if unknown
		if result.Status != status && status != ClaimStatusUnknown {
			continue
		}

		// Fetch key
		prefix, keyParts, err := stub.SplitCompositeKey(kvResult.Key)
		if len(keyParts) < 2 {
			result.UUID = prefix
		} else {
			result.UUID = keyParts[1]
		}

		results = append(results, result)
	}

	claimsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(claimsAsBytes)
}

func fileClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	dto := struct {
		UUID         string    `json:"uuid"`
		ContractUUID string    `json:"contract_uuid"`
		Date         time.Time `json:"date"`
		Description  string    `json:"description"`
		IsTheft      bool      `json:"is_theft"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	claim := claim{
		ContractUUID: dto.ContractUUID,
		Date:         dto.Date,
		Description:  dto.Description,
		IsTheft:      dto.IsTheft,
		Status:       ClaimStatusNew,
	}

	// Check if the contract exists
	contract, err := claim.Contract(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	if contract == nil {
		return shim.Error("Contract could not be found.")
	}

	// Persist the claim
	claimKey, err := stub.CreateCompositeKey(prefixClaim,
		[]string{dto.ContractUUID, dto.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	claimBytes, err := json.Marshal(claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(claimKey, claimBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Update the claim index in the contract
	contract.ClaimIndex = append(contract.ClaimIndex, claimKey)
	contractKey, err := stub.CreateCompositeKey(prefixContract,
		[]string{contract.Username, claim.ContractUUID})

	if err != nil {
		return shim.Error(err.Error())
	}
	contractBytes, err := json.Marshal(contract)
	if err != nil {
		return shim.Error(err.Error())
	}
	stub.PutState(contractKey, contractBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func processClaim(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		UUID         string      `json:"uuid"`
		ContractUUID string      `json:"contract_uuid"`
		Status       ClaimStatus `json:"status"`
		Reimbursable float32     `json:"reimbursable"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	claimKey, err := stub.CreateCompositeKey(prefixClaim, []string{input.ContractUUID, input.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	claimBytes, _ := stub.GetState(claimKey)
	if len(claimBytes) == 0 {
		return shim.Error("Claim cannot be found.")
	}

	claim := claim{}
	err = json.Unmarshal(claimBytes, &claim)
	if err != nil {
		return shim.Error(err.Error())
	}

	if !claim.IsTheft && claim.Status != ClaimStatusNew {
		// Check if altering claim is allowed
		return shim.Error("Cannot change the status of a non-new claim.")
	}
	if claim.IsTheft && claim.Status == ClaimStatusNew {
		return shim.Error("Theft must first be confirmed by authorities.")
	}

	claim.Status = input.Status // Assigning requested status
	switch input.Status {
	case ClaimStatusRepair:
		// Approve and create a repair order
		if claim.IsTheft {
			return shim.Error("Cannot repair stolen items.")
		}
		claim.Reimbursable = 0

		contract, err := claim.Contract(stub)
		if err != nil {
			return shim.Error(err.Error())
		}
		// Create new repair order
		repairOrder := repairOrder{
			Item:         contract.Item,
			ClaimUUID:    input.UUID,
			ContractUUID: input.ContractUUID,
			Ready:        false,
		}
		repairOrderKey, err := stub.CreateCompositeKey(prefixRepairOrder, []string{input.UUID})
		if err != nil {
			return shim.Error(err.Error())
		}
		repairOrderBytes, err := json.Marshal(repairOrder)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = stub.PutState(repairOrderKey, repairOrderBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

	case ClaimStatusReimbursement:
		// Approve reimbursement of item, and add the sum
		claim.Reimbursable = input.Reimbursable
		// If theft was involved, mark the contract as void
		if claim.IsTheft {
			contract, err := claim.Contract(stub)
			if err != nil {
				return shim.Error(err.Error())
			}
			contract.Void = true
			// Persist contract
			contractKey, err := stub.CreateCompositeKey(
				prefixContract, []string{contract.Username, claim.ContractUUID})
			if err != nil {
				return shim.Error(err.Error())
			}
			contractBytes, err := json.Marshal(contract)
			if err != nil {
				return shim.Error(err.Error())
			}
			err = stub.PutState(contractKey, contractBytes)
			if err != nil {
				return shim.Error(err.Error())
			}
		}

	case ClaimStatusRejected:
		// Mark as rejected
		claim.Reimbursable = 0
	default:
		return shim.Error("Unknown status change.")
	}

	// Persist claim
	claimBytes, err = json.Marshal(claim)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(claimKey, claimBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func authUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{}

	authenticated := false

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}
	userBytes, _ := stub.GetState(userKey)
	if len(userBytes) == 0 {
		authenticated = false
	} else {
		user := user{}
		err := json.Unmarshal(userBytes, &user)
		if err != nil {
			return shim.Error(err.Error())
		}
		authenticated = user.Password == input.Password
	}

	authBytes, _ := json.Marshal(authenticated)
	return shim.Success(authBytes)
}

func getUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		Username string `json:"username"`
	}{}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}
	userBytes, _ := stub.GetState(userKey)
	if len(userBytes) == 0 {
		return shim.Success(nil)
	}

	response := struct {
		Username  string `json:"username"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}{}
	err = json.Unmarshal(userBytes, &response)
	if err != nil {
		return shim.Error(err.Error())
	}
	responseBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseBytes)
}
