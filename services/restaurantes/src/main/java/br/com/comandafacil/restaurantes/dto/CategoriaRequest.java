package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CategoriaRequest(
        @NotNull
        UUID restauranteId,

        @NotBlank(message = "nome é obrigatório")
        String nome,

        boolean ativa
) {
}
