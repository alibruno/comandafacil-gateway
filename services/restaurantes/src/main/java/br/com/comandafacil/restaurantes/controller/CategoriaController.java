package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.CategoriaRequest;
import br.com.comandafacil.restaurantes.dto.CategoriaResponse;
import br.com.comandafacil.restaurantes.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurantes/{restauranteId}/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService service;

    @GetMapping
    public List<CategoriaResponse> listar(@PathVariable UUID restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public CategoriaResponse buscar(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse criar(@PathVariable UUID restauranteId, @Valid @RequestBody CategoriaRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable UUID restauranteId, @PathVariable UUID id,
                                       @Valid @RequestBody CategoriaRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        service.excluir(restauranteId, id);
    }
}
