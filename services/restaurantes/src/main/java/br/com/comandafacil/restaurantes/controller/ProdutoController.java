package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.ProdutoRequest;
import br.com.comandafacil.restaurantes.dto.ProdutoResponse;
import br.com.comandafacil.restaurantes.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurantes/{restauranteId}/produtos")
@RequiredArgsConstructor
public class ProdutoController {
    private final ProdutoService service;

    @GetMapping
    public List<ProdutoResponse> listar(@PathVariable UUID restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponse criar(@PathVariable UUID restauranteId, @Valid @RequestBody ProdutoRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable UUID restauranteId, @PathVariable UUID id,
                                     @Valid @RequestBody ProdutoRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        service.excluir(restauranteId, id);
    }
}
