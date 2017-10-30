package main

import (
	"encoding/json"
	"time"

	"errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"strings"
)

// Key consists of prefix + UUID of the contract type
type contractType struct {
	ShopType        string  `json:"shop_type"`
	FormulaPerDay   string  `json:"formula_per_day"`
	MaxSumInsured   float32 `json:"max_sum_insured"`
	TheftInsured    bool    `json:"theft_insured"`
	Description     string  `json:"description"`
	Conditions      string  `json:"conditions"`
	Active          bool    `json:"active"`
	MinDurationDays int32   `json:"min_duration_days"`
	MaxDurationDays int32   `json:"max_duration_days"`
}

// Key consists of prefix + username + UUID of the contract
type contract struct {
	Username         string    `json:"username"`
	Item             item      `json:"item"`
	StartDate        time.Time `json:"start_date"`
	EndDate          time.Time `json:"end_date"`
	Void             bool      `json:"void"`
	ContractTypeUUID string    `json:"contract_type_uuid"`
	ClaimIndex       []string  `json:"claim_index,omitempty"`
}

// Entity not persisted on its own
type item struct {
	ID          int32   `json:"id"`
	Brand       string  `json:"brand"`
	Model       string  `json:"model"`
	Price       float32 `json:"price"`
	Description string  `json:"description"`
	SerialNo    string  `json:"serial_no"`
}

// Key consists of prefix + UUID of the contract + UUID of the claim
type claim struct {
	ContractUUID  string      `json:"contract_uuid"`
	Date          time.Time   `json:"date"`
	Description   string      `json:"description"`
	IsTheft       bool        `json:"is_theft"`
	Status        ClaimStatus `json:"status"`
	Reimbursable  float32     `json:"reimbursable"`
	Repaired      bool        `json:"repaired"`
	FileReference string      `json:"file_reference"`
}

// The claim status indicates how the claim should be treated
type ClaimStatus int8

const (
	// The claims status is unknown
	ClaimStatusUnknown ClaimStatus = iota
	// The claim is new
	ClaimStatusNew
	// The claim has been rejected (either by the insurer, or by authorities
	ClaimStatusRejected
	// The item is up for repairs, or has been repaired
	ClaimStatusRepair
	// The customer should be reimbursed, or has already been
	ClaimStatusReimbursement
	// The theft of the item has been confirmed by authorities
	ClaimStatusTheftConfirmed
)

func (s *ClaimStatus) UnmarshalJSON(b []byte) error {
	var value string
	if err := json.Unmarshal(b, &value); err != nil {
		return err
	}

	switch strings.ToUpper(value) {
	default:
		*s = ClaimStatusUnknown
	case "N":
		*s = ClaimStatusNew
	case "J":
		*s = ClaimStatusRejected
	case "R":
		*s = ClaimStatusRepair
	case "F":
		*s = ClaimStatusReimbursement
	case "P":
		*s = ClaimStatusTheftConfirmed
	}

	return nil
}

func (s ClaimStatus) MarshalJSON() ([]byte, error) {
	var value string

	switch s {
	default:
		fallthrough
	case ClaimStatusUnknown:
		value = ""
	case ClaimStatusNew:
		value = "N"
	case ClaimStatusRejected:
		value = "J"
	case ClaimStatusRepair:
		value = "R"
	case ClaimStatusReimbursement:
		value = "F"
	case ClaimStatusTheftConfirmed:
		value = "P"
	}

	return json.Marshal(value)
}

// Key consists of prefix + username
type user struct {
	Username      string   `json:"username"`
	Password      string   `json:"password"`
	FirstName     string   `json:"first_name"`
	LastName      string   `json:"last_name"`
	ContractIndex []string `json:"contracts"`
}

// Key consists of prefix + UUID fo the repair order
type repairOrder struct {
	ClaimUUID    string `json:"claim_uuid"`
	ContractUUID string `json:"contract_uuid"`
	Item         item   `json:"item"`
	Ready        bool   `json:"ready"`
}

func (u *user) Contacts(stub shim.ChaincodeStubInterface) []contract {
	contracts := make([]contract, 0)

	// for each contractID in user.ContractIndex
	for _, contractID := range u.ContractIndex {

		c := &contract{}

		// get contract
		contractAsBytes, err := stub.GetState(contractID)
		if err != nil {
			//res := "Failed to get state for " + contractID
			return nil
		}

		// parse contract
		err = json.Unmarshal(contractAsBytes, c)
		if err != nil {
			//res := "Failed to parse contract"
			return nil
		}

		// append to the contracts array
		contracts = append(contracts, *c)
	}

	return contracts
}

func (c *contract) Claims(stub shim.ChaincodeStubInterface) ([]claim, error) {
	claims := []claim{}

	for _, claimKey := range c.ClaimIndex {
		claim := claim{}

		claimAsBytes, err := stub.GetState(claimKey)
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(claimAsBytes, &claim)
		if err != nil {
			return nil, err
		}

		claims = append(claims, claim)
	}

	return claims, nil
}

func (c *contract) User(stub shim.ChaincodeStubInterface) (*user, error) {
	user := &user{}

	if len(c.Username) == 0 {
		return nil, errors.New("Invalid user name in contract.")
	}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{c.Username})
	if err != nil {
		return nil, err
	}

	userAsBytes, err := stub.GetState(userKey)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(userAsBytes, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (c *claim) Contract(stub shim.ChaincodeStubInterface) (*contract, error) {
	if len(c.ContractUUID) == 0 {
		return nil, nil
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixContract, []string{})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		kvResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		_, keyParams, err := stub.SplitCompositeKey(kvResult.Key)
		if len(keyParams) != 2 {
			continue
		}

		if keyParams[1] == c.ContractUUID {
			contract := &contract{}
			err := json.Unmarshal(kvResult.Value, contract)
			if err != nil {
				return nil, err
			}
			return contract, nil
		}
	}
	return nil, nil
}
