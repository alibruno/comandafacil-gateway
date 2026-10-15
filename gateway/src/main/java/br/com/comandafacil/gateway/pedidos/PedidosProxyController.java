package br.com.comandafacil.gateway.pedidos;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestClient;

@Controller
public class PedidosProxyController {
    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection",
            "content-length",
            "host",
            "keep-alive",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade"
    );

    private final RestClient restClient;
    private final String pedidosUrl;

    public PedidosProxyController(
            RestClient.Builder restClientBuilder,
            @Value("${PEDIDOS_URL:http://localhost:8082}") String pedidosUrl
    ) {
        this.restClient = restClientBuilder.build();
        this.pedidosUrl = pedidosUrl.endsWith("/")
                ? pedidosUrl.substring(0, pedidosUrl.length() - 1)
                : pedidosUrl;
    }

    @RequestMapping(
            path = {"/api/pedidos", "/api/pedidos/**"},
            method = {
                    RequestMethod.GET,
                    RequestMethod.HEAD,
                    RequestMethod.POST,
                    RequestMethod.PUT,
                    RequestMethod.PATCH,
                    RequestMethod.DELETE,
                    RequestMethod.OPTIONS
            }
    )
    @ResponseBody
    public ResponseEntity<byte[]> proxy(
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body
    ) throws IOException {
        URI target = URI.create(pedidosUrl + request.getRequestURI()
                + (request.getQueryString() == null ? "" : "?" + request.getQueryString()));
        HttpMethod method = HttpMethod.valueOf(request.getMethod());

        return restClient.method(method)
                .uri(target)
                .headers(headers -> copyRequestHeaders(request, headers))
                .body(body == null ? new byte[0] : body)
                .exchange((clientRequest, clientResponse) -> {
                    HttpHeaders responseHeaders = new HttpHeaders();
                    clientResponse.getHeaders().forEach((name, values) -> {
                        if (!isHopByHop(name)) responseHeaders.addAll(name, values);
                    });
                    return ResponseEntity.status(clientResponse.getStatusCode())
                            .headers(responseHeaders)
                            .body(clientResponse.getBody().readAllBytes());
                });
    }

    private static void copyRequestHeaders(HttpServletRequest request, HttpHeaders headers) {
        Collections.list(request.getHeaderNames()).forEach(name -> {
            if (isHopByHop(name)) return;
            Collections.list(request.getHeaders(name)).forEach(value -> headers.add(name, value));
        });
    }

    private static boolean isHopByHop(String name) {
        return HOP_BY_HOP_HEADERS.contains(name.toLowerCase());
    }
}
