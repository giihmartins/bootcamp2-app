// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = "https://wfgtddoimsaoumqkfogc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZ3RkZG9pbXNhb3VtcWtmb2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0ODg2MDYsImV4cCI6MjEwOTA2NDYwNn0.qxSpH6JKH9YAwW-sUy_nrl3nM-arsaqqTh6HdrPpbz0";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const statusMessage = document.getElementById('status-message');
const resultsGrid = document.getElementById('results-grid');

// ==========================================
// PESQUISA NA OPEN LIBRARY API
// ==========================================
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    buscarLivros(query);
  }
});

async function buscarLivros(termo) {
  resultsGrid.innerHTML = '';
  statusMessage.className = 'status-message';
  statusMessage.textContent = 'A procurar livros... Por favor, aguarde.';

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(termo)}&limit=12`;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro no servidor (Código HTTP ${resposta.status})`);
    }

    const dados = await resposta.json();

    if (!dados.docs || dados.docs.length === 0) {
      statusMessage.textContent = 'Nenhum livro encontrado para o termo pesquisado. Tente outras palavras-chave.';
      return;
    }

    statusMessage.textContent = `A exibir resultados para "${termo}":`;
    renderizarLivros(dados.docs);

  } catch (erro) {
    statusMessage.className = 'status-message error';
    statusMessage.textContent = 'Ops! Ocorreu um erro ao procurar os dados. Verifique a sua ligação e tente novamente.';
    console.error('Erro detalhado na requisição:', erro);
  }
}

function renderizarLivros(livros) {
  resultsGrid.innerHTML = '';

  const placeholderSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="193" viewBox="0 0 128 193" fill="%23bdc3c7"><rect width="100%" height="100%" fill="%23ecf0f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%237f8c8d">Sem Capa</text></svg>`;

  livros.forEach(item => {
    const titulo = item.title || 'Título indisponível';
    const autores = item.author_name ? item.author_name.join(', ') : 'Autor desconhecido';
    const editora = item.publisher ? item.publisher[0] : 'Editora não informada';
    const dataPublicacao = item.first_publish_year ? item.first_publish_year : 'N/A';
    const paginas = item.number_of_pages_median ? `${item.number_of_pages_median} pág.` : 'Páginas N/A';
    
    const imagemCapa = item.cover_i 
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` 
      : placeholderSVG;

    const linkOficial = item.key ? `https://openlibrary.org${item.key}` : '#';
    const assunto = item.subject ? item.subject.slice(0, 3).join(', ') : 'Geral';

    // Tratamento de aspas para evitar erros na função de favoritar
    const tituloEscapado = titulo.replace(/'/g, "\\'");
    const autoresEscapados = autores.replace(/'/g, "\\'");

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-container">
        <img src="${imagemCapa}" alt="Capa do livro ${titulo}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${titulo}</h3>
        <p class="card-author">${autores}</p>
        <p class="card-info">🏢 ${editora} (${dataPublicacao})</p>
        <p class="card-info">📖 ${paginas}</p>
        <p class="card-description"><strong>Temas:</strong> ${assunto}</p>
        <div class="card-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${linkOficial}" target="_blank" rel="noopener noreferrer" class="card-link">Mais Detalhes</a>
          <button onclick="favoritarLivro('${tituloEscapado}', '${autoresEscapados}', '${imagemCapa}')" class="card-link" style="background-color: #f39c12; color: white; border: none; cursor: pointer;">⭐ Favoritar</button>
        </div>
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}

// ==========================================
// FUNÇÕES CRUD — SUPABASE
// ==========================================

// 1. CREATE — Salvar Livro Favorito
async function favoritarLivro(titulo, autor, capa) {
  const { data, error } = await _supabase
    .from("favoritos")
    .insert([{ titulo: titulo, autor: autor, capa: capa }]);

  if (error) {
    console.error("Erro ao guardar favorito:", error);
    alert("Erro ao guardar nos favoritos!");
  } else {
    alert(`"${titulo}" foi adicionado aos favoritos!`);
    listarFavoritos();
  }
}

// 2. READ — Listar Livros Favoritos do Banco
async function listarFavoritos() {
  const { data, error } = await _supabase
    .from("favoritos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao procurar favoritos:", error);
    return;
  }

  const conteiner = document.getElementById("lista-favoritos");
  if (!conteiner) return;

  conteiner.innerHTML = "";

  if (data.length === 0) {
    conteiner.innerHTML = "<p style='grid-column: 1/-1;'>Nenhum livro favorito guardado ainda.</p>";
    return;
  }

  data.forEach((livro) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-img-container">
        <img src="${livro.capa}" alt="Capa de ${livro.titulo}">
      </div>
      <div class="card-body">
        <h3 class="card-title">${livro.titulo}</h3>
        <p class="card-author">${livro.autor || 'Autor desconhecido'}</p>
        <button onclick="removerFavorito(${livro.id})" class="card-link" style="background-color: #e74c3c; color: white; border: none; cursor: pointer; margin-top: 10px;">🗑️ Remover</button>
      </div>
    `;
    conteiner.appendChild(card);
  });
}

// 3. DELETE — Remover dos Favoritos
async function removerFavorito(id) {
  const { error } = await _supabase
    .from("favoritos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover favorito:", error);
    alert("Erro ao remover o livro.");
  } else {
    listarFavoritos();
  }
}

// Torna as funções acessíveis globalmente para o onclick do HTML
window.favoritarLivro = favoritarLivro;
window.removerFavorito = removerFavorito;

// Carrega os favoritos guardados assim que a página é aberta
document.addEventListener("DOMContentLoaded", listarFavoritos);