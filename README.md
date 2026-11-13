# Foodloop - protótipo

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

## Ameaças e mitigações
1. **Injeção de código (XSS) pelos campos de texto.** Alguém digita HTML/script no nome ou na observação.
   Mitigação: validação de formato e tamanho e exibição sempre com `textContent`, nunca `innerHTML`.
2. **Dados alterados no armazenamento do navegador.** Os registros salvos podem ser editados ou corrompidos fora do site.
   Mitigação: `try/catch` na leitura e revalidação de cada item ao carregar; itens inválidos são descartados.
3. **Exposição de dados pessoais.** A pessoa pode digitar nome, telefone ou endereço na observação.
   Mitigação: coleta mínima (sem campos pessoais), aviso de privacidade no formulário, limite de 120 caracteres e dados guardados só no navegador.

As mensagens de erro mostradas à pessoa são genéricas ("Não foi possível salvar os dados. Tente novamente.") e não expõem detalhes técnicos.

## Quem é o cidadão afetado?
   Todo e qualquer indivíduo de lide com a compra, venda, consumo e manuseio de alimentos, assim como estabelecimentos.
##	Qual é o problema? 
   A grande quantidade de desperdício de alimentos devido à falta de informação e incentivo governamental.
## Que evidência o comprova?  
   Frequentemente, é possível notar que estabelecimentos, como mercados e restaurantes, acabam descartando alimentos que não venderam, assim como restos alimentícios que podem ser
   reutilizados como compostagem, por exemplo. De forma similiar, produzimos muito descarte alimentar desnecessário após o consumo do que é considerado comestível ou útil.

--------------------------------
A proposta apresentada consiste na conscientização sobre o desperdício de alimentos perfeitamente reutilizáveis para diversos propósitos, como cascas de alimento em compostagens, por exemplo.
A sustentabilidade se dá pela instrução de boas práticas relacionadas à resíduos alimentícios, compra consciente evitando o desperdício e reaproveitamento de descartáveis não-poluentes.
