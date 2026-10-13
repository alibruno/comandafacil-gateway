package br.com.comandafacil.restaurantes.dto;

import br.com.comandafacil.restaurantes.database.model.MesaEntity;

import java.time.LocalDate;
public record MesaResponse(
        Long id,

        Long restauranteId,
        String nome,
        int capacidade,
        LocalDate dataCadastro,
        boolean disponivel
) {
    public static MesaResponse from(MesaEntity mesa) {
        return new MesaResponse(mesa.getId(), mesa.getRestaurante().getId(), mesa.getNome(),
                mesa.getCapacidade(), mesa.getDataCadastro(), mesa.isDisponivel());
    }
}
