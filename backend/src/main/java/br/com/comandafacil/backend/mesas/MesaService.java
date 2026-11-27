package br.com.comandafacil.backend.mesas;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MesaService {

    private final MesaRepository mesas;

    public MesaService(MesaRepository mesas) {
        this.mesas = mesas;
    }

    public List<Mesa> findAll() {
        return mesas.findAll();
    }

    public Mesa findById(Long id) {
        return mesas.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mesa não encontrada."));
    }

    public Mesa create(MesaRequest request) {
        return mesas.save(new Mesa(
                request.nome().trim(), request.capacidade(), request.dataCadastro(), request.disponivel()));
    }

    public Mesa update(Long id, MesaRequest request) {
        Mesa mesa = findById(id);
        mesa.setNome(request.nome().trim());
        mesa.setCapacidade(request.capacidade());
        mesa.setDataCadastro(request.dataCadastro());
        mesa.setDisponivel(request.disponivel());
        return mesas.save(mesa);
    }

    public void delete(Long id) {
        mesas.delete(findById(id));
    }
}
