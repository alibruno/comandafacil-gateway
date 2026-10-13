package br.com.comandafacil.restaurantes.service;

import br.com.comandafacil.restaurantes.dto.MesaRequest;
import br.com.comandafacil.restaurantes.dto.MesaResponse;
import br.com.comandafacil.restaurantes.exception.RecursoNaoEncontradoException;
import br.com.comandafacil.restaurantes.database.model.MesaEntity;
import br.com.comandafacil.restaurantes.database.repository.MesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MesaService {
    private final MesaRepository repository;
    private final RestauranteService restauranteService;

    @Transactional(readOnly = true)
    public List<MesaResponse> listar() { return repository.findAll().stream().map(MesaResponse::from).toList(); }

    @Transactional(readOnly = true)
    public MesaResponse buscar(UUID id) { return MesaResponse.from(obter(id)); }

    @Transactional
    public MesaResponse criar(MesaRequest request) {
        return MesaResponse.from(repository.save(MesaEntity.builder()
                .restaurante(restauranteService.obter(request.restauranteId())).nome(request.nome())
                .capacidade(request.capacidade()).dataCadastro(LocalDate.now())
                .disponivel(request.disponivel()).build()));
    }

    @Transactional
    public MesaResponse atualizar(UUID id, MesaRequest request) {
        var mesa = obter(id);
        mesa.setRestaurante(restauranteService.obter(request.restauranteId()));
        mesa.setNome(request.nome());
        mesa.setCapacidade(request.capacidade());
        mesa.setDisponivel(request.disponivel());
        return MesaResponse.from(mesa);
    }

    @Transactional
    public void excluir(UUID id) { repository.delete(obter(id)); }

    private MesaEntity obter(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Mesa", id));
    }
}
