/* tpl11 渲染：顶部青色横幅 + 多段色块分区 */
function render(d){
  var b=d.basic||{},it=d.intent||{};
  var h='<article class="resume-page"><div class="r11-banner">'+
    (b.avatar?'<img class="r11-photo" src="'+esc(b.avatar)+'"/>':'')+
    '<div class="r11-name">'+esc(b.name||'你的名字')+'</div>'+
    (b.title?'<div class="r11-title">'+esc(b.title)+'</div>':'')+
    '<div class="r11-ct">'+contacts(b).map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'+
    '</div>';
  if(it.target||it.expectedSalary)h+='<div class="r11-bar">求职意向：'+esc(it.target)+'　|　'+esc(it.expectedSalary)+'</div>';
  h+='<div class="r11-body">';
  function sec(t,body){return body?'<div class="r11-sec"><h2>'+t+'</h2>'+body+'</div>':''}
  function items(list,keys){if(!list||!list.length)return'';return list.map(function(x){return '<div class="r11-item"><div class="r11-ih"><span class="r11-t">'+esc(x[keys[0]])+'</span><span class="r11-m">'+(x.start?dr(x.start,x.end):(x.date||''))+'</span></div>'+(x[keys[1]]?'<div class="r11-s">'+esc(x[keys[1]])+'</div>':'')+lines(x.desc)+'</div>'}).join('')}
  h+=sec('个人简介',d.summary?'<p class="r11-d">'+esc(d.summary)+'</p>':'');
  h+=sec('工作经历',items(d.work,['company','title']));
  h+=sec('教育经历',items(d.education,['school','major']));
  h+=sec('项目经历',items(d.projects,['name','role']));
  var sk=(d.skills&&d.skills.length)?d.skills.map(function(s){return '<div><b>'+esc(s.category)+'</b> '+(Array.isArray(s.items)?s.items:[]).map(function(i){return '<span class="r11-tag">'+esc(i)+'</span>'}).join('')+'</div>'}).join(''):'';
  h+=sec('技能特长',sk);
  h+=sec('证书',(d.certs&&d.certs.length)?d.certs.map(function(c){return '<div class="r11-ih"><span>'+esc(c.name)+'</span><span class="r11-m">'+esc(c.date||'')+'</span></div>'}).join(''):'');
  h+=verifyBox(d.verify);
  return h+'</div></article>';
}
window.Render = { render: render, esc: esc };
