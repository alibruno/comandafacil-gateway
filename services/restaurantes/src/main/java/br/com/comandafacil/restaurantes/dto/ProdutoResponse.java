package br.com.comandafacil.restaurantes.dto;

import br.com.comandafacil.restaurantes.database.model.ProdutoEntity;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoResponse(
        UUID id,
        UUID restauranteId,
        UUID categoriaId,
        String nome,
        String descricao,
        BigDecimal preco,
        boolean disponivel
) {
    public static ProdutoResponse from(ProdutoEntity produto) {
        return new ProdutoResponse(produto.getId(), produto.getRestaurante().getId(),
                produto.getCategoria() == null ? null : produto.getCategoria().getId(),
                produto.getNome(), produto.getDescricao(), produto.getPreco(), produto.isDisponivel());
    }
}
