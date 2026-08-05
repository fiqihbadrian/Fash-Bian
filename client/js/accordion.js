/* ─── Fast Bian — Accordion ─── */
var Accordion = (function(){
  var container = null;

  function init(containerEl){
    container = containerEl;
    container.addEventListener('click', function(e){
      var header = e.target.closest('.accordion-header');
      if(!header) return;
      var acc = header.closest('.accordion');
      if(acc) toggle(acc);
    });
  }

  function toggle(el){
    var isOpen = el.classList.contains('open');
    var all = container.querySelectorAll('.accordion');
    for(var i=0;i<all.length;i++) all[i].classList.remove('open');
    if(!isOpen) el.classList.add('open');
  }

  function render(categories){
    if(!container) return;
    var html = '';
    for(var i=0;i<categories.length;i++){
      var cat = categories[i];
      var iconSvg = catIcon(cat.key);
      html += '<div class="accordion" data-cat="' + cat.key + '">' +
        '<div class="accordion-header">' +
          '<span class="arrow"><svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l5 5-5 5"/></svg></span>' +
          '<span class="cat-icon">' + iconSvg + '</span>' +
          '<span class="cat-label">' + cat.key + '</span>' +
          '<span class="cat-count">' + cat.items.length + '</span>' +
        '</div>' +
        '<div class="accordion-body"><div class="accordion-body-inner">' +
          '<div class="card-grid" data-cat="' + cat.key + '"></div>' +
        '</div></div></div>';
    }
    container.innerHTML = html;
  }

  function catIcon(key){
    if(key === 'Text Animation'){
      return '<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if(key === 'Speed Graph'){
      return '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if(key === 'Animate'){
      return '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" fill="none" stroke-width="2" stroke-linejoin="round"/></svg>';
    }
    if(key === 'Shape'){
      return '<svg viewBox="0 0 24 24"><rect width="10" height="10" x="3" y="3" rx="2" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17" cy="17" r="3" stroke="currentColor" fill="none" stroke-width="2"/></svg>';
    }
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2"/></svg>';
  }

  return {
    init: init,
    render: render,
    toggle: toggle
  };
})();
