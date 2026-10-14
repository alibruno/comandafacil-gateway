package br.com.comandafacil.restaurantes.dto;

import br.com.comandafacil.restaurantes.database.model.RestauranteEntity;

public record RestauranteResponse(
        Long id,
        String nome,
        boolean ativo
) {
    public static RestauranteResponse from(RestauranteEntity restaurante) {
        return new RestauranteResponse(restaurante.getId(), restaurante.getNome(), restaurante.isAtivo());
    }
}
