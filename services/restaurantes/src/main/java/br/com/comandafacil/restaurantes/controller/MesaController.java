package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.MesaRequest;
import br.com.comandafacil.restaurantes.dto.MesaResponse;
import br.com.comandafacil.restaurantes.service.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurantes/{restauranteId}/mesas")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService service;

    @GetMapping
    public List<MesaResponse> listar(@PathVariable UUID restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public MesaResponse buscar(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MesaResponse criar(@PathVariable UUID restauranteId, @Valid @RequestBody MesaRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public MesaResponse atualizar(@PathVariable UUID restauranteId, @PathVariable UUID id,
                                  @Valid @RequestBody MesaRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID restauranteId, @PathVariable UUID id) {
        service.excluir(restauranteId, id);
    }
}
