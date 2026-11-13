(() => {
  'use strict';

  // ---------- Configurações ----------
  const CHAVE_ITENS = 'aproveita:itens';
  const CHAVE_LOG = 'aproveita:log';
  const MAX_LOG = 50;
  const CAMPOS = ['nome', 'categoria', 'quantidade', 'unidade', 'destino', 'obs'];
  const CATEGORIAS = ['Frutas e verduras', 'Pães e massas', 'Laticínios', 'Carnes e ovos', 'Outros'];
  const UNIDADES = ['g', 'kg', 'un'];
  const DESTINOS = {
    compostagem: { rotulo: 'Compostagem', dica: 'Cascas, borra de café e folhas vão bem na composteira. Evite carnes e laticínios.' },
    receita: { rotulo: 'Reaproveitar em receita', dica: 'Talos, cascas e pão amanhecido rendem caldos, farofas e chips assados.' },
    doacao: { rotulo: 'Doação', dica: 'Alimento bom e dentro da validade pode ir para um banco de alimentos.' },
    descarte: { rotulo: 'Descarte', dica: 'Descarte só o que não tem uso e separe orgânicos de recicláveis.' }
  };
  const MSG_ERRO_CARREGAR = 'Não foi possível carregar os dados. Tente novamente.';
  const MSG_ERRO_SALVAR = 'Não foi possível salvar os dados. Tente novamente.';

  // ---------- Elementos da página ----------
  const form = document.getElementById('form-item');
  const campoId = document.getElementById('campo-id');
  const btnSalvar = document.getElementById('btn-salvar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const aviso = document.getElementById('aviso');
  const listaEl = document.getElementById('lista-itens');
  const contadorEl = document.getElementById('contador');
  const logEl = document.getElementById('painel-log');

  // ---------- Estado em memória ----------
  let itens = [];
  let atividades = [];

  // ---------- Funções auxiliares ----------
  const campo = (nome) => document.getElementById('campo-' + nome);
  const erroEl = (nome) => document.getElementById('erro-' + nome);

  /** Cria um elemento usando textContent (nunca innerHTML), evitando injeção de HTML. */
  function criar(tag, texto, classes) {
    const el = document.createElement(tag);
    if (texto !== undefined) el.textContent = texto;
    if (classes) el.className = classes;
    return el;
  }

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /** Formata a data/hora atual como 17/11/2026 08:30. */
  function dataHoraAgora() {
    const d = new Date();
    return d.toLocaleDateString('pt-BR') + ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function mostrarAviso(texto, tipo) {
    aviso.className = 'alert alert-' + tipo;
    aviso.textContent = texto;
  }

  function esconderAviso() {
    aviso.className = 'alert d-none';
    aviso.textContent = '';
  }

  // ---------- Armazenamento (localStorage, opcional) ----------
  function lerArmazenado(chave) {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) return [];
    const dados = JSON.parse(bruto);
    if (!Array.isArray(dados)) throw new Error('formato inválido');
    return dados;
  }

  function gravarArmazenado(chave, dados) {
    try {
      localStorage.setItem(chave, JSON.stringify(dados));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- Validação ----------
  /** Valida os dados de um item e devolve um objeto { campo: mensagem }. */
  function validar(d) {
    const e = {};
    const nome = String(d.nome ?? '').trim();
    if (!nome) e.nome = 'Informe o nome do alimento.';
    else if (nome.length < 3 || nome.length > 60) e.nome = 'Use de 3 a 60 caracteres.';
    else if (!/^[\p{L}\p{N} ,.'()-]+$/u.test(nome)) e.nome = 'Use apenas letras, números e pontuação simples.';

    if (!CATEGORIAS.includes(d.categoria)) e.categoria = 'Escolha uma categoria.';

    const qtdTexto = String(d.quantidade ?? '').trim();
    const qtd = Number(qtdTexto);
    if (qtdTexto === '' || !Number.isFinite(qtd)) e.quantidade = 'Informe a quantidade em números.';
    else if (!Number.isInteger(qtd) || qtd < 1 || qtd > 1000) e.quantidade = 'Use um número inteiro de 1 a 1000.';

    if (!UNIDADES.includes(d.unidade)) e.unidade = 'Escolha a unidade.';
    if (!Object.hasOwn(DESTINOS, d.destino)) e.destino = 'Escolha um destino.';
    if (String(d.obs ?? '').trim().length > 120) e.obs = 'Use no máximo 120 caracteres.';
    return e;
  }

  /** Mostra as mensagens de erro na tela e marca os campos como inválidos. */
  function mostrarErros(erros) {
    CAMPOS.forEach((nome) => {
      const msg = erros[nome] || '';
      campo(nome).setCustomValidity(msg);
      erroEl(nome).textContent = msg;
    });
  }

  function lerFormulario() {
    const dados = {};
    CAMPOS.forEach((nome) => { dados[nome] = campo(nome).value; });
    return dados;
  }

  /** Limpa e padroniza os dados já validados. */
  function normalizar(d) {
    return {
      nome: d.nome.trim(),
      categoria: d.categoria,
      quantidade: Number(d.quantidade),
      unidade: d.unidade,
      destino: d.destino,
      obs: String(d.obs ?? '').trim()
    };
  }

  // ---------- Painel de atividades ----------
  function registrarAtividade(acao, resultado, sucesso = true) {
    atividades.unshift({ quando: dataHoraAgora(), acao, resultado, sucesso });
    atividades = atividades.slice(0, MAX_LOG);
    gravarArmazenado(CHAVE_LOG, atividades);
    renderizarLog();
  }

  function renderizarLog() {
    logEl.replaceChildren();
    atividades.forEach((a) => {
      const li = criar('li', undefined, a.sucesso ? '' : 'falha');
      li.append(criar('time', a.quando), criar('span', a.acao + ': ' + a.resultado));
      logEl.append(li);
    });
    if (!atividades.length) logEl.append(criar('li', 'Nenhuma atividade ainda.'));
  }

  // ---------- Operações sobre os dados ----------
  function adicionarItem(dados) {
    const item = { id: gerarId(), ...normalizar(dados) };
    itens.push(item);
    persistirItens();
    renderizarLista();
    limparFormulario();
    registrarAtividade('Adicionar', '"' + item.nome + '" adicionado com sucesso');
  }

  function iniciarEdicao(id) {
    const item = itens.find((i) => i.id === id);
    if (!item) return;
    campoId.value = item.id;
    CAMPOS.forEach((nome) => { campo(nome).value = item[nome]; });
    btnSalvar.textContent = 'Salvar alterações';
    btnCancelar.classList.remove('d-none');
    mostrarErros({});
    form.classList.remove('was-validated');
    campo('nome').focus();
  }

  function atualizarItem(id, dados) {
    const pos = itens.findIndex((i) => i.id === id);
    if (pos < 0) throw new Error('item inexistente');
    itens[pos] = { id, ...normalizar(dados) };
    persistirItens();
    renderizarLista();
    registrarAtividade('Editar', '"' + itens[pos].nome + '" atualizado com sucesso');
    limparFormulario();
  }

  function removerItem(id) {
    const item = itens.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm('Remover "' + item.nome + '"?')) return;
    itens = itens.filter((i) => i.id !== id);
    persistirItens();
    if (campoId.value === id) limparFormulario();
    renderizarLista();
    registrarAtividade('Remover', '"' + item.nome + '" removido com sucesso');
  }

  function persistirItens() {
    if (!gravarArmazenado(CHAVE_ITENS, itens)) {
      mostrarAviso(MSG_ERRO_SALVAR + ' Os registros valem apenas até recarregar a página.', 'warning');
    }
  }

  function limparFormulario() {
    form.reset();
    campoId.value = '';
    form.classList.remove('was-validated');
    mostrarErros({});
    btnSalvar.textContent = 'Adicionar registro';
    btnCancelar.classList.add('d-none');
  }

  // ---------- Listagem ----------
  function renderizarLista() {
    listaEl.replaceChildren();
    contadorEl.textContent = itens.length;
    if (!itens.length) {
      listaEl.append(criar('li', 'Nenhum registro ainda. Preencha o formulário para adicionar o primeiro.', 'lista-vazia'));
      return;
    }
    itens.forEach((item) => {
      const li = criar('li', undefined, 'list-group-item item-registro');
      const info = criar('div');
      info.append(
        criar('strong', item.nome),
        criar('div', item.categoria + ', ' + item.quantidade + ' ' + item.unidade + '. Destino: ' + DESTINOS[item.destino].rotulo),
        criar('p', DESTINOS[item.destino].dica, 'item-dica')
      );
      if (item.obs) info.append(criar('p', 'Obs.: ' + item.obs, 'item-dica'));

      const acoes = criar('div', undefined, 'acoes');
      const bEditar = criar('button', 'Editar', 'btn btn-sm btn-outline-dark');
      const bRemover = criar('button', 'Remover', 'btn btn-sm btn-outline-danger');
      bEditar.type = bRemover.type = 'button';
      bEditar.dataset.acao = 'editar';
      bRemover.dataset.acao = 'remover';
      bEditar.dataset.id = bRemover.dataset.id = item.id;
      acoes.append(bEditar, bRemover);

      li.append(info, acoes);
      listaEl.append(li);
    });
  }

  // ---------- Eventos ----------
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    esconderAviso();
    const editando = campoId.value;
    try {
      const dados = lerFormulario();
      const erros = validar(dados);
      mostrarErros(erros);
      form.classList.add('was-validated');
      if (Object.keys(erros).length) {
        registrarAtividade(editando ? 'Editar' : 'Adicionar', 'dados inválidos, corrija os campos destacados', false);
        return;
      }
      if (editando) atualizarItem(editando, dados);
      else adicionarItem(dados);
    } catch (e) {
      mostrarAviso(MSG_ERRO_SALVAR, 'danger');
      registrarAtividade(editando ? 'Editar' : 'Adicionar', 'não foi possível concluir a operação', false);
    }
  });

  // Revalida enquanto a pessoa corrige os campos (depois da primeira tentativa de envio)
  form.addEventListener('input', () => {
    if (form.classList.contains('was-validated')) mostrarErros(validar(lerFormulario()));
  });

  btnCancelar.addEventListener('click', () => {
    limparFormulario();
    registrarAtividade('Editar', 'edição cancelada');
  });

  // Delegação de eventos: um único listener para os botões Editar/Remover
  listaEl.addEventListener('click', (ev) => {
    const botao = ev.target.closest('button[data-acao]');
    if (!botao) return;
    try {
      if (botao.dataset.acao === 'editar') iniciarEdicao(botao.dataset.id);
      else removerItem(botao.dataset.id);
    } catch (e) {
      mostrarAviso(MSG_ERRO_SALVAR, 'danger');
    }
  });

  // ---------- Inicialização ----------
  function iniciar() {
    try {
      // Revalida tudo o que vem do armazenamento: dados salvos podem ter sido alterados
      itens = lerArmazenado(CHAVE_ITENS).filter((i) => i && typeof i.id === 'string' && Object.keys(validar(i)).length === 0);
      atividades = lerArmazenado(CHAVE_LOG).filter((a) => a && typeof a.quando === 'string' && typeof a.acao === 'string' && typeof a.resultado === 'string');
      renderizarLista();
      renderizarLog();
      registrarAtividade('Carregar', itens.length + ' registro(s) carregado(s)');
    } catch (e) {
      itens = [];
      atividades = [];
      renderizarLista();
      registrarAtividade('Carregar', 'não foi possível carregar os dados', false);
      mostrarAviso(MSG_ERRO_CARREGAR, 'danger');
    }
  }

  iniciar();
})();
