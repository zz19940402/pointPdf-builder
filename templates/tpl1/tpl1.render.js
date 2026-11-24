/* tpl1 渲染：灰白单栏，三列网格小标题 */
function render(d){
  var b=d.basic||{},it=d.intent||{};
  var h='<article class="resume-page">';
  if(b.avatar)h+='<img class="r1-photo" src="'+esc(b.avatar)+'"/>';
  h+='<div class="r1-name">'+esc(b.name||'你的名字')+'</div>'+
     (b.title?'<div class="r1-title">'+esc(b.title)+'</div>':'')+
     '<div class="r1-contact">'+contacts(b).map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'+
     ((it.target||it.expectedSalary)?'<div class="r1-contact">求职意向：'+esc(it.target)+' '+esc(it.expectedSalary)+'</div>':'');
  function sec(t,body){return body?'<div class="r1-sec"><h2>'+t+'</h2>'+body+'</div>':''}
  function grid3(list,keys){if(!list||!list.length)return'';return '<div class="r1-grid">'+list.map(function(x){return '<div class="r1-item"><span class="r1-t">'+esc(x[keys[0]])+'</span>'+(x.start?'<span class="r1-m">'+dr(x.start,x.end)+'</span>':'')+(x[keys[1]]?'<div class="r1-s">'+esc(x[keys[1]])+'</div>':'')+lines(x.desc)+'</div>'}).join('')+'</div>'}
  h+=sec('个人简介',d.summary?'<p class="r1-d">'+esc(d.summary)+'</p>':'');
  h+=sec('工作经历',grid3(d.work,['company','title']));
  h+=sec('教育经历',grid3(d.education,['school','major']));
  h+=sec('项目经历',grid3(d.projects,['name','role']));
  var sk=(d.skills&&d.skills.length)?d.skills.map(function(s){return '<div><span class="r1-k">'+esc(s.category)+'：</span><span class="r1-v">'+(Array.isArray(s.items)?s.items:[]).map(esc).join(' / ')+'</span></div>'}).join(''):'';
  h+=sec('技能特长',sk);
  h+=sec('证书',(d.certs&&d.certs.length)?d.certs.map(function(c){return '<div class="r1-item"><span class="r1-k">'+esc(c.name)+'</span><span class="r1-m">'+esc(c.date||'')+'</span></div>'}).join(''):'');
  h+=verifyBox(d.verify);
  return h+'</article>';
}
window.Render = { render: render, esc: esc };
