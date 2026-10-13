package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MesaRequest(
        @NotNull
        UUID restauranteId,

        @NotBlank(message = "nome é obrigatório")
        String nome,

        @Min(value = 1, message = "capacidade deve ser maior que zero")
        int capacidade,

        boolean disponivel
) {
}
