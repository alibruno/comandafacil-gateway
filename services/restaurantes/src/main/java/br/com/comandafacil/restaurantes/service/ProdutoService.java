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
    public List<ProdutoResponse> listar() { return repository.findAll().stream().map(ProdutoResponse::from).toList(); }

    @Transactional(readOnly = true)
    public ProdutoResponse buscar(UUID id) { return ProdutoResponse.from(obter(id)); }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        return ProdutoResponse.from(repository.save(construir(request)));
    }

    @Transactional
    public ProdutoResponse atualizar(UUID id, ProdutoRequest request) {
        var produto = obter(id);
        var atualizado = construir(request);
        produto.setRestaurante(atualizado.getRestaurante());
        produto.setCategoria(atualizado.getCategoria());
        produto.setNome(atualizado.getNome());
        produto.setDescricao(atualizado.getDescricao());
        produto.setPreco(atualizado.getPreco());
        produto.setDisponivel(atualizado.isDisponivel());
        return ProdutoResponse.from(produto);
    }

    @Transactional
    public void excluir(UUID id) { repository.delete(obter(id)); }

    private ProdutoEntity construir(ProdutoRequest request) {
        return ProdutoEntity.builder().restaurante(restauranteService.obter(request.restauranteId()))
                .categoria(request.categoriaId() == null ? null : categoriaService.obter(request.categoriaId()))
                .nome(request.nome()).descricao(request.descricao()).preco(request.preco())
                .disponivel(request.disponivel()).build();
    }

    private ProdutoEntity obter(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }
}
