package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MesaRequest(
        @NotBlank(message = "nome é obrigatório")
        String nome,

        @Min(value = 1, message = "capacidade deve ser maior que zero")
        int capacidade,

        boolean disponivel
) {
}
