package signup

import (
	"context"
	"database/sql"

	"expense-tracker-api/internal/feature/signup/model"
)

// Service is the slice's PUBLIC port. Callers outside the slice (e.g. the
// transport layer) depend on this interface; the concrete implementation
// (usecase.Service) stays hidden under internal/.
type Service interface {
	Signup(ctx context.Context, req model.SignupRequest) (model.SignupResponse, error)
}

// New is the slice's composition constructor: it assembles the sign-up
// feature (repository -> use case) and returns the ready-to-use service.
//
// Dependency-injection params come in here (e.g. the DB pool); the app
// composition root calls this.
func New(db *sql.DB) Service {
	// TODO: wire the repository into the use case, e.g.
	//   repo := repository.New(db)
	//   return usecase.New(repo)
	panic("TODO: wire the sign-up slice")
}
