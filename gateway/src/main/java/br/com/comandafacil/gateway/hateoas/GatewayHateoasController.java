package br.com.comandafacil.gateway.hateoas;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
public class GatewayHateoasController {
    @GetMapping({"/", "/api"})
    public Map<String, Object> api() {
        String base = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return Map.of(
                "_links", Map.of(
                        "self", Map.of("href", base + "/api", "method", "GET"),
                        "restaurantes", Map.of("href", base + "/api/restaurantes", "method", "GET"),
                        "pedidos", Map.of("href", base + "/api/pedidos", "method", "GET"),
                        "auth", Map.of(
                                "register", Map.of("href", base + "/api/auth/register", "method", "POST"),
                                "login", Map.of("href", base + "/api/auth/login", "method", "POST"),
                                "me", Map.of("href", base + "/api/auth/me", "method", "GET")
                        ),
                        "documentation", Map.of("href", base + "/api/docs/", "method", "GET")
                )
        );
    }
}
