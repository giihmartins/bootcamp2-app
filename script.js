const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const statusMessage = document.getElementById('status-message');
const resultsGrid = document.getElementById('results-grid');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    buscarLivros(query);
  }
});

async function buscarLivros(termo) {
  // Limpa os resultados anteriores e exibe o estado de carregamento
  resultsGrid.innerHTML = '';
  statusMessage.className = 'status-message';
  statusMessage.textContent = 'A procurar livros... Por favor, aguarde.';

  // Endpoint da Open Library API (sem restrições de bloqueio)
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

  // Imagem SVG padrão local embutida
  const placeholderSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="193" viewBox="0 0 128 193" fill="%23bdc3c7"><rect width="100%" height="100%" fill="%23ecf0f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%237f8c8d">Sem Capa</text></svg>`;

  livros.forEach(item => {
    // Extração segura dos campos do JSON da Open Library
    const titulo = item.title || 'Título indisponível';
    const autores = item.author_name ? item.author_name.join(', ') : 'Autor desconhecido';
    const editora = item.publisher ? item.publisher[0] : 'Editora não informada';
    const dataPublicacao = item.first_publish_year ? item.first_publish_year : 'N/A';
    const paginas = item.number_of_pages_median ? `${item.number_of_pages_median} pág.` : 'Páginas N/A';
    
    // Capa do livro via Open Library Covers API
    const imagemCapa = item.cover_i 
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` 
      : placeholderSVG;

    const linkOficial = item.key ? `https://openlibrary.org${item.key}` : '#';
    const assunto = item.subject ? item.subject.slice(0, 3).join(', ') : 'Geral';

    // Construção do Card
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
        <a href="${linkOficial}" target="_blank" rel="noopener noreferrer" class="card-link">Mais Detalhes</a>
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}