package br.com.comandafacil.restaurantes.database.repository;

import br.com.comandafacil.restaurantes.database.model.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, UUID> {
    List<CategoriaEntity> findAllByRestauranteId(UUID restauranteId);
}
