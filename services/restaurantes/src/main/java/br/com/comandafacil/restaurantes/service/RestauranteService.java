package br.com.comandafacil.restaurantes.service;

import br.com.comandafacil.restaurantes.dto.RestauranteRequest;
import br.com.comandafacil.restaurantes.dto.RestauranteResponse;
import br.com.comandafacil.restaurantes.exception.RecursoNaoEncontradoException;
import br.com.comandafacil.restaurantes.database.model.RestauranteEntity;
import br.com.comandafacil.restaurantes.database.repository.RestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class RestauranteService {
    private final RestauranteRepository repository;

    @Transactional(readOnly = true)
    public List<RestauranteResponse> listar() {
        return repository.findAll().stream().map(RestauranteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RestauranteResponse buscar(Long id) {
        return RestauranteResponse.from(obter(id));
    }

    @Transactional
    public RestauranteResponse criar(RestauranteRequest request) {
        return RestauranteResponse.from(repository.save(RestauranteEntity.builder()
                .nome(request.nome()).ativo(request.ativo()).build()));
    }

    @Transactional
    public RestauranteResponse atualizar(Long id, RestauranteRequest request) {
        var restaurante = obter(id);
        restaurante.setNome(request.nome());
        restaurante.setAtivo(request.ativo());
        return RestauranteResponse.from(restaurante);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(obter(id));
    }

    public RestauranteEntity obter(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante", id));
    }
}
