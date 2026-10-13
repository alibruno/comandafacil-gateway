package br.com.comandafacil.restaurantes.dto;

import br.com.comandafacil.restaurantes.database.model.CategoriaEntity;

import java.util.UUID;

public record CategoriaResponse(
        UUID id,
        UUID restauranteId,
        String nome,
        boolean ativa
) {
    public static CategoriaResponse from(CategoriaEntity categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getRestaurante().getId(),
                categoria.getNome(), categoria.isAtiva());
    }
}
