package br.com.comandafacil.backend.pedidos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "itens_pedido")
public class PedidoItem {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String detail;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private String note;

    protected PedidoItem() {
    }

    public PedidoItem(String name, String detail, BigDecimal unitPrice, int quantity, String note) {
        this.name = name;
        this.detail = detail;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.note = note;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDetail() {
        return detail;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getNote() {
        return note;
    }
}
