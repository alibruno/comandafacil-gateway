package br.com.comandafacil.restaurantes.exception;

public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String recurso, Object id) {
        super("%s não encontrado: %s".formatted(recurso, id));
    }
}
