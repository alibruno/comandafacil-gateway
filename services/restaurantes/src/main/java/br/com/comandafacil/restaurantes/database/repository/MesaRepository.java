package br.com.comandafacil.restaurantes.database.repository;

import br.com.comandafacil.restaurantes.database.model.MesaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface MesaRepository extends JpaRepository<MesaEntity, UUID> {
    List<MesaEntity> findAllByRestauranteId(UUID restauranteId);
}
