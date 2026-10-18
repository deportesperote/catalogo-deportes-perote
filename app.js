(function(){
'use strict';
var WA='522821073249', P=window.PRODUCTS||[], CATS=window.CATS||[];
var $=function(s){return document.querySelector(s)};
var fmt=function(v){return '$'+v.toLocaleString('es-MX',{maximumFractionDigits:0})};
var norm=function(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
var esc=function(s){return (s||'').toString().replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var byId={};P.forEach(function(p){p._q=norm([p.n,p.k.join(' '),p.d,p.s,p.c,p.co.join(' '),p.t.join(' ')].join(' '));byId[p.id]=p});
var state={q:'',cat:'',sort:'',limit:40};
// ---- fotos y videos extra (media.js / media.json) ----
var MEDIA=window.MEDIA||{};
function asList(v){return Array.isArray(v)?v:(v?[v]:[])}
function mediaFor(p){var im=[],vd=[],seen={};[p.id].concat(p.k).forEach(function(key){var m=MEDIA[key];if(!m)return;
  asList(m.images).forEach(function(x){var s=typeof x==='string'?x:x.src;if(s&&!seen[s]){seen[s]=1;im.push(typeof x==='string'?{src:x}:x)}});
  asList(m.videos).forEach(function(x){var s=typeof x==='string'?x:x.src;if(s&&!seen[s]){seen[s]=1;vd.push(typeof x==='string'?{src:x}:x)}})});
  return {images:im,videos:vd}}
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
function chip(label,val){var b=document.createElement('button');b.className='chip';b.textContent=label;b.dataset.v=val;b.onclick=function(){state.cat=val;state.limit=40;render();b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};chips.appendChild(b)}
chip('Todos','');CATS.forEach(function(c){chip(c,c)});
function list(){
  var terms=norm(state.q).split(/\s+/).filter(Boolean);
  var r=P.filter(function(p){if(state.cat&&p.c!==state.cat)return false;for(var i=0;i<terms.length;i++){var t=terms[i];if(p._q.indexOf(t)<0){if(t.length>3&&t.endsWith('es')&&p._q.indexOf(t.slice(0,-2))>=0)continue;if(t.length>3&&t.endsWith('s')&&p._q.indexOf(t.slice(0,-1))>=0)continue;return false}}return true});
  if(state.sort==='asc')r=r.slice().sort(function(a,b){return a.p-b.p});if(state.sort==='desc')r=r.slice().sort(function(a,b){return b.p-a.p});
  return r}
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=e.target;i.src=i.dataset.src;io.unobserve(i)}})},{rootMargin:'300px'}):null;
function card(p){
  var d=document.createElement('article');d.className='card';d.tabIndex=0;
  var meta=[];if(p.k.length)meta.push('Cód. '+p.k[0]+(p.k.length>1?' +'+(p.k.length-1):''));
  var extra=[];if(p.t.length)extra.push(p.t.join(', '));if(p.co.length)extra.push(p.co.join(', '));
  var md=mediaFor(p),badge='';
  if(md.images.length)badge+='<span class="mb">+'+md.images.length+(md.images.length===1?' foto':' fotos')+'</span>';
  if(md.videos.length)badge+='<span class="mb vid" title="Tiene video">▶</span>';
  d.innerHTML='<div class="ph">'+(badge?'<span class="mbs">'+badge+'</span>':'')+(p.img?'<img alt="'+esc(p.n)+'" width="400" height="400" loading="lazy" decoding="async" '+(io?'data-src':'src')+'="'+p.img+'">':'')+'</div><div class="bd"><h3>'+esc(p.n)+'</h3>'+(meta.length?'<div class="meta">'+esc(meta[0])+'</div>':'')+(extra.length?'<div class="meta">'+esc(extra.join(' · '))+'</div>':'')+'<div class="pr"><span><span class="price">'+fmt(p.p)+'</span>'+(p.iva?'<span class="iva">+ IVA</span>':'')+'</span><button class="add" aria-label="Agregar">+</button></div></div>';
  if(io&&p.img)io.observe(d.querySelector('img'));
  d.onclick=function(){openDetail(p.id)};d.onkeydown=function(e){if(e.key==='Enter')openDetail(p.id)};
  return d}
function render(){
  [].forEach.call(chips.children,function(b){b.classList.toggle('on',b.dataset.v===state.cat)});
  var r=list(),g=$('#grid');g.innerHTML='';
  $('#count').textContent=r.length+(r.length===1?' producto':' productos');
  if(!r.length){g.innerHTML='<div class="empty">No encontramos productos con esa búsqueda.<br>Escríbenos por WhatsApp y te ayudamos.</div>'}
  r.slice(0,state.limit).forEach(function(p){g.appendChild(card(p))});
  var m=$('#more');m.innerHTML='';
  if(r.length>state.limit){var b=document.createElement('button');b.textContent='Ver más ('+(r.length-state.limit)+')';b.onclick=function(){state.limit+=40;render()};m.appendChild(b)}
}
var tq;$('#q').addEventListener('input',function(e){clearTimeout(tq);tq=setTimeout(function(){state.q=e.target.value;state.limit=40;render()},120)});
$('#sort').onchange=function(e){state.sort=e.target.value;render()};
// detail
function lineFor(p,o,qty){var s='• '+(p.k.length?'['+p.k[0]+'] ':'')+p.n;if(o.talla)s+=' — Talla/medida: '+o.talla;if(o.color)s+=' — Color: '+o.color;if(o.nota)s+=' — Nota: '+o.nota;s+='\n   Cantidad: '+qty+' × '+fmt(p.p)+(p.iva?' + IVA':'')+' = '+fmt(p.p*qty)+(p.iva?' + IVA':'');return s}
function openDetail(id){
  var p=byId[id],qty=1,b=$('#detailBody');
  var md=mediaFor(p),sl=[];
  if(p.img)sl.push({t:'img',src:p.img,th:p.img});
  md.images.forEach(function(x){sl.push({t:'img',src:x.src,th:x.thumb||thumbOf(x.src)})});
  md.videos.forEach(function(v){sl.push({t:'vid',v:v,th:vidPoster(v)})});
  var h;
  if(sl.length<=1&&!md.videos.length)h='<div class="dimg">'+(p.img?'<img alt="'+esc(p.n)+'" src="'+p.img+'">':'')+'</div>';
  else{h='<div class="galw"><div class="gal" id="gal">'+sl.map(function(x,i){return x.t==='img'?'<div class="slide"><img alt="'+esc(p.n)+' — foto '+(i+1)+'" '+(i?'loading="lazy" ':'')+'src="'+esc(x.src)+'"></div>':'<div class="slide vslide" data-i="'+i+'" role="button" tabindex="0" aria-label="Reproducir video"></div>'}).join('')+'</div><span class="gcount" id="gcount">1/'+sl.length+'</span></div>';
    h+='<div class="thumbs" id="thumbs">'+sl.map(function(x,i){return '<button class="th'+(i?'':' on')+'" data-i="'+i+'" aria-label="'+(x.t==='vid'?'Video':'Foto '+(i+1))+'">'+(x.th?'<img alt="" loading="lazy" src="'+esc(x.th)+'" onerror="this.remove()">':'')+(x.t==='vid'?'<span class="play sm">▶</span>':'')+'</button>'}).join('')+'</div>'}
  h+='<h2>'+esc(p.n)+'</h2>';
  h+='<div class="dl"><b>Categoría:</b> '+esc(p.c)+(p.s!==p.c?' · '+esc(p.s):'')+'</div>';
  if(p.k.length)h+='<div class="dl"><b>Código:</b> '+esc(p.k.join(', '))+'</div>';
  if(p.d)h+='<div class="dl">'+esc(p.d)+'</div>';
  if(p.t.length)h+='<div class="dl"><b>Tallas/medidas:</b> '+esc(p.t.join(', '))+'</div>';
  if(p.co.length)h+='<div class="dl"><b>Colores:</b> '+esc(p.co.join(', '))+'</div>';
  h+='<div class="dprice">'+fmt(p.p)+(p.iva?' <span class="iva">+ IVA</span>':'')+'</div>';
  if(p.t.length>1)h+='<div class="field"><label for="fT">Talla / medida</label><select id="fT">'+p.t.map(function(t){return '<option>'+esc(t)+'</option>'}).join('')+'</select></div>';
  if(p.co.length>1)h+='<div class="field"><label for="fC">Color</label><select id="fC">'+p.co.map(function(t){return '<option>'+esc(t)+'</option>'}).join('')+'</select></div>';
  h+='<div class="field"><label for="fN">Nota (talla, color u otro detalle)</label><input id="fN" maxlength="80" placeholder="Opcional"></div>';
  h+='<div class="field"><label>Cantidad</label><div class="qty"><button id="qm" aria-label="Menos">−</button><span id="qv">1</span><button id="qp" aria-label="Más">+</button></div></div>';
  h+='<div class="actions"><button class="primary" id="addBtn">Agregar al pedido</button><a class="wabtn" id="oneBtn" target="_blank" rel="noopener">Pedir este producto por WhatsApp</a></div><p class="note">Precios sujetos a cambio sin previo aviso. Confirmamos existencias por WhatsApp.</p>';
  b.innerHTML=h;
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
function cartMsg(){var t=0,iva=false,lines=cart.map(function(it){var p=byId[it.id];t+=p.p*it.qty;if(p.iva)iva=true;return lineFor(p,it,it.qty)});
  return 'Hola Deportes Perote, quiero hacer este pedido:\n\n'+lines.join('\n')+'\n\nTotal estimado: '+fmt(t)+(iva?' (algunos artículos + IVA)':'')+'\n\nMi nombre es: \n(Por favor confirmen existencias y total.)'}
function renderCart(){
  var b=$('#cartBody');if(!cart.length){b.innerHTML='<p class="note">Tu pedido está vacío. Agrega productos desde el catálogo.</p>';return}
  var t=0,h='';cart.forEach(function(it,i){var p=byId[it.id];t+=p.p*it.qty;var o=[it.talla&&('Talla: '+it.talla),it.color&&('Color: '+it.color),it.nota&&('Nota: '+it.nota)].filter(Boolean).join(' · ');
    h+='<div class="ci">'+(p.img?'<img alt="" src="'+p.img+'">':'')+'<div class="cx"><b>'+esc(p.n)+'</b>'+(p.k.length?'Cód. '+esc(p.k[0])+'<br>':'')+(o?esc(o)+'<br>':'')+'<div class="qty" style="margin-top:4px"><button data-m="'+i+'">−</button><span>'+it.qty+'</span><button data-p="'+i+'">+</button></div> &nbsp;'+fmt(p.p*it.qty)+(p.iva?' <span class="iva">+ IVA</span>':'')+'</div><button class="rm" data-r="'+i+'">Quitar</button></div>'});
  h+='<div class="total"><span>Total estimado</span><span>'+fmt(t)+'</span></div><p class="note">Precios sujetos a cambio sin previo aviso. Confirmamos existencias por WhatsApp.</p><div class="actions"><a class="wabtn" target="_blank" rel="noopener" href="'+wa(cartMsg())+'">Pedir por WhatsApp</a><button class="primary" id="clr" style="background:#eef1f6;color:#0B1F44">Vaciar pedido</button></div>';
  b.innerHTML=h;
  b.onclick=function(e){var d=e.target.dataset;if(d.m!=null){var it=cart[+d.m];if(it.qty>1)it.qty--;else cart.splice(+d.m,1)}else if(d.p!=null)cart[+d.p].qty++;else if(d.r!=null)cart.splice(+d.r,1);else if(e.target.id==='clr')cart=[];else return;save();renderCart()}}
function show(s){$(s).hidden=false;document.body.style.overflow='hidden'}
function close(){stopVideos();$('#detail').hidden=true;$('#cart').hidden=true;document.body.style.overflow=''}
document.querySelectorAll('.sheet').forEach(function(s){s.addEventListener('click',function(e){if(e.target===s||e.target.hasAttribute('data-close'))close()})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
$('#cartBtn').onclick=function(){renderCart();show('#cart')};
$('#fab').href=wa('Hola Deportes Perote, tengo una pregunta: ');
$('#uniformBtn').href=wa('Hola Deportes Perote, quiero cotizar uniformes personalizados para mi equipo/escuela. Mi nombre es: ');
if(/^https?:/.test(location.protocol)&&window.fetch)fetch('media.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&JSON.stringify(j)!==JSON.stringify(MEDIA)){MEDIA=j;render()}}).catch(function(){});
window.DP={openDetail:openDetail,media:function(){return MEDIA},setMedia:function(m){MEDIA=m;render()},openCart:function(){renderCart();show('#cart')},cart:function(){return cart},msg:cartMsg};
save();render();
})();
