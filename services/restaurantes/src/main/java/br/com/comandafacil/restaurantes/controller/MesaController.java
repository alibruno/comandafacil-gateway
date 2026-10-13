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
@RequestMapping("/restaurantes/mesas")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService service;

    @GetMapping
    public List<MesaResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public MesaResponse buscar(@PathVariable UUID id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MesaResponse criar(@Valid @RequestBody MesaRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public MesaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody MesaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) {
        service.excluir(id);
    }
}
