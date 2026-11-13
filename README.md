# Foodloop - protótipo (ODS 12)

Site de conscientização contra o desperdício de alimentos, com registro de sobras.

## Estrutura
```
foodloop/
├── index.html        Início (problema e proposta)
├── dicas.html        Boas práticas (compostagem, compra consciente, reaproveitamento)
├── registro.html     Formulário, lista de registros e painel de atividades
├── css/style.css     Estilos próprios (Mobile First: 768px e 1024px)
└── js/registro.js    CRUD, validação e painel de atividades
```

## Como usar
Abra `index.html` no navegador (precisa de internet para carregar Bootstrap e fontes).

## Ameaças e mitigações (rascunho para o relatório)
1. **Injeção de código (XSS) pelos campos de texto.** Alguém digita HTML/script no nome ou na observação.
   Mitigação: validação de formato e tamanho e exibição sempre com `textContent`, nunca `innerHTML`.
2. **Dados alterados no armazenamento do navegador.** Os registros salvos podem ser editados ou corrompidos fora do site.
   Mitigação: `try/catch` na leitura e revalidação de cada item ao carregar; itens inválidos são descartados.
3. **Exposição de dados pessoais.** A pessoa pode digitar nome, telefone ou endereço na observação.
   Mitigação: coleta mínima (sem campos pessoais), aviso de privacidade no formulário, limite de 120 caracteres e dados guardados só no navegador.

Extra: as mensagens de erro mostradas à pessoa são genéricas ("Não foi possível salvar os dados. Tente novamente.") e não expõem detalhes técnicos.
