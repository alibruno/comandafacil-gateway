package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.NotBlank;

public record RestauranteRequest(
        @NotBlank(message = "nome é obrigatório")
        String nome,

        boolean ativo
) {
}
