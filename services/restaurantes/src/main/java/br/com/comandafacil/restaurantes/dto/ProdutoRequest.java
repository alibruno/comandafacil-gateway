package br.com.comandafacil.restaurantes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoRequest(
        UUID categoriaId,

        @NotBlank(message = "nome é obrigatório")
        String nome,

        String descricao,

        @NotNull
        @DecimalMin(value = "0.01", message = "preço deve ser maior que zero")
        BigDecimal preco,

        boolean disponivel
) {
}
