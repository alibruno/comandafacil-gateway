package br.com.comandafacil.gateway.auth;

public record AuthResponse(String accessToken, long expiresIn, AuthUser user) {}
