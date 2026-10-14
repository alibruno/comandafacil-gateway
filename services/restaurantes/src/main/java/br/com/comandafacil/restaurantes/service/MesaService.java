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
@Service
@RequiredArgsConstructor
public class MesaService {
    private final MesaRepository repository;
    private final RestauranteService restauranteService;

    @Transactional(readOnly = true)
    public List<MesaResponse> listar(Long restauranteId) {
        restauranteService.obter(restauranteId);
        return repository.findAllByRestauranteId(restauranteId).stream().map(MesaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public MesaResponse buscar(Long restauranteId, Long id) {
        return MesaResponse.from(obter(restauranteId, id));
    }

    @Transactional
    public MesaResponse criar(Long restauranteId, MesaRequest request) {
        return MesaResponse.from(repository.save(MesaEntity.builder()
                .restaurante(restauranteService.obter(restauranteId)).nome(request.nome())
                .capacidade(request.capacidade()).dataCadastro(LocalDate.now())
                .disponivel(request.disponivel()).build()));
    }

    @Transactional
    public MesaResponse atualizar(Long restauranteId, Long id, MesaRequest request) {
        var mesa = obter(restauranteId, id);
        mesa.setNome(request.nome());
        mesa.setCapacidade(request.capacidade());
        mesa.setDisponivel(request.disponivel());
        return MesaResponse.from(mesa);
    }

    @Transactional
    public void excluir(Long restauranteId, Long id) { repository.delete(obter(restauranteId, id)); }

    private MesaEntity obter(Long restauranteId, Long id) {
        return repository.findById(id)
                .filter(mesa -> mesa.getRestaurante().getId().equals(restauranteId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mesa", id));
    }
}
