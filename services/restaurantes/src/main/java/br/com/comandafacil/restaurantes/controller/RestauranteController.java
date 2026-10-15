package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.RestauranteRequest;
import br.com.comandafacil.restaurantes.dto.RestauranteResponse;
import br.com.comandafacil.restaurantes.service.RestauranteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/restaurantes")
@RequiredArgsConstructor
public class RestauranteController {
    private final RestauranteService service;

    @GetMapping
    public List<RestauranteResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public RestauranteResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestauranteResponse criar(@Valid @RequestBody RestauranteRequest request) {
        return service.criar(request);
    }

    @PatchMapping("/{id}")
    public RestauranteResponse atualizar(@PathVariable Long id, @Valid @RequestBody RestauranteRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
