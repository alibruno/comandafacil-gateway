package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoriaRequest(
        @NotBlank(message = "nome é obrigatório")
        String nome,

        boolean ativa
) {
}
