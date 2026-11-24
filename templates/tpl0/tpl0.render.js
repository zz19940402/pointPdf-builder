/* tpl0 渲染：单栏极简，青色点缀 */
function render(d){
  var b=d.basic||{},it=d.intent||{};
  var h='<article class="resume-page"><div class="r0-head">'+
    (b.avatar?'<img class="r0-photo" src="'+esc(b.avatar)+'"/>':'')+
    '<div><div class="r0-name">'+esc(b.name||'你的名字')+'</div>'+
    (b.title?'<div class="r0-title">'+esc(b.title)+'</div>':'')+
    '<div class="r0-contact">'+contacts(b).map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'+
    ((it.target||it.expectedSalary)?'<div class="r0-contact">意向：'+esc(it.target)+' '+esc(it.expectedSalary)+'</div>':'')+
    '</div></div>';
  function sec(t,body){return body?'<div class="r0-sec"><h2>'+t+'</h2>'+body+'</div>':''}
  function items(list,f){if(!list||!list.length)return'';return list.map(function(x){return '<div class="r0-item"><div class="r0-ih"><span class="r0-t">'+esc(x[f[0]])+'</span><span class="r0-m">'+(x.start?dr(x.start,x.end):(x.date||''))+'</span></div>'+(x[f[1]]?'<div class="r0-s">'+esc(x[f[1]])+'</div>':'')+lines(x.desc)+'</div>'}).join('')}
  h+=sec('个人简介',d.summary?'<p class="r0-d">'+esc(d.summary)+'</p>':'');
  h+=sec('工作经历',items(d.work,['company','title']));
  h+=sec('教育经历',items(d.education,['school','major']));
  h+=sec('项目经历',(d.projects&&d.projects.length)?d.projects.map(function(p){return '<div class="r0-item"><div class="r0-ih"><span class="r0-t">'+esc(p.name)+'</span><span class="r0-m">'+esc(p.link||'')+'</span></div>'+(p.role?'<div class="r0-s">'+esc(p.role)+'</div>':'')+lines(p.desc)+'</div>'}).join(''):'');
  var sk=(d.skills&&d.skills.length)?d.skills.map(function(s){var arr=Array.isArray(s.items)?s.items:[];return '<div><b>'+esc(s.category)+'</b> '+arr.map(function(i){return '<span class="r0-tag">'+esc(i)+'</span>'}).join('')+'</div>'}).join(''):'';
  h+=sec('技能特长',sk);
  h+=sec('证书',(d.certs&&d.certs.length)?d.certs.map(function(c){return '<div class="r0-ih"><span>'+esc(c.name)+'</span><span class="r0-m">'+esc(c.date||'')+'</span></div>'}).join(''):'');
  h+=verifyBox(d.verify);
  return h+'</article>';
}
window.Render = { render: render, esc: esc };
