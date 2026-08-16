package usecase

import (
	"context"

	"expense-tracker-api/internal/feature/signup/internal/contract"
	"expense-tracker-api/internal/feature/signup/model"
)

// Service holds the sign-up use case's dependencies (ports only).
type Service struct {
	users contract.UserRepository
}

// New wires the use case's dependencies. Constructor boilerplate only.
func New(users contract.UserRepository) *Service {
	return &Service{users: users}
}

// Signup performs the sign-up use case.
func (s *Service) Signup(ctx context.Context, req model.SignupRequest) (model.SignupResponse, error) {
	// TODO (learning mode — you write this): business logic goes here.
	panic("TODO: implement sign-up use case")
}
