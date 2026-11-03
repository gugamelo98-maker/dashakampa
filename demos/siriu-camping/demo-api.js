/* Siriu Camping — modo demonstração.
   Simula o servidor no próprio navegador: nenhum dado sai daqui e nada é gravado em banco real.
   Os dados são fictícios e reiniciam ao recarregar a página. */
(function () {
  try { localStorage.setItem('akampa_session', JSON.stringify({ token: 'demo', nome: 'Recepção Siriu', username: 'recepcao', role: 'admin' })); localStorage.removeItem('akampa_res'); } catch (e) {}
  const pad = n => String(n).padStart(2, '0');
  const hojeISO = () => { const t = new Date(); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); };
  const d = n => { const x = new Date(hojeISO() + 'T12:00:00'); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
  const agoraISO = (h, dd = 0) => { const x = new Date(d(dd) + 'T00:00:00'); x.setHours(h, Math.floor(Math.random() * 50)); return x.toISOString(); };
  const isAlta = iso => { const [, m, dia] = iso.split('-').map(Number); return (m === 12 && dia >= 20) || m === 1 || m === 2 || (m === 3 && dia <= 20); };
  let DB = null, seq = 500;

  function preco(tipo, ci, co, adultos, criancas) {
    const noites = Math.max(1, Math.round((new Date(co) - new Date(ci)) / 864e5));
    const temp = isAlta(ci) ? 'alta' : 'baixa';
    let p = { base: 0, extras: 0, total: 0 };
    try { p = window.calcReservationPrice(tipo, temp, noites, adultos, criancas || []); } catch (e) {}
    const desc = noites >= 4 ? 0.15 : noites === 3 ? 0.10 : 0;
    return { temp, noites, base: p.base || 0, extras: p.extras || 0, total: p.total || 0, desconto: Math.round((p.total || 0) * desc) };
  }
  function R(nome, wa, spot, ci, co, status, ad, pago, ex = {}) {
    const tipo = spot.startsWith('MH') ? 'motorhome' : 'barraca';
    const pr = preco(tipo, ci, co, ad, ex.cr || []);
    const liq = pr.total - pr.desconto;
    return { id: ++seq, guest_nome: nome, guest_whatsapp: wa, guest_email: ex.email || '', spot_id: spot, spot_tipo: tipo,
      checkin: ci, checkout: co, temporada: pr.temp, adultos: ad, criancas: ex.cr || [], preco_base: pr.base, preco_extras: pr.extras,
      preco_total: pr.total, desconto: pr.desconto, sinal_pago: pago === 'tudo' ? liq : pago === 'metade' ? Math.round(liq / 2) : pago,
      forma_pagamento: ex.fp || 'pix', status, source: ex.src || 'dashboard', notas: ex.notas || '', created_at: agoraISO(10, -12),
      expira_em: ex.expira || null, checkin_at: status === 'checkin' ? agoraISO(15, Math.min(0, Math.round((new Date(ci) - new Date(hojeISO())) / 864e5))) : null,
      checkout_at: status === 'checkout' ? agoraISO(11, Math.round((new Date(co) - new Date(hojeISO())) / 864e5)) : null,
      comprovante: ex.comp ? { id: seq, resultado: ex.comp, motivo: ex.comp === 'analise' ? 'Valor diferente do sinal — conferir' : null, tem_imagem: false } : null };
  }
  function semear() {
    const reservas = [
      // acampados agora
      R('Bruno e Carla Antunes', '5547991230001', 'BAR 01', d(-2), d(1), 'checkin', 2, 'metade', { src: 'whatsapp', comp: 'confirmado' }),
      R('Família Tavares', '5541992340002', 'BAR 03', d(-1), d(2), 'checkin', 4, 'metade', { cr: [{ age: 'under10' }, { age: 'under10' }] }),
      R('Rafael Mendonça', '5548993450003', 'BAR 04', d(-3), d(0), 'checkin', 1, 'metade'),
      R('Grupo Trilha Sul', '5551994560004', 'BAR 07', d(-1), d(3), 'checkin', 5, 'metade', { src: 'whatsapp' }),
      R('Lúcia e Paulo Ramos', '5511995670005', 'MH 01', d(-4), d(0), 'checkin', 2, 'tudo'),
      R('Henrique Bastos', '5521996780006', 'MH 02', d(-1), d(2), 'checkin', 3, 'metade', { src: 'whatsapp', comp: 'confirmado' }),
      R('Juliana Prates', '5548997890007', 'BAR 09', d(-2), d(1), 'checkin', 2, 'tudo'),
      // chegam hoje
      R('Marcos Vidal', '5547998900008', 'BAR 02', d(0), d(2), 'confirmed', 2, 'metade', { src: 'whatsapp', comp: 'confirmado' }),
      R('Ana e Leo Furtado', '5541999010009', 'MH 03', d(0), d(4), 'confirmed', 2, 'metade'),
      R('Turma da Escalada', '5548990120010', 'BAR 10', d(0), d(3), 'confirmed', 4, 'tudo', { src: 'whatsapp' }),
      // futuras
      R('Pedro Salgado', '5551991230011', 'BAR 05', d(2), d(4), 'confirmed', 2, 'metade', { src: 'whatsapp' }),
      R('Camila Duarte', '5511992340012', 'MH 04', d(3), d(7), 'confirmed', 2, 'metade'),
      R('Diego Fontes', '5521993450013', 'BAR 06', d(5), d(7), 'confirmed', 3, 'metade', { src: 'whatsapp' }),
      R('Natália Brito', '5548994560014', 'BAR 01', d(6), d(9), 'confirmed', 2, 'metade'),
      R('Vinícius Amaral', '5547995670015', 'BAR 11', d(8), d(10), 'pending', 2, 0, { src: 'whatsapp', expira: new Date(Date.now() + 18 * 3600e3).toISOString(), comp: 'analise' }),
      R('Família Coelho', '5541996780016', 'MH 01', d(10), d(14), 'confirmed', 4, 'metade', { cr: [{ age: 'under10' }] }),
      R('Sabrina Lopes', '5548997890017', 'BAR 08', d(12), d(14), 'pending', 2, 0, { src: 'whatsapp', expira: new Date(Date.now() + 9 * 3600e3).toISOString() }),
      R('Bruno e Carla Antunes', '5547991230001', 'BAR 02', d(35), d(38), 'confirmed', 2, 'metade', { src: 'whatsapp' }),
      // já vieram
      R('Thiago Rezende', '5551998900018', 'BAR 02', d(-9), d(-6), 'checkout', 2, 'tudo'),
      R('Mônica Siqueira', '5511999010019', 'MH 02', d(-8), d(-4), 'checkout', 2, 'tudo', { src: 'whatsapp' }),
      R('Eduardo Paiva', '5521990120020', 'BAR 05', d(-12), d(-10), 'checkout', 3, 'tudo'),
      R('Carolina Neves', '5548991230021', 'BAR 06', d(-6), d(-3), 'checkout', 2, 'tudo', { src: 'whatsapp' }),
      R('Grupo Bike Litoral', '5547992340022', 'BAR 08', d(-15), d(-12), 'checkout', 6, 'tudo'),
      R('Gustavo Leal', '5541993450023', 'MH 03', d(-20), d(-16), 'checkout', 2, 'tudo'),
      R('Família Tavares', '5541992340002', 'BAR 03', d(-40), d(-37), 'checkout', 4, 'tudo'),
      R('Patrícia Gomes', '5551994560024', 'BAR 11', d(-25), d(-22), 'checkout', 2, 'tudo', { src: 'whatsapp' }),
      R('Renato Silveira', '5511995670025', 'MH 04', d(-18), d(-15), 'checkout', 2, 'tudo'),
      R('Ícaro Moreira', '5521996780026', 'BAR 12', d(-7), d(-5), 'cancelled', 2, 0),
    ];
    const produtos = [
      { id: 1, nome: 'Cerveja lata 350ml', categoria: 'Bebidas', preco: 9, custo: 4.2, estoque: 72, estoque_min: 24 },
      { id: 2, nome: 'Água mineral 500ml', categoria: 'Bebidas', preco: 5, custo: 1.6, estoque: 9, estoque_min: 20 },
      { id: 3, nome: 'Refrigerante lata', categoria: 'Bebidas', preco: 7, custo: 3, estoque: 40, estoque_min: 12 },
      { id: 4, nome: 'Saco de gelo 5kg', categoria: 'Gelo e lenha', preco: 15, custo: 6, estoque: null, estoque_min: 0 },
      { id: 5, nome: 'Feixe de lenha', categoria: 'Gelo e lenha', preco: 25, custo: 10, estoque: 18, estoque_min: 6 },
      { id: 6, nome: 'Carvão 3kg', categoria: 'Gelo e lenha', preco: 28, custo: 13, estoque: 11, estoque_min: 4 },
      { id: 7, nome: 'Pão francês (6 un.)', categoria: 'Mercearia', preco: 8, custo: 3.5, estoque: null, estoque_min: 0 },
      { id: 8, nome: 'Banho quente (ficha)', categoria: 'Serviços', preco: 6, custo: 1, estoque: null, estoque_min: 0 },
      { id: 9, nome: 'Repelente', categoria: 'Mercearia', preco: 22, custo: 11, estoque: 5, estoque_min: 3 },
    ];
    const it = (nome, qtd, h, dd) => { const p = produtos.find(x => x.nome === nome); return { id: ++seq, produto_id: p.id, nome, qtd, preco: p.preco, custo: p.custo, criado_em: agoraISO(h, dd) }; };
    const comandas = [
      { id: 11, reserva_id: reservas[0].id, tipo: 'hospede', balcao: false, nome: reservas[0].guest_nome, spot_id: 'BAR 01', status: 'aberta', pago: 0, aberta_em: agoraISO(15, -2), itens: [it('Feixe de lenha', 1, 19, -2), it('Cerveja lata 350ml', 6, 20, -2), it('Banho quente (ficha)', 2, 8, -1)] },
      { id: 12, reserva_id: reservas[3].id, tipo: 'hospede', balcao: false, nome: reservas[3].guest_nome, spot_id: 'BAR 07', status: 'aberta', pago: 0, aberta_em: agoraISO(16, -1), itens: [it('Saco de gelo 5kg', 2, 17, -1), it('Carvão 3kg', 1, 18, -1), it('Cerveja lata 350ml', 12, 20, -1)] },
      { id: 13, reserva_id: reservas[5].id, tipo: 'hospede', balcao: false, nome: reservas[5].guest_nome, spot_id: 'MH 02', status: 'aberta', pago: 0, aberta_em: agoraISO(16, -1), itens: [it('Pão francês (6 un.)', 2, 8, 0), it('Água mineral 500ml', 4, 12, 0)] },
      { id: 14, reserva_id: null, tipo: 'avulsa', balcao: false, nome: 'Seu Jorge (vizinho)', telefone: '48999990000', status: 'aberta', pago: 0, aberta_em: agoraISO(10, 0), itens: [it('Cerveja lata 350ml', 4, 11, 0)] },
      { id: 15, reserva_id: null, tipo: 'avulsa', balcao: true, nome: 'Venda avulsa', status: 'fechada', pago: 49, forma_pagamento: 'pix', aberta_em: agoraISO(9, 0), fechada_em: agoraISO(9, 0), itens: [it('Saco de gelo 5kg', 2, 9, 0), it('Pão francês (6 un.)', 1, 9, 0), it('Água mineral 500ml', 2, 9, 0)] },
      { id: 16, reserva_id: reservas[4].id, tipo: 'hospede', balcao: false, nome: reservas[4].guest_nome, spot_id: 'MH 01', status: 'fechada', pago: 117, forma_pagamento: 'cartao', aberta_em: agoraISO(16, -4), fechada_em: agoraISO(10, 0), itens: [it('Carvão 3kg', 2, 18, -3), it('Cerveja lata 350ml', 5, 20, -3), it('Repelente', 1, 19, -2)] },
      { id: 17, reserva_id: null, tipo: 'avulsa', balcao: true, nome: 'Venda avulsa', status: 'fechada', pago: 50, forma_pagamento: 'dinheiro', aberta_em: agoraISO(18, -1), fechada_em: agoraISO(18, -1), itens: [it('Feixe de lenha', 2, 18, -1)] },
    ];
    const vendasExtras = [[1, 30, -3], [3, 10, -2], [4, 6, -4], [5, 5, -5], [8, 14, -2], [7, 8, -1], [2, 12, -6], [6, 3, -8]];
    const baixas = [
      { id: 1, produto_id: 1, nome: 'Cerveja lata 350ml', qtd: 3, custo_unit: 4.2, motivo: 'consumo_proprio', obs: 'Equipe — mutirão de limpeza', criado_em: agoraISO(21, -1) },
      { id: 2, produto_id: 2, nome: 'Água mineral 500ml', qtd: 2, custo_unit: 1.6, motivo: 'perda', obs: 'Fardo rasgado', criado_em: agoraISO(14, -3) },
    ];
    const gastos = [
      { id: 1, nome: 'Limpeza dos banheiros (diarista)', categoria: 'Limpeza', valor: 480, data: d(-1) },
      { id: 2, nome: 'Compra de bebidas e gelo', categoria: 'Alimentação', valor: 720, data: d(-2) },
      { id: 3, nome: 'Conta de luz', categoria: 'Utilidades', valor: 610, data: d(-3) },
      { id: 4, nome: 'Conserto do chuveiro', categoria: 'Manutenção', valor: 180, data: d(-2) },
      { id: 5, nome: 'Impulsionamento Instagram', categoria: 'Marketing', valor: 150, data: d(-1) },
    ];
    DB = { reservas, produtos, comandas, vendasExtras, baixas, gastos,
      config: { camping: { nome: 'Siriu Camping', endereco: 'Siriú — Garopaba/SC', chave_pix: 'CNPJ 00.000.000/0001-00', cnpj: '00.000.000/0001-00', checkin: 'a partir das 13h', checkout: 'até as 12h', latitude: '', longitude: '', maps_link: '' },
        informacoes: [
          { titulo: 'Barraca', texto: 'O campista traz a própria barraca e usa um dos espaços gramados, com ponto de luz.' },
          { titulo: 'Motorhome / Trailer', texto: 'Espaço plano com ponto de energia e água.' },
          { titulo: 'Banheiros', texto: 'Banheiros masculino e feminino com chuveiro quente (ficha).' },
          { titulo: 'Fogueira', texto: 'Permitida na área de fogueira, só em dias sem vento.' },
          { titulo: 'Pets', texto: 'Aceitamos pets na guia.' },
          { titulo: 'Praia', texto: 'A 300 m, por trilha.' } ] },
      usuarios: [{ id: 1, nome: 'Recepção Siriu', username: 'recepcao', role: 'admin' }, { id: 2, nome: 'Equipe noite', username: 'noite', role: 'recepcao' }] };
  }
  const tz = iso => { const x = new Date(iso); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
  const total = c => c.itens.reduce((s, i) => s + i.qtd * i.preco, 0);
  const prod = id => DB.produtos.find(p => p.id === Number(id) && !p.removido);
  const mexeEstoque = (pid, delta) => { const p = DB.produtos.find(x => x.id === Number(pid)); if (p && p.estoque !== null) p.estoque += delta; return p ? p.estoque : null; };
  function listarCantina() {
    const vendas = [];
    DB.comandas.filter(c => c.status !== 'cancelada').forEach(c => c.itens.forEach(i => vendas.push({ dia: tz(i.criado_em), produto_id: i.produto_id, nome: i.nome, qtd: i.qtd, receita: i.qtd * i.preco, custo: i.qtd * (i.custo || 0) })));
    DB.vendasExtras.forEach(([pid, q, dd]) => { const p = DB.produtos.find(x => x.id === pid); vendas.push({ dia: d(dd), produto_id: pid, nome: p.nome, qtd: q, receita: q * p.preco, custo: q * p.custo }); });
    return { ok: true,
      produtos: DB.produtos.filter(p => !p.removido).map(p => ({ id: p.id, nome: p.nome, categoria: p.categoria, preco: p.preco, custo: p.custo, estoque: p.estoque, estoque_min: p.estoque_min })),
      comandas: DB.comandas.map(c => Object.assign({}, c, { total: total(c), itens: c.itens.map(i => ({ id: i.id, nome: i.nome, qtd: i.qtd, preco: i.preco, criado_em: i.criado_em })) })),
      vendas, baixas: DB.baixas.map(b => Object.assign({ dia: tz(b.criado_em) }, b)) };
  }
  function cantina(b) {
    const ab = id => DB.comandas.find(c => c.id === Number(id) && c.status === 'aberta');
    switch (b.acao) {
      case 'listar': return listarCantina();
      case 'salvar_produto': {
        if (!String(b.nome || '').trim()) return { ok: false, erro: 'Informe o nome do produto' };
        const dados = { nome: b.nome.trim(), categoria: b.categoria || 'Outros', preco: Number(b.preco) || 0, custo: Number(b.custo) || 0, estoque: b.estoque === '' ? null : Number(b.estoque), estoque_min: Number(b.estoque_min) || 0 };
        if (b.id) { const p = prod(b.id); if (!p) return { ok: false }; Object.assign(p, dados); return { ok: true, id: p.id }; }
        const p = Object.assign({ id: ++seq }, dados); DB.produtos.push(p); return { ok: true, id: p.id };
      }
      case 'entrada_estoque': { const p = prod(b.id); if (!p || !(b.qtd > 0)) return { ok: false }; p.estoque = (p.estoque || 0) + Number(b.qtd); return { ok: true, estoque: p.estoque }; }
      case 'remover_produto': { const p = prod(b.id); if (p) p.removido = true; return { ok: !!p }; }
      case 'baixa': { const p = prod(b.produto_id); if (!p) return { ok: false }; DB.baixas.unshift({ id: ++seq, produto_id: p.id, nome: p.nome, qtd: Number(b.qtd), custo_unit: p.custo, motivo: b.motivo === 'perda' ? 'perda' : 'consumo_proprio', obs: b.obs || null, criado_em: new Date().toISOString() }); return { ok: true, estoque: mexeEstoque(p.id, -Number(b.qtd)) }; }
      case 'desfazer_baixa': { const i = DB.baixas.findIndex(x => x.id === Number(b.id)); if (i < 0) return { ok: false }; const [x] = DB.baixas.splice(i, 1); mexeEstoque(x.produto_id, x.qtd); return { ok: true }; }
      case 'abrir_comanda': {
        if (b.reserva_id) { const ex = DB.comandas.find(c => String(c.reserva_id) === String(b.reserva_id)); if (ex) { ex.status = 'aberta'; ex.fechada_em = null; return { ok: true, id: ex.id }; } }
        const c = { id: ++seq, reserva_id: b.reserva_id ? Number(b.reserva_id) : null, tipo: b.reserva_id ? 'hospede' : 'avulsa', balcao: false, nome: b.nome, telefone: String(b.telefone || '').replace(/\D/g, '') || null, spot_id: b.spot_id || null, status: 'aberta', pago: 0, aberta_em: new Date().toISOString(), itens: [] };
        DB.comandas.unshift(c); return { ok: true, id: c.id };
      }
      case 'adicionar_item': {
        const c = ab(b.comanda_id), p = prod(b.produto_id), q = Number(b.qtd) || 1; if (!c || !p) return { ok: false };
        const ex = c.itens.find(i => i.produto_id === p.id && i.preco === p.preco && tz(i.criado_em) === hojeISO());
        if (ex) ex.qtd += q; else c.itens.push({ id: ++seq, produto_id: p.id, nome: p.nome, qtd: q, preco: p.preco, custo: p.custo, criado_em: new Date().toISOString() });
        return { ok: true, estoque: mexeEstoque(p.id, -q) };
      }
      case 'alterar_qtd': {
        for (const c of DB.comandas.filter(x => x.status === 'aberta')) { const i = c.itens.find(x => x.id === Number(b.item_id)); if (i && i.qtd + Number(b.delta) >= 1) { i.qtd += Number(b.delta); if (i.produto_id) mexeEstoque(i.produto_id, -Number(b.delta)); return { ok: true, qtd: i.qtd }; } }
        return { ok: false };
      }
      case 'item_livre': { const c = ab(b.comanda_id); if (!c || !(Number(b.preco) > 0)) return { ok: false }; c.itens.push({ id: ++seq, produto_id: null, nome: b.nome, qtd: Number(b.qtd) || 1, preco: Number(b.preco), custo: 0, criado_em: new Date().toISOString() }); return { ok: true }; }
      case 'remover_item': {
        for (const c of DB.comandas.filter(x => x.status === 'aberta')) { const k = c.itens.findIndex(x => x.id === Number(b.item_id)); if (k >= 0) { const [i] = c.itens.splice(k, 1); if (i.produto_id) mexeEstoque(i.produto_id, i.qtd); return { ok: true }; } }
        return { ok: false };
      }
      case 'fechar_comanda': { const c = ab(b.id); if (!c) return { ok: false }; c.status = 'fechada'; c.fechada_em = new Date().toISOString(); c.forma_pagamento = b.forma || null; c.pago = Number(b.valor) || 0; return { ok: true }; }
      case 'cancelar_comanda': { const c = ab(b.id); if (!c) return { ok: false }; c.itens.forEach(i => i.produto_id && mexeEstoque(i.produto_id, i.qtd)); c.status = 'cancelada'; c.fechada_em = new Date().toISOString(); return { ok: true }; }
      case 'venda_rapida': {
        const itens = (b.itens || []).map(x => { const p = x.produto_id ? prod(x.produto_id) : null; return p ? { id: ++seq, produto_id: p.id, nome: p.nome, qtd: Number(x.qtd), preco: p.preco, custo: p.custo, criado_em: new Date().toISOString() } : (x.nome && x.preco > 0 ? { id: ++seq, produto_id: null, nome: x.nome, qtd: Number(x.qtd), preco: Number(x.preco), custo: 0, criado_em: new Date().toISOString() } : null); }).filter(Boolean);
        if (!itens.length) return { ok: false, erro: 'Adicione pelo menos um item' };
        itens.forEach(i => i.produto_id && mexeEstoque(i.produto_id, -i.qtd));
        const c = { id: ++seq, reserva_id: null, tipo: 'avulsa', balcao: true, nome: String(b.nome || '').trim() || 'Venda avulsa', status: 'fechada', pago: Number(b.valor) || 0, forma_pagamento: b.forma || null, aberta_em: new Date().toISOString(), fechada_em: new Date().toISOString(), itens };
        DB.comandas.unshift(c); return { ok: true, id: c.id };
      }
    }
    return { ok: false, erro: 'ação inválida' };
  }
  function api(url, opt) {
    if (!DB) semear();
    const u = new URL(url, location.href), path = u.pathname, metodo = (opt && opt.method) || 'GET';
    let b = {}; try { b = opt && opt.body ? JSON.parse(opt.body) : {}; } catch (e) {}
    if (path.endsWith('/auth/verify') || path.endsWith('/auth/login')) return { ok: true, token: 'demo', nome: 'Recepção Siriu', username: 'recepcao', role: 'admin' };
    if (path.endsWith('/auth/register')) { DB.usuarios.push({ id: ++seq, nome: b.nome || b.username, username: b.username, role: 'recepcao' }); return { ok: true }; }
    if (path.endsWith('/akampa/reservas')) return { ok: true, reservas: DB.reservas };
    if (path.endsWith('/akampa/status')) {
      const r = DB.reservas.find(x => x.id === Number(b.id)); if (!r) return { ok: false };
      r.status = b.status;
      if (b.status === 'checkin') { r.checkin_at = new Date().toISOString(); if (!DB.comandas.some(c => c.reserva_id === r.id)) DB.comandas.unshift({ id: ++seq, reserva_id: r.id, tipo: 'hospede', balcao: false, nome: r.guest_nome, spot_id: r.spot_id, status: 'aberta', pago: 0, aberta_em: new Date().toISOString(), itens: [] }); }
      if (b.status === 'checkout') { r.checkout_at = new Date().toISOString(); DB.comandas.filter(c => c.reserva_id === r.id && c.status === 'aberta' && !c.itens.length).forEach(c => { c.status = 'fechada'; c.fechada_em = new Date().toISOString(); }); }
      return { ok: true, reserva: r };
    }
    if (path.endsWith('/akampa/pagar')) {
      const r = DB.reservas.find(x => x.id === Number(b.id)); if (!r) return { ok: false };
      const liq = r.preco_total - (r.desconto || 0);
      r.sinal_pago = b.valor ? Math.round((Number(r.sinal_pago) + Number(b.valor)) * 100) / 100 : liq;
      if (r.status === 'pending') { r.status = 'confirmed'; r.expira_em = null; }
      return { ok: true, sinal_pago: r.sinal_pago, status: r.status, notas: r.notas };
    }
    if (path.endsWith('/akampa/reserva')) {
      const tipo = String(b.spot_id || '').startsWith('MH') ? 'motorhome' : 'barraca';
      if (DB.reservas.some(r => r.spot_id === b.spot_id && !['cancelled', 'no_show', 'checkout'].includes(r.status) && r.checkin < b.checkout && r.checkout > b.checkin)) return { __status: 409, ok: false, message: 'Esse espaço já está ocupado nessas datas!' };
      const pr = preco(tipo, b.checkin, b.checkout, Number(b.adultos) || 1, b.criancas || []);
      const total = b.preco_diaria_custom > 0 ? b.preco_diaria_custom * pr.noites : pr.total;
      const r = { id: ++seq, guest_nome: b.nome, guest_whatsapp: b.whatsapp || '', guest_email: b.email || '', data_nascimento: b.data_nascimento || null, spot_id: b.spot_id, spot_tipo: tipo,
        checkin: b.checkin, checkout: b.checkout, temporada: b.temporada || pr.temp, adultos: Number(b.adultos) || 1, criancas: b.criancas || [], preco_base: pr.base, preco_extras: pr.extras, preco_total: total,
        desconto: Number(b.desconto) || 0, sinal_pago: Number(b.sinal_pago) || 0, forma_pagamento: b.forma_pagamento || 'pix', status: 'confirmed', source: 'dashboard', notas: '', created_at: new Date().toISOString() };
      DB.reservas.push(r); return { ok: true, reserva: r };
    }
    if (path.endsWith('/akampa/comprovante')) {
      const r = DB.reservas.find(x => x.id === Number(u.searchParams.get('reserva_id')));
      if (!r || !r.comprovante) return { ok: true, comprovantes: [], notas: r ? r.notas : '' };
      const sinal = Math.round((r.preco_total - r.desconto) / 2);
      return { ok: true, notas: r.notas, comprovantes: [{ id: r.comprovante.id, resultado: r.comprovante.resultado, valor: r.comprovante.resultado === 'analise' ? sinal - 20 : sinal, valor_lido: r.comprovante.resultado === 'analise' ? sinal - 20 : sinal, data_pix: r.created_at, motivo: r.comprovante.motivo || 'Valor e destinatário conferidos pela IA', criado_em: r.created_at, mimetype: null, imagem_base64: null }] };
    }
    if (path.endsWith('/akampa/cantina')) return cantina(b);
    if (path.endsWith('/akampa/gastos')) {
      if (metodo === 'POST') { const g = { id: ++seq, nome: b.nome, valor: Number(b.valor), data: b.data, categoria: b.categoria || null }; DB.gastos.unshift(g); return { ok: true, gasto: g }; }
      if (metodo === 'DELETE') { DB.gastos = DB.gastos.filter(g => g.id !== Number(b.id)); return { ok: true }; }
      return { ok: true, gastos: DB.gastos };
    }
    if (path.endsWith('/akampa/config')) { if (metodo === 'POST') { DB.config[b.chave] = b.valor; return { ok: true }; } return { ok: true, config: DB.config }; }
    if (path.endsWith('/akampa/usuarios')) { if (metodo === 'DELETE') { DB.usuarios = DB.usuarios.filter(x => x.id !== Number(b.id)); return { ok: true }; } return { ok: true, usuarios: DB.usuarios }; }
    return { ok: true };
  }
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = function (url, opt) {
    const s = String(url && url.url || url);
    if (!/\/webhook\//.test(s)) return fetchOriginal(url, opt);
    return new Promise(res => setTimeout(() => {
      let corpo; try { corpo = api(s, opt); } catch (e) { console.error('[demo]', e); corpo = { ok: false, erro: 'Erro na demonstração' }; }
      const st = corpo && corpo.__status || 200; if (corpo) delete corpo.__status;
      res(new Response(JSON.stringify(corpo), { status: st, headers: { 'Content-Type': 'application/json' } }));
    }, 120));
  };
})();
