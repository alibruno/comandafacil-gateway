package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.CategoriaRequest;
import br.com.comandafacil.restaurantes.dto.CategoriaResponse;
import br.com.comandafacil.restaurantes.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/restaurantes/{restauranteId}/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService service;

    @GetMapping
    public List<CategoriaResponse> listar(@PathVariable Long restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public CategoriaResponse buscar(@PathVariable Long restauranteId, @PathVariable Long id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse criar(@PathVariable Long restauranteId, @Valid @RequestBody CategoriaRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable Long restauranteId, @PathVariable Long id,
                                       @Valid @RequestBody CategoriaRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long restauranteId, @PathVariable Long id) {
        service.excluir(restauranteId, id);
    }
}
