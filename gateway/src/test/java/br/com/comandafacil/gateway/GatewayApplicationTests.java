package br.com.comandafacil.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.jwt.secret=local-test-secret-with-more-than-32-bytes")
@AutoConfigureMockMvc
class GatewayApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void exposesSwaggerUiWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/api/docs/"))
				.andExpect(status().is3xxRedirection());
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
}
