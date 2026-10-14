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
@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository repository;
    private final RestauranteService restauranteService;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar(Long restauranteId) {
        restauranteService.obter(restauranteId);
        return repository.findAllByRestauranteId(restauranteId).stream().map(CategoriaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscar(Long restauranteId, Long id) {
        return CategoriaResponse.from(obter(restauranteId, id));
    }

    @Transactional
    public CategoriaResponse criar(Long restauranteId, CategoriaRequest request) {
        return CategoriaResponse.from(repository.save(CategoriaEntity.builder()
                .restaurante(restauranteService.obter(restauranteId))
                .nome(request.nome()).ativa(request.ativa()).build()));
    }

    @Transactional
    public CategoriaResponse atualizar(Long restauranteId, Long id, CategoriaRequest request) {
        var categoria = obter(restauranteId, id);
        categoria.setNome(request.nome());
        categoria.setAtiva(request.ativa());
        return CategoriaResponse.from(categoria);
    }

    @Transactional
    public void excluir(Long restauranteId, Long id) { repository.delete(obter(restauranteId, id)); }

    public CategoriaEntity obter(Long restauranteId, Long id) {
        return repository.findById(id)
                .filter(categoria -> categoria.getRestaurante().getId().equals(restauranteId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
