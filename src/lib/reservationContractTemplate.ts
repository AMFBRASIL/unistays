/**
 * Modelo padrão de contrato de locação por temporada — Ibiunature Aqua.
 * Baseado no Contrato.docx do empreendimento (CONTRATO PARTICULAR DE LOCAÇÃO POR TEMPORADA).
 * Usado em Cadastros → Contratos e como fallback na geração via API.
 */
export const DEFAULT_RESERVATION_CONTRACT_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contrato de Locação por Temporada — {{hotel_nome}}</title>
  <style id="unistays-contract-base">
    :root {
      --text: #222222;
      --accent: #AD6CA5;
      --muted: #444444;
      --paper: #ffffff;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Open Sans', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--text);
      font-weight: 600;
      background: #f3f3f3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .document {
      max-width: 210mm;
      margin: 16px auto;
      background: var(--paper);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      padding: 0 0 24px;
    }
    .contract-header {
      text-align: center;
      padding: 18px 28px 16px;
      border-bottom: 3px solid var(--accent);
    }
    .header-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin: 0 auto 14px;
      max-width: 100%;
    }
    .header-mark {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
    }
    .header-brand-title {
      font-size: 13pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text);
      text-align: left;
      line-height: 1.25;
    }
    .contract-title {
      margin: 0 0 8px;
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text);
    }
    .property-name {
      margin: 0 0 10px;
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text);
    }
    .reservation-meta {
      font-size: 10pt;
      font-weight: 600;
      color: var(--muted);
    }
    .pix-details {
      margin: 6px 0 10px;
      font-weight: 600;
      line-height: 1.6;
    }
    .contract-body {
      padding: 24px 28px 8px;
    }
    .intro-block,
    .clause,
    .termo-ciencia,
    .declaracao,
    .signature-section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .intro-block p,
    .clause p,
    .clause li,
    .termo-ciencia p,
    .termo-ciencia li,
    .declaracao p {
      margin: 0 0 8px;
      text-align: justify;
      font-weight: 600;
      color: var(--text);
    }
    .party-label {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 14px 0 4px;
    }
    .clause-title {
      margin: 18px 0 8px;
      font-size: 16pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--text);
    }
    .clause ul,
    .termo-ciencia ul {
      margin: 6px 0 10px 0;
      padding-left: 0;
      list-style: none;
    }
    .clause li,
    .termo-ciencia li {
      margin-bottom: 6px;
      padding-left: 0;
    }
    .inventory-list {
      margin: 8px 0 10px 18px;
      padding: 0;
    }
    .inventory-list li {
      margin-bottom: 4px;
    }
    .amenities-line {
      white-space: pre-line;
      margin: 8px 0 10px;
    }
    .prohibitions-list {
      margin: 8px 0 10px 18px;
      padding: 0;
    }
    .prohibitions-list li {
      margin-bottom: 4px;
    }
    .check-list li::before {
      content: "✓ ";
      color: var(--accent);
      font-weight: 700;
    }
    .section-heading {
      margin: 22px 0 10px;
      font-size: 16pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--text);
    }
    .signature-date {
      text-align: center;
      margin: 24px 0 28px;
      font-weight: 700;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px 48px;
      margin-top: 12px;
    }
    .signature-block {
      text-align: center;
      page-break-inside: avoid;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin: 52px 0 10px;
      padding-top: 8px;
    }
    .signature-role {
      display: block;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    @page {
      size: A4;
      margin: 14mm;
    }
    @media print {
      html, body {
        background: #fff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .document {
        max-width: none;
        margin: 0;
        box-shadow: none;
      }
      .contract-header {
        border-bottom: 3px solid #AD6CA5 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="document" data-template-version="ibiunature-v1">
    <header class="contract-header">
      <div class="header-brand">
        <svg class="header-mark" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path fill="#222222" d="M24 2 38 12v24L24 46 10 36V12L24 2zm0 6.2L16 14.5v19L24 39.8l8-6.3v-19L24 8.2z"/>
        </svg>
        <div class="header-brand-title">Contrato {{hotel_nome}}</div>
      </div>
      <h1 class="contract-title">Contrato Particular de Locação por Temporada</h1>
      <div class="property-name">{{hotel_nome}}</div>
      <div class="reservation-meta">Reserva: <strong>{{reserva_codigo}}</strong></div>
    </header>

    <div class="contract-body">
      <div class="intro-block">
        <p>Pelo presente instrumento particular, de um lado: <strong>LOCADOR</strong></p>
        <p>{{locador_nome}}, inscrito no CPF nº {{locador_documento}}, residente e domiciliado à {{locador_endereco}}, e-mail {{locador_email}}, doravante denominado <strong>LOCADOR</strong>;</p>
        <p>e, de outro:</p>
        <p class="party-label">Locatário</p>
        <p>{{hospede_nome}}, inscrito no CPF nº {{hospede_documento}}, RG nº {{hospede_rg}}, residente e domiciliado à {{hospede_endereco_completo}}, e-mail {{hospede_email}}, telefone {{hospede_telefone}}, doravante denominado <strong>LOCATÁRIO</strong>;</p>
        <p>têm entre si justo e contratado o presente <strong>CONTRATO DE LOCAÇÃO POR TEMPORADA</strong>, mediante as seguintes cláusulas e condições.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">1. Do Imóvel e Objeto da Locação</h2>
        <p>O presente contrato tem por objeto a locação por temporada de apartamento integrante do empreendimento denominado {{hotel_nome}}, localizado em {{imovel_cidade_uf}}.</p>
        <p>Apartamento/Unidade nº: {{unidade_descricao}}</p>
        <p>O apartamento será utilizado exclusivamente para hospedagem temporária do LOCATÁRIO e das pessoas por ele cadastradas, respeitado o limite máximo de ocupação previsto neste contrato.</p>
        <p>A unidade locada é de utilização privativa, enquanto as áreas externas e de lazer do empreendimento possuem utilização compartilhada entre os hóspedes das demais unidades.</p>
        <p>A presente contratação possui natureza temporária, não constituindo residência permanente, transferência de posse definitiva ou qualquer direito de permanência após o término do período contratado.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">2. Do Período da Locação</h2>
        <p>A locação compreenderá o período de:</p>
        <p><strong>ENTRADA / CHECK-IN:</strong> {{checkin_data}}, a partir das {{checkin_hora}}</p>
        <p><strong>SAÍDA / CHECK-OUT:</strong> {{checkout_data}}, impreterivelmente até as {{checkout_hora}}</p>
        <p>O horário de saída deverá ser rigorosamente respeitado, especialmente porque a unidade poderá necessitar de limpeza, vistoria, manutenção e preparação para os hóspedes seguintes.</p>
        <p>Qualquer prorrogação somente poderá ocorrer mediante autorização expressa do LOCADOR e estará sujeita à disponibilidade e cobrança adicional.</p>
        <p>A permanência não autorizada após as {{checkout_hora}} poderá gerar cobrança adicional proporcional ou de nova diária, sem prejuízo de eventuais perdas e danos decorrentes do atraso na liberação da unidade.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">3. Do Valor da Locação</h2>
        <p>O valor total ajustado para todo o período é de: {{valor_total}}</p>
        <p>({{valor_total_extenso}})</p>
        <p>O LOCATÁRIO pagará:</p>
        <p>Sinal de reserva: {{valor_sinal}}</p>
        <p>Saldo restante: {{valor_saldo}}</p>
        <p>O sinal será abatido integralmente do valor total da hospedagem.</p>
        <p>O pagamento será realizado por PIX para:</p>
        <div class="pix-details">{{dados_pagamento_pix}}</div>
        <p>O comprovante de pagamento deverá ser encaminhado ao LOCADOR ou à administração.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">4. Do Sinal e Confirmação da Reserva</h2>
        <p>O pagamento do sinal de {{valor_sinal}} destina-se à confirmação e bloqueio das datas reservadas.</p>
        <p>A reserva será considerada confirmada após a identificação do pagamento do sinal e aceite deste contrato.</p>
        <p>O saldo remanescente de {{valor_saldo}} deverá ser integralmente quitado até o momento da entrada no imóvel, salvo se as partes estabelecerem expressamente outra condição por escrito.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">5. Do Cancelamento pelo Locatário</h2>
        <p>Em caso de desistência ou cancelamento por iniciativa do LOCATÁRIO, o sinal pago será tratado conforme as condições de cancelamento ajustadas entre as partes e a legislação aplicável, considerando que sua finalidade é reservar exclusivamente o imóvel para o período contratado.</p>
        <p>Caso a desistência ocorra de forma que impeça razoavelmente nova locação para o mesmo período, especialmente em período de alta procura como Réveillon, o valor pago a título de sinal poderá ser retido na extensão permitida pela legislação aplicável.</p>
        <p>O encerramento voluntário da estadia antes da data contratada não gera automaticamente direito à devolução proporcional das diárias não utilizadas.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">6. Do Número Máximo de Hóspedes</h2>
        <p>A unidade comporta, no máximo: {{hospedes_capacidade_max}} ({{hospedes_capacidade_extenso}})</p>
        <p>O limite considera conjuntamente adultos e crianças.</p>
        <p>Não é permitida a hospedagem de pessoas além do limite máximo sem autorização expressa do LOCADOR.</p>
        <p>Hóspedes excedentes ou pessoas não informadas que pernoitem no apartamento poderão gerar cobrança adicional de:</p>
        <p>{{valor_hospede_excedente}} POR PESSOA, POR DIA</p>
        <p>sem prejuízo da exigência de retirada imediata das pessoas excedentes quando ultrapassada a capacidade máxima da unidade ou houver risco à segurança e ao funcionamento do empreendimento.</p>
        <p>O LOCATÁRIO é o responsável principal por todas as pessoas vinculadas à sua reserva.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">7. Dos Visitantes</h2>
        <p>A entrada de visitantes deverá respeitar as normas e procedimentos de identificação estabelecidos pelo {{hotel_nome}}.</p>
        <p>Visitantes não possuem automaticamente autorização para pernoitar.</p>
        <p>O LOCATÁRIO responde integralmente pela conduta de seus visitantes enquanto estiverem dentro do empreendimento.</p>
        <p>É proibido utilizar visitantes para transformar a hospedagem em festa, evento ou reunião com quantidade de pessoas incompatível com a reserva.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">8. Dos Móveis, Equipamentos e Utensílios</h2>
        <p>O apartamento será entregue contendo:</p>
        <ul class="inventory-list">
          <li>01 TV funcionando;</li>
          <li>01 liquidificador funcionando;</li>
          <li>01 fogão funcionando;</li>
          <li>01 forno funcionando;</li>
          <li>01 sofá;</li>
          <li>01 mesa para 8 pessoas;</li>
          <li>08 cadeiras;</li>
          <li>04 cadeiras de varanda;</li>
          <li>01 geladeira funcionando;</li>
          <li>talheres para 10 pessoas;</li>
          <li>pratos para 10 pessoas;</li>
          <li>copos para 10 pessoas;</li>
          <li>01 chave da porta;</li>
          <li>01 sanduicheira funcionando;</li>
          <li>01 máquina Nescafé Dolce Gusto funcionando;</li>
          <li>10 cápsulas de café disponibilizadas como cortesia;</li>
          <li>05 camas de casal funcionais e sem rasgos.</li>
        </ul>
        <p>O LOCATÁRIO deverá comunicar qualquer divergência, dano ou defeito encontrado preferencialmente no momento da entrada ou assim que constatado.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">9. Da Vistoria</h2>
        <p>O imóvel poderá ser vistoriado antes da entrada do LOCATÁRIO, inclusive mediante fotografias e vídeos.</p>
        <p>O LOCATÁRIO poderá apontar qualquer avaria já existente no momento do check-in.</p>
        <p>Ao término da hospedagem será realizada nova vistoria.</p>
        <p>Danos constatados após a saída poderão ser comparados com os registros anteriores à hospedagem.</p>
        <p>O registro fotográfico ou em vídeo da vistoria terá finalidade exclusivamente patrimonial e não implica autorização para qualquer monitoramento do interior da unidade durante a hospedagem.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">10. Dos Danos e Avarias</h2>
        <p>O LOCATÁRIO responsabiliza-se pelos danos causados por ele, seus familiares, acompanhantes, visitantes, crianças ou animais ao apartamento, mobiliário, equipamentos, utensílios ou áreas comuns.</p>
        <p>Itens quebrados, queimados, rasgados, manchados, extraviados ou inutilizados por utilização inadequada poderão ser cobrados pelo valor necessário à reparação ou reposição, mediante comprovação.</p>
        <p>O desgaste natural decorrente da utilização normal não será considerado dano.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">11. Da Chave</h2>
        <p>Será entregue 01 chave da unidade.</p>
        <p>É proibido fazer cópias da chave sem autorização.</p>
        <p>Em caso de perda ou extravio, poderão ser cobrados os custos necessários para reposição e, caso necessário por razões de segurança, troca do cilindro ou fechadura.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">12. Das Áreas de Lazer do {{hotel_nome}}</h2>
        <p>A hospedagem dá direito ao acesso às áreas compartilhadas disponibilizadas pelo empreendimento, observadas as regras específicas de cada espaço.</p>
        <p>Entre elas:</p>
        <p class="amenities-line">🏊 Piscina aquecida
🏖️ Quadra de Beach Tennis
🎮 Salão de Jogos
🛒 Mini Mercado
🌳 Pomar
🔥 Fireplace
🎯 Áreas de convivência e lazer
🌿 Jardins e áreas externas
🐟 Lago com peixes
🚗 Estacionamento
🛝 Espaços recreativos disponibilizados pelo empreendimento</p>
        <p>As áreas comuns poderão, em regra, ser acessadas 24 horas, desde que utilizadas de forma silenciosa, segura e respeitosa.</p>
        <p><strong>EXCEÇÃO: PISCINA</strong></p>
        <p>A piscina funciona somente até:</p>
        <p><strong>22h00</strong></p>
        <p>Após as 22h00, a piscina ficará fechada para limpeza, manutenção e tratamento da água.</p>
        <p>É proibida a utilização durante o período de fechamento.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">13. Regra Especial de Som e Música</h2>
        <p>Por se tratar de empreendimento com diversas unidades, a preservação do sossego é condição essencial da hospedagem.</p>
        <p><strong>MÚSICAS E EQUIPAMENTOS DE SOM SOMENTE PODERÃO SER UTILIZADOS ATÉ AS 18h00.</strong></p>
        <p>Mesmo antes das 18h00, o volume deverá permanecer em nível razoável e não poderá causar incômodo aos demais hóspedes.</p>
        <p><strong>APÓS AS 18h00:</strong></p>
        <p>Fica proibida a utilização de caixas de som, aparelhos de música ou qualquer equipamento sonoro em volume perceptível fora da unidade.</p>
        <p>Conversas e utilização normal das áreas comuns permanecem permitidas, desde que sem gritaria, algazarra ou perturbação do sossego.</p>
        <p>A regra aplica-se tanto ao apartamento quanto às varandas e áreas comuns.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">14. Das Festas e Eventos</h2>
        <p>É expressamente proibida a realização de festas, eventos, confraternizações abertas, eventos comerciais ou reuniões com pessoas não cadastradas sem autorização prévia e expressa do {{hotel_nome}}.</p>
        <p>O fato de o apartamento possuir capacidade para até {{hospedes_capacidade_max}} pessoas não autoriza a entrada indiscriminada de visitantes.</p>
        <p>A churrasqueira existente na unidade é privativa do apartamento.</p>
        <p>Eventual espaço externo para eventos ou churrasqueira coletiva dependerá de disponibilidade, reserva e eventual pagamento específico.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">15. Das Crianças</h2>
        <p>Crianças e adolescentes são de responsabilidade exclusiva dos pais ou responsáveis.</p>
        <p>Crianças não poderão permanecer desacompanhadas na:</p>
        <ul class="inventory-list">
          <li>piscina;</li>
          <li>quadra;</li>
          <li>fireplace;</li>
          <li>lago;</li>
          <li>estacionamento;</li>
          <li>varandas;</li>
          <li>escadas;</li>
          <li>jardins;</li>
          <li>áreas externas;</li>
          <li>demais ambientes que apresentem risco.</li>
        </ul>
        <p>O {{hotel_nome}} não oferece serviço de monitoria infantil.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">16. Dos Animais</h2>
        <p>Quando admitidos na reserva, animais deverão permanecer sob responsabilidade de seus tutores.</p>
        <p>Os responsáveis deverão:</p>
        <ul class="inventory-list">
          <li>recolher imediatamente os dejetos;</li>
          <li>evitar latidos ou ruídos excessivos;</li>
          <li>impedir danos aos móveis e instalações;</li>
          <li>respeitar os demais hóspedes;</li>
          <li>manter o apartamento em condições adequadas de higiene.</li>
        </ul>
        <p>Danos ou necessidade de higienização extraordinária causados pelo animal poderão ser cobrados.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">17. Do Mini Mercado</h2>
        <p>Os produtos existentes no Mini Mercado não estão incluídos no valor da hospedagem.</p>
        <p>Todo produto retirado deverá ser devidamente pago de acordo com os valores e instruções disponíveis no local.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">18. Do Fireplace</h2>
        <p>O fireplace deverá ser utilizado de maneira responsável.</p>
        <p>É proibido lançar ao fogo materiais inflamáveis, plásticos, embalagens, lixo ou objetos inadequados.</p>
        <p>Crianças deverão permanecer acompanhadas por adulto responsável.</p>
        <p>O usuário deverá seguir eventuais orientações da administração relativas ao acendimento e utilização.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">19. Do Pomar, Jardins e Lago</h2>
        <p>As áreas naturais deverão ser preservadas.</p>
        <p>É proibido:</p>
        <ul class="inventory-list">
          <li>danificar árvores ou plantas;</li>
          <li>arrancar galhos;</li>
          <li>jogar lixo no lago;</li>
          <li>lançar objetos na água;</li>
          <li>danificar jardins;</li>
          <li>realizar qualquer conduta prejudicial ao meio ambiente.</li>
        </ul>
        <p>Frutas disponíveis no pomar poderão ser colhidas de maneira moderada e responsável, desde que não sejam causados danos às plantas.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">20. Do Estacionamento</h2>
        <p>Os veículos deverão permanecer exclusivamente nos locais indicados.</p>
        <p>É proibido bloquear portões, acessos, corredores, vagas de outras unidades ou áreas destinadas a emergência.</p>
        <p>O LOCATÁRIO deverá manter seus veículos devidamente fechados e não deixar objetos de valor expostos.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">21. Das Proibições</h2>
        <p>É expressamente proibido:</p>
        <ul class="prohibitions-list">
          <li>a) fumar dentro do apartamento;</li>
          <li>b) realizar festas sem autorização;</li>
          <li>c) utilizar som após as 18h00 em desacordo com este contrato;</li>
          <li>d) utilizar fogos de artifício ou rojões;</li>
          <li>e) praticar atividades ilícitas;</li>
          <li>f) utilizar drogas ilícitas;</li>
          <li>g) retirar móveis ou equipamentos da unidade;</li>
          <li>h) realizar alterações elétricas, hidráulicas ou estruturais;</li>
          <li>i) acessar áreas técnicas ou restritas;</li>
          <li>j) provocar danos ao patrimônio;</li>
          <li>k) jogar lixo pelas janelas ou varandas;</li>
          <li>l) acender fogo fora dos locais autorizados;</li>
          <li>m) perturbar outros hóspedes ou vizinhos;</li>
          <li>n) permitir quantidade de pessoas superior à autorizada;</li>
          <li>o) ceder, sublocar ou transferir o apartamento para terceiros;</li>
          <li>p) utilizar o imóvel para finalidade comercial sem autorização;</li>
          <li>q) praticar qualquer conduta que comprometa a segurança ou tranquilidade do empreendimento.</li>
        </ul>
      </div>

      <div class="clause">
        <h2 class="clause-title">22. Da Limpeza</h2>
        <p>A limpeza ordinária decorrente da hospedagem será tratada conforme as condições da reserva.</p>
        <p>Entretanto, caso seja constatada sujeira extraordinária, manchas, resíduos, danos ou situação que exija serviço especializado além da limpeza normal de troca de hóspedes, o custo adicional poderá ser cobrado do LOCATÁRIO mediante comprovação.</p>
        <p>O LOCATÁRIO deverá acondicionar o lixo adequadamente nos locais indicados.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">23. Das Despesas</h2>
        <p>O valor contratado inclui o consumo normal de:</p>
        <p>água, energia elétrica, gás, condomínio e internet, quando disponibilizados pelo empreendimento.</p>
        <p>Não estão incluídas compras realizadas no Mini Mercado, serviços adicionais contratados separadamente, danos, multas ou demais despesas extraordinárias provocadas pelo LOCATÁRIO.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">24. Da Internet e Serviços Essenciais</h2>
        <p>A internet é disponibilizada como comodidade.</p>
        <p>Eventuais interrupções de internet, energia, abastecimento de água ou outros serviços decorrentes de concessionárias, provedores, intempéries, manutenção emergencial ou situações fora do controle razoável do LOCADOR deverão ser comunicadas para que sejam adotadas as providências possíveis.</p>
        <p>Tais ocorrências serão analisadas conforme sua natureza, duração e legislação aplicável.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">25. Dos Objetos Pessoais</h2>
        <p>O LOCATÁRIO deverá conferir seus pertences antes da saída.</p>
        <p>Objetos encontrados após o check-out poderão ser temporariamente armazenados, quando possível.</p>
        <p>Eventuais despesas para envio ou devolução serão suportadas pelo LOCATÁRIO.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">26. Das Obrigações do Locatário</h2>
        <p>O LOCATÁRIO obriga-se a:</p>
        <ul class="prohibitions-list">
          <li>a) utilizar o imóvel exclusivamente para a finalidade contratada;</li>
          <li>b) não ceder ou sublocar a unidade;</li>
          <li>c) conservar móveis, utensílios e equipamentos;</li>
          <li>d) comunicar imediatamente qualquer ocorrência relevante;</li>
          <li>e) respeitar funcionários e demais hóspedes;</li>
          <li>f) cumprir os horários estabelecidos;</li>
          <li>g) informar as regras deste contrato aos demais hóspedes;</li>
          <li>h) responder pelos atos de seus acompanhantes e visitantes;</li>
          <li>i) devolver o apartamento nas condições compatíveis com aquelas em que o recebeu, ressalvado o desgaste natural;</li>
          <li>j) respeitar integralmente as normas do {{hotel_nome}}.</li>
        </ul>
      </div>

      <div class="clause">
        <h2 class="clause-title">27. Do Descumprimento das Regras</h2>
        <p>O descumprimento das normas poderá gerar advertência e determinação para interrupção imediata da conduta irregular.</p>
        <p>Infrações graves ou reiteradas, especialmente:</p>
        <p>som após as 18h00, festas não autorizadas, excesso de hóspedes, danos, ameaças, agressões, invasão de áreas restritas, descumprimento das normas da piscina ou atos ilícitos, poderão resultar nas medidas cabíveis, inclusive encerramento antecipado da hospedagem quando juridicamente justificável.</p>
        <p>Danos, despesas extraordinárias e multas comprovadamente decorrentes da conduta do LOCATÁRIO, seus acompanhantes ou visitantes poderão ser cobrados do responsável pela reserva.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">28. Da Integração das Comunicações</h2>
        <p>Integram a relação contratual as condições específicas da reserva previamente acordadas pelas partes através de WhatsApp, e-mail ou outros meios eletrônicos, desde que seja possível demonstrar a concordância das partes.</p>
        <p>Tais comunicações poderão ser utilizadas para comprovação das condições negociadas, pagamentos, autorizações, número de hóspedes e demais informações relacionadas à hospedagem.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">29. Das Regras Internas</h2>
        <p>As normas e avisos do {{hotel_nome}}, inclusive aqueles disponibilizados através de placas, comunicados, mensagens ou orientações da administração, complementam as regras deste contrato no que se refere à segurança e utilização das áreas comuns.</p>
        <p>O LOCATÁRIO compromete-se a orientar todos os seus acompanhantes.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">30. Da Legislação Aplicável</h2>
        <p>A presente contratação possui natureza de locação por temporada e será interpretada conforme a legislação brasileira aplicável, especialmente a Lei nº 8.245/1991, quando pertinente, e demais normas aplicáveis à relação contratual.</p>
      </div>

      <div class="clause">
        <h2 class="clause-title">31. Do Foro</h2>
        <p>Para as controvérsias decorrentes deste contrato, será observado o foro competente de acordo com a legislação aplicável.</p>
      </div>

      <div class="termo-ciencia">
        <h2 class="section-heading">Termo de Ciência das Regras Principais</h2>
        <p>O LOCATÁRIO declara estar expressamente ciente de que:</p>
        <ul class="check-list">
          <li>Período: {{checkin_data}} a {{checkout_data}}</li>
          <li>Entrada: {{checkin_data}} às {{checkin_hora}}</li>
          <li>Saída: {{checkout_data}} até {{checkout_hora}}</li>
          <li>Valor total: {{valor_total}}</li>
          <li>Sinal: {{valor_sinal}}</li>
          <li>Saldo: {{valor_saldo}}</li>
          <li>Capacidade máxima: {{hospedes_capacidade_max}} pessoas</li>
          <li>Hóspede excedente: {{valor_hospede_excedente}} por pessoa/dia, quando autorizado</li>
          <li>Música/som: somente até 18h00</li>
          <li>Piscina: até 22h00</li>
          <li>Festas: proibidas sem autorização</li>
          <li>Churrasqueira do apartamento: privativa</li>
          <li>Áreas externas: compartilhadas</li>
          <li>Danos: responsabilidade de quem os causar</li>
          <li>Crianças: supervisão obrigatória dos responsáveis</li>
          <li>Regras do empreendimento: cumprimento obrigatório</li>
        </ul>
      </div>

      <div class="declaracao">
        <h2 class="section-heading">Declaração</h2>
        <p>O LOCATÁRIO declara que leu integralmente o presente contrato, recebeu as informações necessárias referentes à hospedagem e às normas de utilização do {{hotel_nome}}, compreendeu e aceita suas condições, comprometendo-se a transmiti-las a todos os seus acompanhantes e visitantes.</p>
      </div>

      <p class="signature-date">{{cidade_assinatura}}, {{data_assinatura}}.</p>

      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line">
            <span class="signature-role">Locador</span>
            {{locador_nome}}<br />
            CPF nº {{locador_documento}}
          </div>
        </div>
        <div class="signature-block">
          <div class="signature-line">
            <span class="signature-role">Locatário</span>
            {{hospede_nome}}<br />
            CPF nº {{hospede_documento}}
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
