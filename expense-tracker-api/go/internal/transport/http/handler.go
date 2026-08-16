package http

import (
	"net/http"

	"expense-tracker-api/internal/feature/signup"
)

// SignupHandler is the inbound HTTP adapter for the sign-up slice. It decodes
// the request, calls the use case, and encodes the response.
type SignupHandler struct {
	signup signup.Service
}

// NewSignupHandler wires the use case into the handler. Constructor only.
func NewSignupHandler(signup signup.Service) *SignupHandler {
	return &SignupHandler{signup: signup}
}

// ServeHTTP handles POST /signup.
func (h *SignupHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// TODO (learning mode — you write this): decode request -> call use case
	// -> encode response/error. Request/response wiring only.
	panic("TODO: implement sign-up handler")
}
