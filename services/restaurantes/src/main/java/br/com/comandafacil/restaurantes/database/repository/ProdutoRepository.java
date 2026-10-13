package br.com.comandafacil.restaurantes.database.repository;

import br.com.comandafacil.restaurantes.database.model.ProdutoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProdutoRepository extends JpaRepository<ProdutoEntity, UUID> {
}
