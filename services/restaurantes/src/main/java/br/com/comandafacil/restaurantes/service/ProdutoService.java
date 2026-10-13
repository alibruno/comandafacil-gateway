package br.com.comandafacil.restaurantes.service;

import br.com.comandafacil.restaurantes.dto.ProdutoRequest;
import br.com.comandafacil.restaurantes.dto.ProdutoResponse;
import br.com.comandafacil.restaurantes.exception.RecursoNaoEncontradoException;
import br.com.comandafacil.restaurantes.database.model.ProdutoEntity;
import br.com.comandafacil.restaurantes.database.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository repository;
    private final RestauranteService restauranteService;
    private final CategoriaService categoriaService;

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar(UUID restauranteId) {
        restauranteService.obter(restauranteId);
        return repository.findAllByRestauranteId(restauranteId).stream().map(ProdutoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscar(UUID restauranteId, UUID id) {
        return ProdutoResponse.from(obter(restauranteId, id));
    }

    @Transactional
    public ProdutoResponse criar(UUID restauranteId, ProdutoRequest request) {
        return ProdutoResponse.from(repository.save(construir(restauranteId, request)));
    }

    @Transactional
    public ProdutoResponse atualizar(UUID restauranteId, UUID id, ProdutoRequest request) {
        var produto = obter(restauranteId, id);
        var atualizado = construir(restauranteId, request);
        produto.setRestaurante(atualizado.getRestaurante());
        produto.setCategoria(atualizado.getCategoria());
        produto.setNome(atualizado.getNome());
        produto.setDescricao(atualizado.getDescricao());
        produto.setPreco(atualizado.getPreco());
        produto.setDisponivel(atualizado.isDisponivel());
        return ProdutoResponse.from(produto);
    }

    @Transactional
    public void excluir(UUID restauranteId, UUID id) { repository.delete(obter(restauranteId, id)); }

    private ProdutoEntity construir(UUID restauranteId, ProdutoRequest request) {
        return ProdutoEntity.builder().restaurante(restauranteService.obter(restauranteId))
                .categoria(request.categoriaId() == null ? null : categoriaService.obter(restauranteId, request.categoriaId()))
                .nome(request.nome()).descricao(request.descricao()).preco(request.preco())
                .disponivel(request.disponivel()).build();
    }

    private ProdutoEntity obter(UUID restauranteId, UUID id) {
        return repository.findById(id)
                .filter(produto -> produto.getRestaurante().getId().equals(restauranteId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }
}
