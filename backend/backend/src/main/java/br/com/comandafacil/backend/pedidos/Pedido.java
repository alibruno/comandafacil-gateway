package br.com.comandafacil.backend.pedidos;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mesa", nullable = false)
    private String tableName;

    @Column(nullable = false)
    private String waiter;

    @Column(nullable = false, length = 1000)
    private String notes;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private OffsetDateTime openedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "pedido_id", nullable = false)
    @OrderColumn(name = "item_order")
    private List<PedidoItem> items = new ArrayList<>();

    protected Pedido() {
    }

    public Pedido(String tableName, String waiter, String notes, String status) {
        this.tableName = tableName;
        this.waiter = waiter;
        this.notes = notes;
        this.status = status;
        this.openedAt = OffsetDateTime.now();
    }

    public void addItem(PedidoItem item) {
        items.add(item);
    }

    public void clearItems() {
        items.clear();
    }

    public Long getId() {
        return id;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getWaiter() {
        return waiter;
    }

    public void setWaiter(String waiter) {
        this.waiter = waiter;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getOpenedAt() {
        return openedAt;
    }

    public List<PedidoItem> getItems() {
        return items;
    }
}
