package domain

import "time"

// User is a pure domain entity — no external imports, no behavior/logic.
//
// NOTE (learning mode): these are placeholder starter fields so the contract
// and DTOs have something to reference. Deciding the real domain shape is
// yours — adjust/remove fields as you model sign-up.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}
