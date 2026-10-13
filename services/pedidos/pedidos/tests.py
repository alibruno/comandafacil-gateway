import uuid
from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Pedido


class PedidoApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("pedido-list")
        self.payload = {
            "mesaId": str(uuid.uuid4()),
            "garcomId": str(uuid.uuid4()),
            "notas": "Sem cebola",
            "itens": [
                {
                    "produtoId": str(uuid.uuid4()),
                    "nomeProduto": "Hambúrguer",
                    "precoUnitario": "25.50",
                    "quantidade": 2,
                    "observacao": "Bem passado",
                },
                {
                    "produtoId": str(uuid.uuid4()),
                    "nomeProduto": "Suco",
                    "precoUnitario": "8.00",
                    "quantidade": 1,
                },
            ],
        }

    def test_cria_pedido_com_total_calculado_e_snapshot_dos_itens(self):
        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["total"], "59.00")
        self.assertEqual(len(response.data["itens"]), 2)
        self.assertEqual(response.data["status"], Pedido.Status.COZINHA)
        self.assertIsNone(response.data["finalizadoEm"])

        pedido = Pedido.objects.get(pk=response.data["id"])
        self.assertEqual(
            pedido.itens.get(nome_produto="Hambúrguer").preco_unitario, Decimal("25.50")
        )

    def test_rejeita_pedido_sem_itens_e_preco_invalido(self):
        sem_itens = {**self.payload, "itens": []}
        response_sem_itens = self.client.post(self.url, sem_itens, format="json")
        self.assertEqual(response_sem_itens.status_code, 400)
        self.assertIn("itens", response_sem_itens.data)

        preco_invalido = {
            **self.payload,
            "itens": [{**self.payload["itens"][0], "precoUnitario": "0.00"}],
        }
        response_preco = self.client.post(self.url, preco_invalido, format="json")
        self.assertEqual(response_preco.status_code, 400)

        total_excedido = {
            **self.payload,
            "itens": [
                {
                    **self.payload["itens"][0],
                    "precoUnitario": "99999999.99",
                    "quantidade": 101,
                }
            ],
        }
        response_total = self.client.post(self.url, total_excedido, format="json")
        self.assertEqual(response_total.status_code, 400)

    def test_atualiza_itens_e_calcula_data_de_finalizacao(self):
        criado = self.client.post(self.url, self.payload, format="json")
        item = {**self.payload["itens"][0], "precoUnitario": "30.00", "quantidade": 1}

        response = self.client.patch(
            reverse("pedido-detail", args=[criado.data["id"]]),
            {"status": Pedido.Status.FINALIZADO, "itens": [item]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], "30.00")
        self.assertIsNotNone(response.data["finalizadoEm"])

        reaberto = self.client.patch(
            reverse("pedido-detail", args=[criado.data["id"]]),
            {"status": Pedido.Status.PRONTO},
            format="json",
        )
        self.assertEqual(reaberto.status_code, 200)
        self.assertIsNone(reaberto.data["finalizadoEm"])

    def test_lista_filtra_por_status_e_permite_excluir(self):
        criado = self.client.post(self.url, self.payload, format="json")
        response = self.client.get(self.url, {"status": Pedido.Status.PRONTO})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
        self.assertEqual(self.client.get(self.url, {"status": "invalido"}).status_code, 400)
        self.assertEqual(
            self.client.delete(reverse("pedido-detail", args=[criado.data["id"]])).status_code,
            204,
        )

    def test_disponibiliza_documentacao_openapi_e_swagger(self):
        schema = self.client.get("/api/schema/")
        docs = self.client.get("/api/docs/")
        home = self.client.get("/")

        self.assertEqual(schema.status_code, 200)
        self.assertIn("/api/pedidos/", schema.data["paths"])
        self.assertEqual(docs.status_code, 200)
        self.assertRedirects(home, "/api/docs/", fetch_redirect_response=False)
