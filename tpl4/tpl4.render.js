/* tpl4 渲染：左侧深色竖栏 + 右白主栏 */
function render(d){
  var b=d.basic||{},it=d.intent||{};
  var side='<aside class="r4-side">';
  side+=(b.avatar?'<img class="r4-photo" src="'+esc(b.avatar)+'"/>':'');
  side+='<div class="r4-name">'+esc(b.name||'你的名字')+'</div>';
  if(b.title)side+='<div class="r4-title">'+esc(b.title)+'</div>';
  contacts(b).forEach(function(x){side+='<div class="r4-ct">'+x+'</div>'});
  function ssec(t,body){return body?'<div class="r4-sec"><h2>'+t+'</h2>'+body+'</div>':''}
  var sk=(d.skills&&d.skills.length)?d.skills.map(function(s){return '<div><b>'+esc(s.category)+'</b><div>'+(Array.isArray(s.items)?s.items:[]).map(function(i){return '<span class="r4-tag">'+esc(i)+'</span>'}).join('')+'</div></div>'}).join(''):'';
  side+=ssec('技能',sk);
  side+=ssec('证书',(d.certs&&d.certs.length)?d.certs.map(function(c){return '<div class="r4-crow"><span>'+esc(c.name)+'</span><span>'+esc(c.date||'')+'</span></div>'}).join(''):'');
  if(d.verify&&d.verify.enabled)side+='<div class="vbox"><b>✓ 学历已验证</b><div>'+esc(d.verify.chsiSchool||'')+' '+esc(d.verify.chsiDegree||'')+'</div><div class="vk">'+esc(d.verify.chsiCode||'')+'</div></div>';
  side+='</aside>';
  var main='<div class="r4-main">';
  if(it.target||it.expectedSalary)main+='<div class="r4-intent">求职意向：'+esc(it.target)+' | '+esc(it.expectedSalary)+'</div>';
  function msec(t,body){return body?'<div class="r4-sec2"><h2>'+t+'</h2>'+body+'</div>':''}
  function mitems(list,keys){if(!list||!list.length)return'';return list.map(function(x){return '<div class="r4-item"><div class="r4-ih"><span class="r4-t">'+esc(x[keys[0]])+'</span><span class="r4-m">'+(x.start?dr(x.start,x.end):(x.date||''))+'</span></div>'+(x[keys[1]]?'<div class="r4-s">'+esc(x[keys[1]])+'</div>':'')+lines(x.desc)+'</div>'}).join('')}
  main+=msec('个人简介',d.summary?'<p class="r4-d">'+esc(d.summary)+'</p>':'');
  main+=msec('工作经历',mitems(d.work,['company','title']));
  main+=msec('教育经历',mitems(d.education,['school','major']));
  main+=msec('项目经历',mitems(d.projects,['name','role']));
  main+='</div>';
  return '<article class="resume-page">'+side+main+'</article>';
}
window.Render = { render: render, esc: esc };
