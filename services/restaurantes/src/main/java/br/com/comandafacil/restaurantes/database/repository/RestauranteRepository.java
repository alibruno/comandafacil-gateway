package br.com.comandafacil.restaurantes.database.repository;

import br.com.comandafacil.restaurantes.database.model.RestauranteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RestauranteRepository extends JpaRepository<RestauranteEntity, UUID> {
}
