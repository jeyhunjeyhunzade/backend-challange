package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// NewRouter builds the gin engine and registers the service's routes.
//
// Feature-slice routes get registered here as their handlers are implemented,
// e.g. router.POST("/signup", gin.WrapH(signupHandler)).
func NewRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return router
}
