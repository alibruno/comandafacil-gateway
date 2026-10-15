package br.com.comandafacil.restaurantes;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.jwt.secret=local-test-secret-with-more-than-32-bytes")
@AutoConfigureMockMvc
class RestaurantesApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void exposesOpenApiSchemaWithoutGatewayToken() throws Exception {
		mockMvc.perform(get("/api/restaurantes/schema"))
				.andExpect(status().isOk());
	}

	@Test
	void protectsBusinessRequestsWithoutGatewayToken() throws Exception {
		mockMvc.perform(get("/api/restaurantes"))
				.andExpect(status().isUnauthorized());
	}

}
