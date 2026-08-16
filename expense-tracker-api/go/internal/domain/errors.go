package domain

import "errors"

// Domain-level sentinel errors. Pure declarations, no logic.
//
// NOTE (learning mode): placeholders — add/rename as your validation and
// use-case rules take shape.
var (
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrUserNotFound      = errors.New("user not found")
)
