package br.com.comandafacil.gateway;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.jwt.secret=local-test-secret-with-more-than-32-bytes")
@AutoConfigureMockMvc
class GatewayApplicationTests {

	private static final AtomicReference<String> PEDIDOS_REQUEST_BODY = new AtomicReference<>();
	private static final AtomicReference<String> PEDIDOS_AUTHORIZATION = new AtomicReference<>();
	private static final HttpServer PEDIDOS_STUB = startPedidosStub();

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtEncoder jwtEncoder;

	@DynamicPropertySource
	static void pedidosServiceUrl(DynamicPropertyRegistry registry) {
		registry.add("PEDIDOS_URL", () -> "http://localhost:" + PEDIDOS_STUB.getAddress().getPort());
	}

	@AfterAll
	static void stopPedidosStub() {
		PEDIDOS_STUB.stop(0);
	}

	@Test
	void contextLoads() {
	}

	@Test
	void forwardsPedidoBodyAndAuthorizationToPedidosService() throws Exception {
		String payload = """
				{"mesaId":10,"itens":[{"produtoId":20}]}
				""";
		Instant now = Instant.now();
		String token = jwtEncoder.encode(JwtEncoderParameters.from(
				JwsHeader.with(MacAlgorithm.HS256).build(),
				JwtClaimsSet.builder()
						.issuer("comandafacil-gateway")
						.subject("gateway-test@example.com")
						.audience(List.of("comandafacil-api"))
						.issuedAt(now)
						.expiresAt(now.plusSeconds(300))
						.claim("name", "Teste")
						.build()
		)).getTokenValue();

		mockMvc.perform(post("/api/pedidos/")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
				.andExpect(status().isCreated())
				.andExpect(content().json("{\"ok\":true}"));

		assertEquals(payload, PEDIDOS_REQUEST_BODY.get());
		assertEquals("Bearer " + token, PEDIDOS_AUTHORIZATION.get());
	}

	@Test
	void exposesSwaggerUiWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/api/docs/"))
				.andExpect(status().is3xxRedirection());
	}

	@Test
	void exposesGatewayNavigationLinks() throws Exception {
		mockMvc.perform(get("/api"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$._links.self.href").value("http://localhost/api"))
				.andExpect(jsonPath("$._links.restaurantes.href").value("http://localhost/api/restaurantes"))
				.andExpect(jsonPath("$._links.pedidos.href").value("http://localhost/api/pedidos"))
				.andExpect(jsonPath("$._links.auth.register.href").value("http://localhost/api/auth/register"))
				.andExpect(jsonPath("$._links.auth.register.method").value("POST"))
				.andExpect(jsonPath("$._links.auth.login.href").value("http://localhost/api/auth/login"))
				.andExpect(jsonPath("$._links.auth.login.method").value("POST"))
				.andExpect(jsonPath("$._links.auth.me.href").value("http://localhost/api/auth/me"))
				.andExpect(jsonPath("$._links.auth.me.method").value("GET"))
				.andExpect(jsonPath("$._links.documentation.href").value("http://localhost/api/docs/"));
	}

	@Test
	void exposesGatewayAuthenticationEndpointsInOpenApi() throws Exception {
		mockMvc.perform(get("/v3/api-docs"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.paths['/api/auth/register']").exists())
				.andExpect(jsonPath("$.paths['/api/auth/login']").exists())
				.andExpect(jsonPath("$.paths['/api/auth/me'].get.security[0].bearerAuth").exists())
				.andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"));

		mockMvc.perform(get("/v3/api-docs/swagger-config"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.urls[0].name").value("Gateway"))
				.andExpect(jsonPath("$.urls[0].url").value("/v3/api-docs"));
	}

	@Test
	void protectsRestaurantApiWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/api/restaurantes"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void registersLogsInAndProtectsPrivateEndpoints() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Bruno Lima","email":"bruno-test@example.com","password":"senha-forte-123"}
								"""))
				.andExpect(status().isOk());

		MvcResult login = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"bruno-test@example.com","password":"senha-forte-123"}
								"""))
				.andExpect(status().isOk())
				.andReturn();
		String responseBody = login.getResponse().getContentAsString();
		String token = responseBody.replaceAll(".*\"accessToken\":\"([^\"]+)\".*", "$1");
		mockMvc.perform(get("/api/auth/me")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("bruno-test@example.com"));
	}

	private static HttpServer startPedidosStub() {
		try {
			HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
			server.createContext("/api/pedidos/", exchange -> {
				PEDIDOS_REQUEST_BODY.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
				PEDIDOS_AUTHORIZATION.set(exchange.getRequestHeaders().getFirst(HttpHeaders.AUTHORIZATION));
				byte[] response = "{\"ok\":true}".getBytes(StandardCharsets.UTF_8);
				exchange.getResponseHeaders().set("Content-Type", "application/json");
				exchange.sendResponseHeaders(201, response.length);
				try (var output = exchange.getResponseBody()) {
					output.write(response);
				}
			});
			server.start();
			return server;
		} catch (IOException exception) {
			throw new ExceptionInInitializerError(exception);
		}
	}
}
