(function(){
'use strict';
var WA='522821073249', P=window.PRODUCTS||[], CATS=window.CATS||[];
var $=function(s){return document.querySelector(s)};
var fmt=function(v){return '$'+v.toLocaleString('es-MX',{maximumFractionDigits:0})};
var norm=function(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
var esc=function(s){return (s||'').toString().replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var byId={};P.forEach(function(p){p._q=norm([p.n,p.k.join(' '),p.d,p.s,p.c,p.co.join(' '),p.t.join(' ')].join(' '));byId[p.id]=p});
var state={q:'',cat:'',sort:'',limit:40,tag:''};
// ---- colores por categoría (editar aquí: c = color, dk = texto oscuro, img = foto del mosaico) ----
var CS={'Fútbol':{c:'#16A34A',img:'p0099'},'Básquetbol':{c:'#F97316',img:'p0455'},'Voleibol':{c:'#FACC15',dk:1,img:'p0618'},'Uniformes y textiles':{c:'#2563EB',img:'p0684'},'Fútbol americano':{c:'#92400E',img:'p0798'},'Béisbol':{c:'#0F766E',img:'p0855'},'Raqueta':{c:'#84CC16',dk:1,img:'p0883'},'Handball y waterpolo':{c:'#0891B2',img:'p0915'},'Entrenamiento':{c:'#F59E0B',dk:1,img:'p0921'},'Gimnasio':{c:'#7C3AED',img:'p1026'},'Cuidado y soporte':{c:'#EC4899',img:'p1095'},'Boxeo':{c:'#DC2626',img:'p1176'},'Natación':{c:'#06B6D4',img:'p1255'},'Trofeos y medallas':{c:'#EAB308',dk:1,img:'p1417'},'Accesorios':{c:'#6366F1',img:'p1481'},'Calzado':{c:'#E11D48',img:'p1580'},'Zapateras':{c:'#475569',img:'p1694'},'Mochilas y maletas':{c:'#9333EA',img:'p1720'}};
function cs(c){return CS[c]||{c:'#0B1F44'}}
function cvar(c){var x=cs(c);return '--c:'+x.c}
// ---- ofertas.json / banners.json (se cargan al iniciar; si no existen, el sitio funciona igual) ----
var OF={productos:{},destacados:[]},BN=[];
function tagOf(p){for(var i=0;i<p.k.length;i++){var o=OF.productos[p.k[i]];if(o)return o}return OF.productos[p.id]||null}
function ep(p){var o=tagOf(p);return (o&&typeof o.precio_oferta==='number'&&o.precio_oferta>0&&o.precio_oferta<p.p)?o.precio_oferta:p.p}
function slug(t){return norm(t).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
// ---- fotos y videos extra (media.js / media.json) ----
var MEDIA=window.MEDIA||{};
function asList(v){return Array.isArray(v)?v:(v?[v]:[])}
function mediaFor(p){var im=[],vd=[],seen={};[p.id].concat(p.k).forEach(function(key){var m=MEDIA[key];if(!m)return;
  asList(m.images).forEach(function(x){var s=typeof x==='string'?x:x.src;if(s&&!seen[s]){seen[s]=1;im.push(typeof x==='string'?{src:x}:x)}});
  asList(m.videos).forEach(function(x){var s=typeof x==='string'?x:x.src;if(s&&!seen[s]){seen[s]=1;vd.push(typeof x==='string'?{src:x}:x)}})});
  return {images:im,videos:vd}}
function big(s){return /^img\/p\/p\d+\.webp$/.test(s||'')?s.replace(/\.webp$/,'-900.webp'):s}
function thumbOf(src){var m=/^media\/(?!thumbs\/)(.+)$/.exec(src);return m?'media/thumbs/'+m[1]:src}
function ytId(u){var m=/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/.exec(u);return m?m[1]:null}
function vidKind(u){if(ytId(u))return 'yt';if(/facebook\.com|fb\.watch/.test(u))return 'fb';if(/\.(mp4|webm|m4v)(\?|$)/i.test(u))return 'mp4';return 'link'}
function vidPoster(v){if(v.poster)return v.poster;var k=vidKind(v.src);if(k==='yt')return 'https://i.ytimg.com/vi/'+ytId(v.src)+'/hqdefault.jpg';if(k==='mp4'&&/^media\//.test(v.src))return v.src.replace(/\.(mp4|webm|m4v)$/i,'.jpg');return ''}
function playVideo(slide,v){var k=vidKind(v.src),h;
  if(k==='yt')h='<iframe src="https://www.youtube-nocookie.com/embed/'+ytId(v.src)+'?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>';
  else if(k==='fb')h='<iframe src="https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(v.src)+'&show_text=false&autoplay=true" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>';
  else if(k==='mp4')h='<video controls playsinline autoplay preload="metadata" src="'+esc(v.src)+'"></video>';
  else {window.open(v.src,'_blank','noopener');return}
  slide.innerHTML=h;slide.classList.add('playing')}
function stopVideos(){document.querySelectorAll('.gal .slide.playing').forEach(function(s){var v=s._v;s.classList.remove('playing');s.innerHTML=vidPh(v)})}
function vidPh(v){var po=vidPoster(v);return (po?'<img alt="" loading="lazy" src="'+esc(po)+'" onerror="this.remove()">':'')+'<span class="play" aria-hidden="true">▶</span><span class="vlabel">'+esc(v.title||'Ver video')+'</span>'}
var cart=[];try{cart=JSON.parse(localStorage.getItem('dp_cart')||'[]')}catch(e){cart=[]}
cart=cart.filter(function(it){return byId[it.id]});
function save(){try{localStorage.setItem('dp_cart',JSON.stringify(cart))}catch(e){}$('#cartCount').textContent=cart.reduce(function(a,b){return a+b.qty},0)}
function wa(text){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(text)}
function toast(t){var el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(function(){el.hidden=true},1800)}
// chips
var chips=$('#chips');
function chip(label,val){var b=document.createElement('button');b.className='chip'+(val&&cs(val).dk?' dk':'');if(val)b.setAttribute('style',cvar(val));b.textContent=label;b.dataset.v=val;b.onclick=function(){state.cat=val;state.tag='';state.limit=40;render();b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};chips.appendChild(b)}
chip('Todos','');CATS.forEach(function(c){chip(c,c)});
function list(){
  var terms=norm(state.q).split(/\s+/).filter(Boolean);
  var r=P.filter(function(p){if(state.cat&&p.c!==state.cat)return false;if(state.tag){var tt=tagOf(p);if(!tt||!(state.tag==='Oferta'?(ep(p)<p.p||tt.etiqueta==='Oferta'):tt.etiqueta===state.tag))return false}for(var i=0;i<terms.length;i++){var t=terms[i];if(p._q.indexOf(t)<0){if(t.length>3&&t.endsWith('es')&&p._q.indexOf(t.slice(0,-2))>=0)continue;if(t.length>3&&t.endsWith('s')&&p._q.indexOf(t.slice(0,-1))>=0)continue;return false}}return true});
  if(state.sort==='asc')r=r.slice().sort(function(a,b){return ep(a)-ep(b)});if(state.sort==='desc')r=r.slice().sort(function(a,b){return ep(b)-ep(a)});
  return r}
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=e.target;if(i.dataset.srcset)i.srcset=i.dataset.srcset;i.src=i.dataset.src;io.unobserve(i)}})},{rootMargin:'300px'}):null;
function card(p){
  var d=document.createElement('article');d.className='card';d.tabIndex=0;
  var meta=[];if(p.k.length)meta.push('Cód. '+p.k[0]+(p.k.length>1?' +'+(p.k.length-1):''));
  var extra=[];if(p.t.length)extra.push(p.t.join(', '));if(p.co.length)extra.push(p.co.join(', '));
  var md=mediaFor(p),badge='';
  if(md.images.length)badge+='<span class="mb">+'+md.images.length+(md.images.length===1?' foto':' fotos')+'</span>';
  if(md.videos.length)badge+='<span class="mb vid" title="Tiene video">▶</span>';
  var t=tagOf(p),x=cs(p.c);d.setAttribute('style',cvar(p.c));
  d.innerHTML='<div class="ph"><span class="cbadge'+(x.dk?' dk':'')+'">'+esc(p.s&&p.s!==p.c&&p.s.length<22?p.s:p.c)+'</span>'+(t&&t.etiqueta?'<span class="sbadge t-'+slug(t.etiqueta)+'">'+esc(t.etiqueta)+'</span>':'')+(badge?'<span class="mbs">'+badge+'</span>':'')+(p.img?'<img alt="'+esc(p.n)+'" width="400" height="400" loading="lazy" decoding="async" sizes="(max-width:700px) 48vw, 260px" '+(io?'data-srcset':'srcset')+'="'+p.img+' 480w, '+big(p.img)+' 900w" '+(io?'data-src':'src')+'="'+p.img+'">':'')+'</div><div class="bd"><h3>'+esc(p.n)+'</h3>'+(meta.length?'<div class="meta">'+esc(meta[0])+'</div>':'')+(extra.length?'<div class="meta">'+esc(extra.join(' · '))+'</div>':'')+'<div class="pr"><span>'+(ep(p)<p.p?'<span class="was">Antes '+fmt(p.p)+'</span>':'')+'<span class="price">'+fmt(ep(p))+'</span>'+(p.iva?'<span class="iva">+ IVA</span>':'')+'</span><button class="add" aria-label="Agregar">+</button></div></div>';
  if(io&&p.img)io.observe(d.querySelector('img'));
  d.onclick=function(){openDetail(p.id)};d.onkeydown=function(e){if(e.key==='Enter')openDetail(p.id)};
  return d}
function render(){
  [].forEach.call(chips.children,function(b){b.classList.toggle('on',b.dataset.v===state.cat)});
  var filt=!!(state.q||state.cat||state.tag);$('#home').hidden=filt;
  $('#catTitle').innerHTML='<span>'+esc(state.tag?(state.tag==='Oferta'?'Ofertas':state.tag==='Nuevo'?'Lo más nuevo':state.tag==='Más vendido'?'Más vendidos':state.tag):state.cat?state.cat:state.q?'Resultados':'Todo el catálogo')+'</span>';
  $('#catTitle').setAttribute('style',state.cat?'--x:1':'');var sp=$('#catTitle span');if(state.cat)sp.style.background=cs(state.cat).c,sp.style.color=cs(state.cat).dk?'#151b28':'#fff';
  var r=list(),g=$('#grid');g.innerHTML='';
  $('#count').textContent=r.length+(r.length===1?' producto':' productos');
  if(!r.length){g.innerHTML='<div class="empty">No encontramos productos con esa búsqueda.<br>Escríbenos por WhatsApp y te ayudamos.</div>'}
  r.slice(0,state.limit).forEach(function(p){g.appendChild(card(p))});
  var m=$('#more');m.innerHTML='';
  if(r.length>state.limit){var b=document.createElement('button');b.textContent='Ver más ('+(r.length-state.limit)+')';b.onclick=function(){state.limit+=40;render()};m.appendChild(b)}
}
var tq;$('#q').addEventListener('input',function(e){clearTimeout(tq);tq=setTimeout(function(){var was=!!(state.q||state.cat||state.tag);state.q=e.target.value;state.limit=40;render();if(!was&&state.q)toCatalog()},160)});
function toCatalog(){var el=$('#catalogo'),y=el.getBoundingClientRect().top+window.scrollY-$('#top').offsetHeight-4;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}
function goHome(){state.q='';state.cat='';state.tag='';state.limit=40;$('#q').value='';render();window.scrollTo({top:0,behavior:'smooth'})}
function go(link){link=link||'';if(link.indexOf('cat:')===0){state.cat=link.slice(4);state.q='';state.tag='';$('#q').value='';state.limit=40;render();toCatalog()}else if(link.indexOf('q:')===0){state.q=link.slice(2);state.cat='';state.tag='';$('#q').value=state.q;state.limit=40;render();toCatalog()}else if(link.indexOf('wa:')===0){window.open(wa(link.slice(3)),'_blank','noopener')}else if(/^https?:\/\//.test(link)){window.open(link,'_blank','noopener')}}
$('#homeLink').onclick=function(e){e.preventDefault();goHome()};
// ---- mosaicos de categorías ----
function tiles(){var cnt={};P.forEach(function(p){cnt[p.c]=(cnt[p.c]||0)+1});
  $('#tiles').innerHTML=CATS.map(function(c){var x=cs(c),im=x.img&&byId[x.img]&&byId[x.img].img;return '<button class="tile'+(x.dk?' dk':'')+'" style="'+cvar(c)+'" data-c="'+esc(c)+'"><b>'+esc(c)+'</b>'+(im?'<img alt="" loading="lazy" decoding="async" src="'+im+'">':'')+'<i>'+(cnt[c]||0)+'</i></button>'}).join('');
  $('#tiles').onclick=function(e){var t=e.target.closest('.tile');if(t)go('cat:'+t.dataset.c)}}
// ---- banners ----
var hero={i:0,t:null,n:0};
function heroSlides(){var L=(BN||[]).filter(function(b){return b&&b.activo!==false&&b.titulo});
  if(!L.length){$('#hero').hidden=true;return}
  $('#htrack').innerHTML=L.map(function(b,i){var dark=b.texto==='oscuro',ims=asList(b.imagenes||b.imagen).slice(0,2);
    return '<div class="hslide'+(dark?' dark':'')+'" role="group" aria-roledescription="banner" aria-label="'+(i+1)+' de '+L.length+'" data-link="'+esc(b.link||'')+'" style="background:linear-gradient(118deg,'+esc(b.color||'#0B1F44')+' 0%,'+esc(b.color2||b.color||'#0B1F44')+' 100%)">'+
    '<div class="htext">'+(b.etiqueta?'<span class="htag">'+esc(b.etiqueta)+'</span>':'')+'<h3 class="htitle">'+esc(b.titulo)+'</h3>'+(b.subtitulo?'<p class="hsub">'+esc(b.subtitulo)+'</p>':'')+(b.boton?'<span class="hbtn'+(/^wa:/.test(b.link||'')?' wa':'')+'">'+esc(b.boton)+' ›</span>':'')+'</div>'+
    (ims.length?'<div class="himgs">'+ims.map(function(s,j){return '<span class="hi"><img alt="" '+(i?'loading="lazy" ':'')+'decoding="async" src="'+esc(s)+'"></span>'}).join('')+'</div>':'')+'</div>'}).join('');
  $('#hdots').innerHTML=L.map(function(b,i){return '<button aria-label="Banner '+(i+1)+'"'+(i?'':' class="on"')+'></button>'}).join('');
  hero.n=L.length;$('#hero').hidden=false;
  var tr=$('#htrack');
  tr.onclick=function(e){var s=e.target.closest('.hslide');if(s)go(s.dataset.link)};
  tr.addEventListener('scroll',function(){var i=Math.round(tr.scrollLeft/tr.clientWidth);if(i!==hero.i){hero.i=i;[].forEach.call($('#hdots').children,function(d,j){d.classList.toggle('on',j===i)})}},{passive:true});
  $('#hdots').onclick=function(e){var d=e.target.closest('button');if(!d)return;var i=[].indexOf.call($('#hdots').children,d);tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'});restart()};
  ['pointerdown','touchstart','focusin'].forEach(function(ev){tr.addEventListener(ev,restart,{passive:true})});
  restart()}
function restart(){clearInterval(hero.t);if(hero.n<2||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
  hero.t=setInterval(function(){if(document.hidden||$('#home').hidden)return;var tr=$('#htrack');tr.scrollTo({left:((hero.i+1)%hero.n)*tr.clientWidth,behavior:'smooth'})},5500)}
// ---- carruseles: ofertas / nuevos / más vendidos / destacados ----
function rows(){var seen={};
  function fill(sec,row,arr){var g=$(row);g.innerHTML='';arr=arr.filter(function(p){return p&&p.img}).slice(0,16);$(sec).hidden=!arr.length;arr.forEach(function(p){g.appendChild(card(p))})}
  var tagged=P.filter(function(p){return tagOf(p)});
  fill('#secOfertas','#rowOfertas',tagged.filter(function(p){var t=tagOf(p);return ep(p)<p.p||t.etiqueta==='Oferta'}));
  fill('#secNuevos','#rowNuevos',tagged.filter(function(p){return tagOf(p).etiqueta==='Nuevo'}));
  fill('#secTop','#rowTop',tagged.filter(function(p){return tagOf(p).etiqueta==='Más vendido'}));
  var d=[];asList(OF.destacados).forEach(function(k){if(byId[k]){d.push(byId[k]);return}for(var i=0;i<P.length;i++){if(P[i].k.indexOf(k)>=0){d.push(P[i]);break}}});
  fill('#secDest','#rowDest',d)}
document.querySelectorAll('.seeall').forEach(function(b){b.onclick=function(){state.tag=b.dataset.tag;state.cat='';state.q='';$('#q').value='';state.limit=40;render();toCatalog()}});
$('#sort').onchange=function(e){state.sort=e.target.value;render()};
// detail
function lineFor(p,o,qty){var s='• '+(p.k.length?'['+p.k[0]+'] ':'')+p.n;if(o.talla)s+=' — Talla/medida: '+o.talla;if(o.color)s+=' — Color: '+o.color;if(o.nota)s+=' — Nota: '+o.nota;s+='\n   Cantidad: '+qty+' × '+fmt(ep(p))+(p.iva?' + IVA':'')+' = '+fmt(ep(p)*qty)+(p.iva?' + IVA':'');return s}
function openDetail(id){
  var p=byId[id],qty=1,b=$('#detailBody');
  var md=mediaFor(p),sl=[];
  if(p.img)sl.push({t:'img',src:big(p.img),th:p.img});
  md.images.forEach(function(x){sl.push({t:'img',src:x.src,th:x.thumb||thumbOf(x.src)})});
  md.videos.forEach(function(v){sl.push({t:'vid',v:v,th:vidPoster(v)})});
  var h;
  if(sl.length<=1&&!md.videos.length)h='<div class="dimg">'+(p.img?'<img alt="'+esc(p.n)+'" src="'+big(p.img)+'">':'')+'</div>';
  else{h='<div class="galw"><div class="gal" id="gal">'+sl.map(function(x,i){return x.t==='img'?'<div class="slide"><img alt="'+esc(p.n)+' — foto '+(i+1)+'" '+(i?'loading="lazy" ':'')+'src="'+esc(x.src)+'"></div>':'<div class="slide vslide" data-i="'+i+'" role="button" tabindex="0" aria-label="Reproducir video"></div>'}).join('')+'</div><span class="gcount" id="gcount">1/'+sl.length+'</span></div>';
    h+='<div class="thumbs" id="thumbs">'+sl.map(function(x,i){return '<button class="th'+(i?'':' on')+'" data-i="'+i+'" aria-label="'+(x.t==='vid'?'Video':'Foto '+(i+1))+'">'+(x.th?'<img alt="" loading="lazy" src="'+esc(x.th)+'" onerror="this.remove()">':'')+(x.t==='vid'?'<span class="play sm">▶</span>':'')+'</button>'}).join('')+'</div>'}
  var tg=tagOf(p);h+='<span class="dcat'+(cs(p.c).dk?' dk':'')+'">'+esc(p.c)+'</span>'+(tg&&tg.etiqueta?' <span class="sbadge t-'+slug(tg.etiqueta)+'" style="position:static;display:inline-block">'+esc(tg.etiqueta)+'</span>':'')+'<h2>'+esc(p.n)+'</h2>';
  h+='<div class="dl"><b>Categoría:</b> '+esc(p.c)+(p.s!==p.c?' · '+esc(p.s):'')+'</div>';
  if(p.k.length)h+='<div class="dl"><b>Código:</b> '+esc(p.k.join(', '))+'</div>';
  if(p.d)h+='<div class="dl">'+esc(p.d)+'</div>';
  if(p.t.length)h+='<div class="dl"><b>Tallas/medidas:</b> '+esc(p.t.join(', '))+'</div>';
  if(p.co.length)h+='<div class="dl"><b>Colores:</b> '+esc(p.co.join(', '))+'</div>';
  h+='<div class="dprice">'+fmt(ep(p))+(ep(p)<p.p?'<span class="was">Antes '+fmt(p.p)+'</span>':'')+(p.iva?' <span class="iva">+ IVA</span>':'')+'</div>';
  if(p.t.length>1)h+='<div class="field"><label for="fT">Talla / medida</label><select id="fT">'+p.t.map(function(t){return '<option>'+esc(t)+'</option>'}).join('')+'</select></div>';
  if(p.co.length>1)h+='<div class="field"><label for="fC">Color</label><select id="fC">'+p.co.map(function(t){return '<option>'+esc(t)+'</option>'}).join('')+'</select></div>';
  h+='<div class="field"><label for="fN">Nota (talla, color u otro detalle)</label><input id="fN" maxlength="80" placeholder="Opcional"></div>';
  h+='<div class="field"><label>Cantidad</label><div class="qty"><button id="qm" aria-label="Menos">−</button><span id="qv">1</span><button id="qp" aria-label="Más">+</button></div></div>';
  h+='<div class="actions"><button class="primary" id="addBtn">Agregar al pedido</button><a class="wabtn" id="oneBtn" target="_blank" rel="noopener">Pedir este producto por WhatsApp</a></div><p class="note">Precios sujetos a cambio sin previo aviso. Confirmamos existencias por WhatsApp.</p>';
  b.innerHTML=h;$('#detail .sheetbox').setAttribute('style',cvar(p.c));
  var gal=$('#gal');
  if(gal){var slides=gal.children,ths=$('#thumbs').children;
    [].forEach.call(slides,function(el){if(el.classList.contains('vslide')){var v=sl[+el.dataset.i].v;el._v=v;el.innerHTML=vidPh(v);el.onclick=function(){if(!el.classList.contains('playing'))playVideo(el,v)};el.onkeydown=function(e){if(e.key==='Enter')el.onclick()}}});
    var cur=0;gal.addEventListener('scroll',function(){var i=Math.round(gal.scrollLeft/gal.clientWidth);if(i!==cur){cur=i;stopVideos();$('#gcount').textContent=(i+1)+'/'+slides.length;[].forEach.call(ths,function(t,j){t.classList.toggle('on',j===i)});ths[i]&&ths[i].scrollIntoView({inline:'nearest',block:'nearest'})}},{passive:true});
    $('#thumbs').onclick=function(e){var t=e.target.closest('.th');if(!t)return;gal.scrollTo({left:+t.dataset.i*gal.clientWidth,behavior:'smooth'})}}
  var opts=function(){return {talla:$('#fT')?$('#fT').value:(p.t.length===1?p.t[0]:''),color:$('#fC')?$('#fC').value:(p.co.length===1?p.co[0]:''),nota:$('#fN').value.trim()}};
  var upd=function(){$('#qv').textContent=qty;$('#oneBtn').href=wa('Hola Deportes Perote, me interesa este producto:\n'+lineFor(p,opts(),qty)+'\n\n¿Lo tienen disponible? Mi nombre es: ')};
  $('#qm').onclick=function(){if(qty>1)qty--;upd()};$('#qp').onclick=function(){qty++;upd()};
  b.addEventListener('input',upd);b.addEventListener('change',upd);
  $('#addBtn').onclick=function(){var o=opts(),key=[p.id,o.talla,o.color,o.nota].join('|'),f=cart.filter(function(it){return it.key===key})[0];if(f)f.qty+=qty;else cart.push({key:key,id:p.id,qty:qty,talla:o.talla,color:o.color,nota:o.nota});save();close();toast('Agregado al pedido ✓')};
  upd();show('#detail')}
// cart
function cartMsg(){var t=0,iva=false,lines=cart.map(function(it){var p=byId[it.id];t+=ep(p)*it.qty;if(p.iva)iva=true;return lineFor(p,it,it.qty)});
  return 'Hola Deportes Perote, quiero hacer este pedido:\n\n'+lines.join('\n')+'\n\nTotal estimado: '+fmt(t)+(iva?' (algunos artículos + IVA)':'')+'\n\nMi nombre es: \n(Por favor confirmen existencias y total.)'}
function renderCart(){
  var b=$('#cartBody');if(!cart.length){b.innerHTML='<p class="note">Tu pedido está vacío. Agrega productos desde el catálogo.</p>';return}
  var t=0,h='';cart.forEach(function(it,i){var p=byId[it.id];t+=ep(p)*it.qty;var o=[it.talla&&('Talla: '+it.talla),it.color&&('Color: '+it.color),it.nota&&('Nota: '+it.nota)].filter(Boolean).join(' · ');
    h+='<div class="ci">'+(p.img?'<img alt="" src="'+p.img+'">':'')+'<div class="cx"><b>'+esc(p.n)+'</b>'+(p.k.length?'Cód. '+esc(p.k[0])+'<br>':'')+(o?esc(o)+'<br>':'')+'<div class="qty" style="margin-top:4px"><button data-m="'+i+'">−</button><span>'+it.qty+'</span><button data-p="'+i+'">+</button></div> &nbsp;'+fmt(ep(p)*it.qty)+(p.iva?' <span class="iva">+ IVA</span>':'')+'</div><button class="rm" data-r="'+i+'">Quitar</button></div>'});
  h+='<div class="total"><span>Total estimado</span><span>'+fmt(t)+'</span></div><p class="note">Precios sujetos a cambio sin previo aviso. Confirmamos existencias por WhatsApp.</p><div class="actions"><a class="wabtn" target="_blank" rel="noopener" href="'+wa(cartMsg())+'">Pedir por WhatsApp</a><button class="primary" id="clr" style="background:#eef1f6;color:#0B1F44">Vaciar pedido</button></div>';
  b.innerHTML=h;
  b.onclick=function(e){var d=e.target.dataset;if(d.m!=null){var it=cart[+d.m];if(it.qty>1)it.qty--;else cart.splice(+d.m,1)}else if(d.p!=null)cart[+d.p].qty++;else if(d.r!=null)cart.splice(+d.r,1);else if(e.target.id==='clr')cart=[];else return;save();renderCart()}}
function show(s){$(s).hidden=false;document.body.style.overflow='hidden'}
function close(){stopVideos();$('#detail').hidden=true;$('#cart').hidden=true;document.body.style.overflow=''}
document.querySelectorAll('.sheet').forEach(function(s){s.addEventListener('click',function(e){if(e.target===s||e.target.hasAttribute('data-close'))close()})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
$('#cartBtn').onclick=function(){renderCart();show('#cart')};
$('#fab').href=wa('Hola Deportes Perote, tengo una pregunta: ');
$('#footWa').href=wa('Hola Deportes Perote, tengo una pregunta: ');
$('#uniformBtn').href=wa('Hola Deportes Perote, quiero cotizar uniformes personalizados para mi equipo/escuela. Mi nombre es: ');
if(/^https?:/.test(location.protocol)&&window.fetch)fetch('media.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&JSON.stringify(j)!==JSON.stringify(MEDIA)){MEDIA=j;render()}}).catch(function(){});
window.DP={openDetail:openDetail,media:function(){return MEDIA},setMedia:function(m){MEDIA=m;render()},openCart:function(){renderCart();show('#cart')},cart:function(){return cart},msg:cartMsg};
function loadJSON(u){if(!window.fetch||!/^https?:/.test(location.protocol))return Promise.resolve(null);return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
tiles();save();render();
Promise.all([loadJSON('ofertas.json'),loadJSON('banners.json')]).then(function(a){
  if(a[0]){OF.productos=(a[0].productos&&typeof a[0].productos==='object')?a[0].productos:{};OF.destacados=asList(a[0].destacados)}
  if(a[1])BN=asList(a[1].banners);
  heroSlides();rows();render()});
window.DP.go=go;window.DP.home=goHome;
})();
