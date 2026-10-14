package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.ProdutoRequest;
import br.com.comandafacil.restaurantes.dto.ProdutoResponse;
import br.com.comandafacil.restaurantes.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/restaurantes/{restauranteId}/produtos")
@RequiredArgsConstructor
public class ProdutoController {
    private final ProdutoService service;

    @GetMapping
    public List<ProdutoResponse> listar(@PathVariable Long restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Long restauranteId, @PathVariable Long id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponse criar(@PathVariable Long restauranteId, @Valid @RequestBody ProdutoRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable Long restauranteId, @PathVariable Long id,
                                     @Valid @RequestBody ProdutoRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long restauranteId, @PathVariable Long id) {
        service.excluir(restauranteId, id);
    }
}
