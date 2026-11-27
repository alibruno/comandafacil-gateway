package br.com.comandafacil.backend.pedidos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoResponse> findAll() {
        return pedidoService.findAll();
    }

    @GetMapping("/{id}")
    public PedidoResponse findById(@PathVariable String id) {
        return pedidoService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse create(@Valid @RequestBody PedidoRequest request) {
        return pedidoService.create(request);
    }

    @PutMapping("/{id}")
    public PedidoResponse update(@PathVariable String id, @Valid @RequestBody PedidoRequest request) {
        return pedidoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        pedidoService.delete(id);
    }
}

record PedidoRequest(
        @NotBlank String table,
        @NotBlank String waiter,
        @NotEmpty List<@Valid PedidoItemRequest> items,
        @NotNull String notes,
        @NotBlank @Pattern(regexp = "cozinha|preparo|pronto|finalizado") String status) {
}

record PedidoItemRequest(
        @NotBlank String name,
        @NotNull String detail,
        @NotNull @DecimalMin("0.01") BigDecimal unitPrice,
        @Min(1) int quantity,
        @NotNull String note) {
}

record PedidoResponse(
        String id,
        String table,
        String waiter,
        List<PedidoItemResponse> items,
        String notes,
        BigDecimal total,
        String status,
        String openedAt) {
}

record PedidoItemResponse(
        String id,
        String name,
        String detail,
        BigDecimal unitPrice,
        int quantity,
        String note) {
}
