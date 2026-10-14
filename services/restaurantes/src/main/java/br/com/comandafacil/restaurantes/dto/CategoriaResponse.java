package br.com.comandafacil.restaurantes.dto;

import br.com.comandafacil.restaurantes.database.model.CategoriaEntity;

public record CategoriaResponse(
        Long id,

        Long restauranteId,
        String nome,
        boolean ativa
) {
    public static CategoriaResponse from(CategoriaEntity categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getRestaurante().getId(),
                categoria.getNome(), categoria.isAtiva());
    }
}
