// Importa o módulo Express
const express = require('express');

// Cria um roteador do Express
const routes = express.Router();

// Importa a conexão com o banco de dados
const db = require('../db/connect');

/**
 * Rota GET /
 * Lista todos os clientes da tabela 'cliente'
 */
routes.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cliente'); // Executa a consulta SQL
    res.status(200).json(result.rows); // Retorna os clientes encontrados
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar clientes' }); // Retorna erro interno do servidor
  }
});

/**
 * Rota POST /
 * Cria um novo cliente com os dados enviados no corpo da requisição
 */
routes.post('/', async (req, res) => {
  const { nome, email, telefone, endereco, cidade, uf } = req.body;

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !email || !telefone || !endereco || !cidade || !uf) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios'
    });
  }

  try {
    // Comando SQL para inserir um novo cliente
    const sql = `
      INSERT INTO cliente (nome, email, telefone, endereco, cidade, uf)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const valores = [nome, email, telefone, endereco, cidade, uf];

    const result = await db.query(sql, valores); // Executa a inserção
    res.status(201).json(result.rows[0]); // Retorna o cliente criado
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar cliente' }); // Retorna erro interno
  }
});

/**
 * Rota PUT /:id
 * Atualiza um cliente existente com base no ID fornecido na URL
 */
routes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, endereco, cidade, uf } = req.body;

  // Verifica se o ID foi fornecido
  if (!id) {
    return res.status(400).json({
      mensagem: 'O id precisa ser informado'
    });
  }

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !email || !telefone || !endereco || !cidade || !uf) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
  }

  try {
    // Comando SQL para atualizar o cliente
    const sql = `
      UPDATE cliente
      SET nome = $1, email = $2, telefone = $3, endereco = $4, cidade = $5, uf = $6
      WHERE id = $7
      RETURNING *`;
    const valores = [nome, email, telefone, endereco, cidade, uf, id];

    const result = await db.query(sql, valores); // Executa a atualização

    // Verifica se algum cliente foi atualizado
    if (result.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Cliente não encontrado.'
      });
    }

    res.status(200).json(result.rows[0]); // Retorna o cliente atualizado
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar cliente' }); // Retorna erro interno
  }
});

/**
 * Rota DELETE /:id
 * Exclui um cliente com base no ID fornecido na URL
 */
routes.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Verifica se o ID foi fornecido
  if (!id) {
    return res.status(400).json({
      mensagem: 'O id precisa ser informado'
    });
  }

  try {
    // Comando SQL para deletar o cliente
    const sql = `DELETE FROM cliente WHERE id = $1 RETURNING *`;
    const result = await db.query(sql, [id]); // Executa a exclusão

    // Verifica se algum cliente foi excluído
    if (result.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Cliente não encontrado.'
      });
    }

    res.status(200).json({
      mensagem: `Cliente com ID ${id} excluído com sucesso`
    }); // Confirma exclusão
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir cliente' }); // Retorna erro interno
  }
});

// Exporta o roteador para ser usado em outros arquivos
module.exports = routes;
