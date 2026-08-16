package config

import (
	"fmt"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

// Config holds every environment-provided setting the service needs. Values
// are bound from environment variables by envconfig via the struct tags below.
type Config struct {
	DBHost     string `envconfig:"DB_HOST" default:"localhost"`
	DBPort     int    `envconfig:"DB_PORT" default:"5432"`
	DBUser     string `envconfig:"DB_USER" required:"true"`
	DBPassword string `envconfig:"DB_PASSWORD" required:"true"`
	DBName     string `envconfig:"DB_NAME" required:"true"`

	HTTPPort int `envconfig:"HTTP_PORT" default:"8080"`

	JWTSecret string `envconfig:"JWT_SECRET" required:"true"`
}

// LoadConfig reads a local .env file when present, then binds environment
// variables into a Config. A missing .env is not an error — in deployed
// environments the variables come from the environment itself.
func LoadConfig() (Config, error) {
	// Ignore the error: .env is a local-development convenience only.
	_ = godotenv.Load(".env")

	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return Config{}, fmt.Errorf("process env config: %w", err)
	}

	return cfg, nil
}
