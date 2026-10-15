package br.com.comandafacil.gateway.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final long TOKEN_LIFETIME_SECONDS = 28_800;

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement(
                    "INSERT INTO app_user (name, email, password_hash) VALUES (?, ?, ?)");
            statement.setString(1, request.name().trim());
            statement.setString(2, email);
            statement.setString(3, passwordEncoder.encode(request.password()));
            return statement;
        });
        return issueToken(request.name().trim(), email);
    }

    AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        var users = jdbcTemplate.query(
                "SELECT name, password_hash FROM app_user WHERE email = ?",
                (resultSet, rowNumber) -> Map.entry(
                        resultSet.getString("name"),
                        resultSet.getString("password_hash")),
                email);
        if (users.isEmpty() || !passwordEncoder.matches(request.password(), users.getFirst().getValue())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }
        return issueToken(users.getFirst().getKey(), email);
    }

    private AuthResponse issueToken(String name, String email) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(TOKEN_LIFETIME_SECONDS, ChronoUnit.SECONDS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("comandafacil-gateway")
                .subject(email)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .audience(java.util.List.of("comandafacil-api"))
                .claim("name", name)
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims))
                .getTokenValue();
        return new AuthResponse(token, TOKEN_LIFETIME_SECONDS, new AuthUser(name, email));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
