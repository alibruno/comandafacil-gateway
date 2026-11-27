package br.com.comandafacil.backend;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void authenticatesAndSupportsMesaAndPedidoCrud() throws Exception {
		mockMvc.perform(get("/api/mesas"))
				.andExpect(status().isUnauthorized());

		String email = UUID.randomUUID() + "@example.com";
		String registration = mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Teste","email":"%s","password":"senha1234"}
								""".formatted(email)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();
		String token = JsonPath.read(registration, "$.token");
		assertNotNull(token);

		mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "table":"Mesa inexistente",
								  "waiter":"Teste",
								  "items":[{"name":"Prato","detail":"","unitPrice":25,"quantity":1,"note":""}],
								  "notes":"",
								  "status":"cozinha"
								}
								"""))
				.andExpect(status().isBadRequest());

		String mesaResponse = mockMvc.perform(post("/api/mesas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"nome":"Mesa 01","capacidade":4,"dataCadastro":"2026-11-27","disponivel":true}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nome").value("Mesa 01"))
				.andReturn()
				.getResponse()
				.getContentAsString();
		int mesaId = JsonPath.read(mesaResponse, "$.id");

		mockMvc.perform(get("/api/mesas")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(mesaId));
		mockMvc.perform(get("/api/mesas/{id}", mesaId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.disponivel").value(true));
		mockMvc.perform(put("/api/mesas/{id}", mesaId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"nome":"Mesa atualizada","capacidade":6,"dataCadastro":"2026-11-27","disponivel":false}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.capacidade").value(6));
		String pedidoResponse = mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "table":"Mesa atualizada",
								  "waiter":"Teste",
								  "items":[{"id":"item-1","name":"Prato","detail":"R$ 25,00","unitPrice":25,"quantity":2,"note":""}],
								  "notes":"",
								  "status":"cozinha"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.total").value(50))
				.andExpect(jsonPath("$.status").value("cozinha"))
				.andReturn()
				.getResponse()
				.getContentAsString();
		String pedidoId = JsonPath.read(pedidoResponse, "$.id");

		mockMvc.perform(put("/api/pedidos/{id}", pedidoId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "table":"Mesa atualizada",
								  "waiter":"Teste",
								  "items":[{"id":"item-1","name":"Prato","detail":"R$ 25,00","unitPrice":25,"quantity":3,"note":""}],
								  "notes":"",
								  "status":"preparo"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(75))
				.andExpect(jsonPath("$.status").value("preparo"));
		mockMvc.perform(get("/api/pedidos/{id}", pedidoId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].quantity").value(3));
		mockMvc.perform(delete("/api/pedidos/{id}", pedidoId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());
		mockMvc.perform(delete("/api/mesas/{id}", mesaId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());
	}
}
