package br.com.comandafacil.restaurantes.controller;

import br.com.comandafacil.restaurantes.dto.MesaRequest;
import br.com.comandafacil.restaurantes.dto.MesaResponse;
import br.com.comandafacil.restaurantes.service.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/restaurantes/{restauranteId}/mesas")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService service;

    @GetMapping
    public List<MesaResponse> listar(@PathVariable Long restauranteId) {
        return service.listar(restauranteId);
    }

    @GetMapping("/{id}")
    public MesaResponse buscar(@PathVariable Long restauranteId, @PathVariable Long id) {
        return service.buscar(restauranteId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MesaResponse criar(@PathVariable Long restauranteId, @Valid @RequestBody MesaRequest request) {
        return service.criar(restauranteId, request);
    }

    @PatchMapping("/{id}")
    public MesaResponse atualizar(@PathVariable Long restauranteId, @PathVariable Long id,
                                  @Valid @RequestBody MesaRequest request) {
        return service.atualizar(restauranteId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long restauranteId, @PathVariable Long id) {
        service.excluir(restauranteId, id);
    }
}
