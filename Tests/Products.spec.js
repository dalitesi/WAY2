import request from "../config/request";

describe("Cenários de sucesso - E-Commerce venda de produtos", () => {
  test("Listar produtos", async () => {
    const res = await request.get("produto");

    expect(res.headers).toHaveProperty(
      "content-type",
      "application/json; charset=utf-8"
    );

    expect(res.status).toBe(200);
    // Verifica se os atributos existem no primeiro item do array
    expect(res.body[0]).toHaveProperty("sku");
    expect(res.body[0]).toHaveProperty("descricao");
    expect(res.body[0]).toHaveProperty("precoUnitario");
    expect(res.body[0]).toHaveProperty("quantidade");
  });

  test("Adiciona produtos no carrinho", async () => {
    const res = await request.post(
      "compra/carrinho/654/adicionarProduto?quantidade=10"
    );

    expect(res.headers).toHaveProperty(
      "content-type",
      "text/plain; charset=utf-8"
    );

    expect(res.status).toBe(200);
    //Verica texto no json
    expect(res.text).toBe("Produto 654 adicionado ao carrinho com sucesso");
  });

  test("Listar produtos do carrinho", async () => {
    const res = await request.get("produto");

    expect(res.headers).toHaveProperty(
      "content-type",
      "application/json; charset=utf-8"
    );

    expect(res.status).toBe(200);
    // Verifica se existe os atríbutos sku, descrição e seus valores
    expect(res.body.some((item) => item.sku === 654)).toBe(true);
    expect(
      res.body.some((item) => item.descricao === "Fogão Elétrico Eletrolux")
    ).toBe(true);
  });

  test("Finaliza compra", async () => {
    const res = await request.post("compra/finalizar");

    expect(res.headers).toHaveProperty(
      "content-type",
      "text/plain; charset=utf-8"
    );

    expect(res.status).toBe(200);
    //Verica texto no json
    expect(res.text.includes("Fogão Elétrico Eletrolux")).toBe(true);
  });

  test("Exclui produtos do carrinho", async () => {
    const res = await request.delete(
      "compra/carrinho/654/removerProduto?quantidade=1"
    );

    expect(res.headers).toHaveProperty(
      "content-type",
      "text/plain; charset=utf-8"
    );

    expect(res.status).toBe(200);
    //Verica texto no json
    expect(
      res.text.includes("Produto 654 removido do carrinho com sucesso")
    ).toBe(true);
  });
});

describe("Cenários de erro - E-Commerce venda de produtos", () => {
  test("Erro ao consultar estoque informando produto inválido", async () => {
    const res = await request.get("produto/Geladeira/estoque");

    expect(res.headers).toHaveProperty(
      "content-type",
      "text/plain; charset=utf-8"
    );

    expect(res.status).toBe(404);
    //Verica texto no json
    expect(
      res.text.includes(
        "Não foi encontrado estoque disponível para o produto Geladeira"
      )
    ).toBe(true);
  });

  test("Erro ao consultar estoque quando o produto não for informado", async () => {
    const res = await request.get("produto/estoque");

    //Verifica status code 404
    expect(res.status).toBe(404);
  });

  test("Erro ao adicionar produto no carrinho quando a quantidade não for informada", async () => {
    const res = await request.post(
      "compra/carrinho/654/adicionarProduto?quantidade="
    );

    expect(res.status).toBe(400);
    //Verica atríbutos no json
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("errors");
    expect(res.body).toHaveProperty("traceId");
  });

  test("Erro ao adicionar produto no carrinho quando o sku for inválido", async () => {
    const res = await request.post(
      "compra/carrinho/1111/adicionarProduto?quantidade=1"
    );
    //Verifica status code 500
    expect(res.status).toBe(500);
  });

  test("Erro ao adicionar produto no carrinho quando o sku for inválido e quantidade for vazia", async () => {
    const res = await request.post(
      "compra/carrinho/111/adicionarProduto?quantidade="
    );

    expect(res.status).toBe(400);
    //Verica atríbutos no json
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("errors");
    expect(res.body).toHaveProperty("traceId");
  });

  test("Erro ao excluir produtos do carrinho quando sku for vazio", async () => {
    const res = await request.delete(
      "compra/carrinho/removerProduto?quantidade=5"
    );

    //Verifica status code 404
    expect(res.status).toBe(404);
  });

  test("Erro ao remover produto do carrinho quando a quantidade não for informada", async () => {
    const res = await request.delete(
      "compra/carrinho/654/removerProduto?quantidade"
    );

    expect(res.headers).toHaveProperty(
      "content-type",
      "application/problem+json; charset=utf-8"
    );

    expect(res.status).toBe(400);
    //Verica atríbutos no json
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("errors");
    expect(res.body).toHaveProperty("traceId");
  });

  test("Erro ao remover produto do carrinho quando a quantidade e sku do produto não forem informadas", async () => {
    const res = await request.delete(
      "compra/carrinho/removerProduto?quantidade="
    );

    //Verifica status code 404
    expect(res.status).toBe(404);
  });
});
