package br.com.comandafacil.restaurantes.database.repository;

import br.com.comandafacil.restaurantes.database.model.ProdutoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<ProdutoEntity, Long> {
    List<ProdutoEntity> findAllByRestauranteId(Long restauranteId);
}
