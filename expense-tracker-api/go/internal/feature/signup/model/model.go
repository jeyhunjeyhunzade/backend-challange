package model

// Request/response DTOs for the sign-up slice — the data crossing the
// transport boundary, kept separate from the domain entity.
//
// NOTE (learning mode): placeholder fields. The exact request shape and
// validation are yours to decide.
type SignupRequest struct {
	Email    string
	Password string
}

type SignupResponse struct {
	ID    string
	Email string
}
