package br.com.comandafacil.restaurantes.database.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "mesas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MesaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurante_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_mesa_restaurante"))
    private RestauranteEntity restaurante;

    private String nome;
    private int capacidade;
    private LocalDate dataCadastro;
    private boolean disponivel;
}
