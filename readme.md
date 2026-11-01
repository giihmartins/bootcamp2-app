# 📚 Book Explorer — Explorador de Livros

## 👤 Autoria
* **Nome:** Giovanna Martins
* **Matrícula:** 22610329
* **GitHub:** [@giihmartins](https://github.com/giihmartins)

---

## 🚀 Links do Projeto
* **Site Publicado (GitHub Pages):** [https://giihmartins.github.io/bootcamp2-app/](https://giihmartins.github.io/bootcamp2-app/)
* **Repositório do Código:** [https://github.com/giihmartins/bootcamp2-app](https://github.com/giihmartins/bootcamp2-app)
* **Repositório Docker Hub:** [https://hub.docker.com/r/giovanna12213/book-explorer](https://hub.docker.com/r/giovanna12213/book-explorer)

---

## 📌 Sobre o Projeto
O **Book Explorer** permite que os utilizadores pesquisem por títulos de livros ou autores via Open Library API, visualizem capas, detalhes e guardem as suas obras favoritas com persistência em banco de dados real.

---

## 🗄️ Persistência de Dados (Supabase)
A aplicação utiliza o **Supabase (PostgreSQL)** para persistência remota dos dados.

* **Banco Escolhido:** Supabase (PostgreSQL)
* **Tabela:** `favoritos`
* **Campos Armazenados:**
  * `id` (int8 / chave primária)
  * `created_at` (timestamp)
  * `titulo` (text)
  * `autor` (text)
  * `capa` (text - URL da imagem)
* **Operações CRUD:**
  * **Create:** Botão "⭐ Favoritar" insere um novo registo no Supabase.
  * **Read:** Secção "⭐ Meus Livros Favoritos" consulta e renderiza a lista ao carregar a página.
  * **Delete:** Botão "🗑️ Remover" elimina o registo do banco pelo `id`.
* **Limitação Conhecida de Segurança:** As políticas de acesso (RLS) estão configuradas para permitir leitura e escrita públicas via chave `anon`.

---

## 🐳 Como rodar com Docker

Para executar o container em uma máquina limpa:

```bash
docker run -d -p 8085:80 giovanna12213/book-explorer:latest