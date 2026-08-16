package repository

import (
	"context"
	"database/sql"

	"expense-tracker-api/internal/domain"
	"expense-tracker-api/internal/feature/signup/internal/contract"
)

// userRepository is the DB-backed implementation of contract.UserRepository.
type userRepository struct {
	db *sql.DB
}

// New returns a contract.UserRepository backed by the given DB. Constructor
// signature only — no query logic here.
func New(db *sql.DB) contract.UserRepository {
	// TODO: return &userRepository{db: db}
	panic("TODO: implement constructor")
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	// TODO (learning mode — you write this): SQL insert goes here.
	panic("TODO: implement Create")
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	// TODO (learning mode — you write this): SQL query goes here.
	panic("TODO: implement FindByEmail")
}
