export type ModalMode = 'create' | 'view' | 'edit' | 'delete';

export interface Mesa {
  id: number;
  nome: string;
  capacidade: number;
  dataCadastro: string;
  disponivel: boolean;
}

export interface MesaDraft {
  nome: string;
  capacidade: number;
  dataCadastro: string;
  disponivel: boolean;
}