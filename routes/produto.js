// Importa o módulo Express
const express = require('express');

// Cria um roteador do Express
const routes = express.Router();

// Importa a conexão com o banco de dados
const db = require('../db/connect');

/**
 * Rota GET /
 * Lista todos os produtos da tabela 'produto'
 */
routes.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM produto'); // Executa a consulta SQL
    res.status(200).json(result.rows); // Retorna os produtos encontrados
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' }); // Retorna erro interno do servidor
  }
});

/**
 * Rota POST /
 * Cria um novo produto com os dados enviados no corpo da requisição
 */
routes.post('/', async (req, res) => {
  const { nome, marca, preco, peso } = req.body;

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !marca || preco == null || peso == null) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios: nome, marca, preco, peso'
    });
  }

  try {
    // Comando SQL para inserir um novo produto
    const sql = `
      INSERT INTO produto (nome, marca, preco, peso)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const valores = [nome, marca, preco, peso];

    const result = await db.query(sql, valores); // Executa a inserção
    res.status(201).json(result.rows[0]); // Retorna o produto criado
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar produto' }); // Retorna erro interno
  }
});

/**
 * Rota PUT /:id
 * Atualiza um produto existente com base no ID fornecido na URL
 */
routes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, marca, preco, peso } = req.body;

  // Verifica se o ID foi fornecido
  if (!id) {
    return res.status(400).json({ mensagem: 'O id precisa ser informado' });
  }

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !marca || preco == null || peso == null) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
  }

  try {
    // Comando SQL para atualizar o produto
    const sql = `
      UPDATE produto
      SET nome = $1, marca = $2, preco = $3, peso = $4
      WHERE id = $5
      RETURNING *`;
    const valores = [nome, marca, preco, peso, id];

    const result = await db.query(sql, valores); // Executa a atualização

    // Verifica se algum produto foi atualizado
    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    res.status(200).json(result.rows[0]); // Retorna o produto atualizado
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar produto' }); // Retorna erro interno
  }
});

/**
 * Rota DELETE /:id
 * Exclui um produto com base no ID fornecido na URL
 */
routes.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Verifica se o ID foi fornecido
  if (!id) {
    return res.status(400).json({ mensagem: 'O id precisa ser informado' });
  }

  try {
    // Comando SQL para deletar o produto
    const sql = `DELETE FROM produto WHERE id = $1 RETURNING *`;
    const result = await db.query(sql, [id]); // Executa a exclusão

    // Verifica se algum produto foi excluído
    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    res.status(200).json({ mensagem: `Produto com ID ${id} excluído com sucesso` }); // Confirma exclusão
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir produto' }); // Retorna erro interno
  }
});

// Exporta o roteador para ser usado em outros arquivos
module.exports = routes;
