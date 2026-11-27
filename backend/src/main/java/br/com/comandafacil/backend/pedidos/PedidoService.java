package br.com.comandafacil.backend.pedidos;

import br.com.comandafacil.backend.mesas.MesaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidos;
    private final MesaRepository mesas;

    public PedidoService(PedidoRepository pedidos, MesaRepository mesas) {
        this.pedidos = pedidos;
        this.mesas = mesas;
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> findAll() {
        return pedidos.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse findById(String id) {
        return toResponse(pedidos.findById(parseId(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado.")));
    }

    public PedidoResponse create(PedidoRequest request) {
        validateTable(request.table());
        Pedido pedido = new Pedido(
                request.table().trim(), request.waiter().trim(), request.notes(), request.status());
        replaceItems(pedido, request.items());
        return toResponse(pedidos.save(pedido));
    }

    public PedidoResponse update(String id, PedidoRequest request) {
        Pedido pedido = pedidos.findById(parseId(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
        validateTable(request.table());
        pedido.setTableName(request.table().trim());
        pedido.setWaiter(request.waiter().trim());
        pedido.setNotes(request.notes());
        pedido.setStatus(request.status());
        pedido.clearItems();
        replaceItems(pedido, request.items());
        return toResponse(pedidos.save(pedido));
    }

    public void delete(String id) {
        pedidos.delete(pedidos.findById(parseId(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado.")));
    }

    private void replaceItems(Pedido pedido, List<PedidoItemRequest> items) {
        items.forEach(item -> pedido.addItem(new PedidoItem(
                item.name().trim(), item.detail(), item.unitPrice(), item.quantity(), item.note())));
    }

    private void validateTable(String tableName) {
        if (!mesas.existsByNome(tableName.trim())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cadastre a mesa antes de criar um pedido para ela.");
        }
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<PedidoItemResponse> items = pedido.getItems().stream()
                .map(item -> new PedidoItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getDetail(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getNote()))
                .toList();
        BigDecimal total = items.stream()
                .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PedidoResponse(
                String.format(Locale.ROOT, "PED-%04d", pedido.getId()),
                pedido.getTableName(),
                pedido.getWaiter(),
                items,
                pedido.getNotes(),
                total,
                pedido.getStatus(),
                pedido.getOpenedAt().toString());
    }

    private Long parseId(String id) {
        if (id == null || !id.matches("PED-\\d+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identificador de pedido inválido.");
        }
        return Long.parseLong(id.substring(4));
    }
}
