package contract

import (
	"context"

	"expense-tracker-api/internal/domain"
)

// UserRepository is the port the sign-up use case depends on. It is a
// contract (interface), not logic — fully defined here.
//
// The repository/ package provides the DB-backed implementation; the
// usecase/ package depends only on this interface.
type UserRepository interface {
	// Create persists a new user.
	Create(ctx context.Context, user *domain.User) error

	// FindByEmail returns the user with the given email, or
	// domain.ErrUserNotFound if none exists.
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
}
