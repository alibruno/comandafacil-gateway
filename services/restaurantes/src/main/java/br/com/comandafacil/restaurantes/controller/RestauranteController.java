package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.RestauranteRequest;
import br.com.comandafacil.restaurantes.dto.RestauranteResponse;
import br.com.comandafacil.restaurantes.service.RestauranteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurantes")
@RequiredArgsConstructor
public class RestauranteController {
    private final RestauranteService service;

    @GetMapping
    public List<RestauranteResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public RestauranteResponse buscar(@PathVariable UUID id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestauranteResponse criar(@Valid @RequestBody RestauranteRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public RestauranteResponse atualizar(@PathVariable UUID id, @Valid @RequestBody RestauranteRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) {
        service.excluir(id);
    }
}
