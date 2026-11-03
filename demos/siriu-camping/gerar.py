import sys,re
S=sys.argv[1]
s=open('/home/user/dashakampa/index.html').read()
def rep(a,b,n=1,must=True):
    global s
    if must: assert a in s, a[:70]
    s=s.replace(a,b) if n==0 else s.replace(a,b,n)
# modo demonstração (antes de qualquer script)
rep('<script src="https://cdnjs.cloudflare.com','<script src="demo-api.js"></script>\n<script src="https://cdnjs.cloudflare.com')
# marca
rep('<title>Akampa Siriú — Painel</title>','<title>Siriu Camping — Painel</title>')
rep('🌿 Akampa Siriú','⛺ Siriu Camping'); rep('Akampa Siriú','Siriu Camping',0)
rep('Eco Glamping · Garopaba SC','Camping · Barracas e Motorhomes',0)
# espaços
a=s.index('const ALL_SPOTS = {'); b=s.index('};',a)+2
bar=',\n'.join("    {id:'BAR %02d',emoji:'🏕',label:'BAR %02d'}"%(i,i) for i in range(1,13))
mh=',\n'.join("    {id:'MH %02d',emoji:'🚐',label:'MH %02d'}"%(i,i) for i in range(1,5))
s=s[:a]+"const ALL_SPOTS = {\n  glamping: [],\n  barraca: [\n"+bar+"\n  ],\n  motorhome: [\n"+mh+"\n  ]\n};"+s[b:]
rep('const TOTAL_SPOTS=13;','const TOTAL_SPOTS=16;')
s=re.sub(r"\n\s*\{label:'[^']*Glamping[^']*',spots:ALL_SPOTS\.glamping\},","",s)
# ocupação
i=s.index('<div class="stat-card"><div class="stat-header"><span class="stat-label">Glamping</span>'); j=s.index('<div class="stat-card">',i+10)
grid_start=s.rindex('<div class="stats-grid"',0,i)
s=s[:i]+s[j:]
s=s[:grid_start]+s[grid_start:].replace('<div class="stats-grid" style="margin-bottom:20px">','<div class="stats-grid" style="margin-bottom:20px;grid-template-columns:repeat(3,1fr)">',1)
rep("  set('occ-glm',","  if(0) set('occ-glm',"); rep("  set('occ-glm-sub',","  if(0) set('occ-glm-sub',")
s=s.replace("/ 5</span>`);\n  set('occ-bar-sub',`${Math.round(bar/5*100)}","/ 12</span>`);\n  set('occ-bar-sub',`${Math.round(bar/12*100)}")
s=s.replace("/ 2</span>`);\n  set('occ-mh-sub',`${Math.round(mh/2*100)}","/ 4</span>`);\n  set('occ-mh-sub',`${Math.round(mh/4*100)}")
s=s.replace('id="occ-bar-card">0 <span style="font-size:16px;color:var(--fg-muted);font-weight:500">/ 5','id="occ-bar-card">0 <span style="font-size:16px;color:var(--fg-muted);font-weight:500">/ 12')
s=s.replace('id="occ-mh">0 <span style="font-size:16px;color:var(--fg-muted);font-weight:500">/ 2','id="occ-mh">0 <span style="font-size:16px;color:var(--fg-muted);font-weight:500">/ 4')
s=s.replace('active.length/13','active.length/16').replace('de 13 spots','de 16 espaços').replace('de 13 acomoda','de 16 acomoda')
s=re.sub(r'\$\{active\.length\} de 13','${active.length} de 16',s)
# formulário e preços sem glamping
s=re.sub(r'\s*<option value="glamping">[^<]*</option>','',s)
i=s.index('<span class="card-title">⛺ Glamping</span>'); ci=s.rindex('<div class="card">',0,i); cj=s.index('<div class="card">',i)
s=s[:ci]+s[cj:]
# relatórios
rep("const tipoStats={glamping:{res:0,diarias:0,receita:0},barraca:","const tipoStats={barraca:")
rep("(sid.startsWith('bar')?'barraca':sid.startsWith('mh')?'motorhome':'glamping')","(sid.startsWith('mh')?'motorhome':'barraca')")
open(S+'/site/index.html','w').write(s)
s=open(S+'/site/index.html').read()
i=s.index('<span class="card-title">👶 Glamping'); ci=s.rindex('<div class="card">',0,i); cj=s.index('\n    </div>\n\n    <!-- ══ RELATÓRIOS',i)
s=s[:ci]+'</div>'[0:0]+s[cj:]
# fecha a div do card removido corretamente: o bloco removido vai até antes do fechamento da view
open(S+'/site/index.html','w').write(s)
