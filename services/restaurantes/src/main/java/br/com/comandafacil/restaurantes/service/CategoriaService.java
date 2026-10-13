package br.com.comandafacil.restaurantes.service;

import br.com.comandafacil.restaurantes.dto.CategoriaRequest;
import br.com.comandafacil.restaurantes.dto.CategoriaResponse;
import br.com.comandafacil.restaurantes.exception.RecursoNaoEncontradoException;
import br.com.comandafacil.restaurantes.database.model.CategoriaEntity;
import br.com.comandafacil.restaurantes.database.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository repository;
    private final RestauranteService restauranteService;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() { return repository.findAll().stream().map(CategoriaResponse::from).toList(); }

    @Transactional(readOnly = true)
    public CategoriaResponse buscar(UUID id) { return CategoriaResponse.from(obter(id)); }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        return CategoriaResponse.from(repository.save(CategoriaEntity.builder()
                .restaurante(restauranteService.obter(request.restauranteId()))
                .nome(request.nome()).ativa(request.ativa()).build()));
    }

    @Transactional
    public CategoriaResponse atualizar(UUID id, CategoriaRequest request) {
        var categoria = obter(id);
        categoria.setRestaurante(restauranteService.obter(request.restauranteId()));
        categoria.setNome(request.nome());
        categoria.setAtiva(request.ativa());
        return CategoriaResponse.from(categoria);
    }

    @Transactional
    public void excluir(UUID id) { repository.delete(obter(id)); }

    public CategoriaEntity obter(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
