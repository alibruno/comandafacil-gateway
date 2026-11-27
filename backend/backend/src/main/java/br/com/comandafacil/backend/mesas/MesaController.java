package br.com.comandafacil.backend.mesas;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping
    public List<Mesa> findAll() {
        return mesaService.findAll();
    }

    @GetMapping("/{id}")
    public Mesa findById(@PathVariable @Min(1) Long id) {
        return mesaService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mesa create(@Valid @RequestBody MesaRequest request) {
        return mesaService.create(request);
    }

    @PutMapping("/{id}")
    public Mesa update(@PathVariable @Min(1) Long id, @Valid @RequestBody MesaRequest request) {
        return mesaService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Min(1) Long id) {
        mesaService.delete(id);
    }
}

record MesaRequest(
        @NotBlank String nome,
        @Min(1) int capacidade,
        @NotNull LocalDate dataCadastro,
        boolean disponivel) {
}
