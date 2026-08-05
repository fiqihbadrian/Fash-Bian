/* ─── Fast Bian — Search ─── */
var Search = (function(){
  var input, clearBtn;
  var _onSearch = null;

  function init(inputId, clearId, callback){
    input = document.getElementById(inputId);
    clearBtn = document.getElementById(clearId);
    _onSearch = callback;

    if(!input) return;

    input.addEventListener('input', function(){
      var q = input.value.trim().toLowerCase();
      if(clearBtn) clearBtn.classList.toggle('hidden', q === '');
      if(_onSearch) _onSearch(q);
    });

    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        clear();
        input.blur();
      }
    });

    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        clear();
        input.focus();
      });
    }
  }

  function clear(){
    if(input) input.value = '';
    if(clearBtn) clearBtn.classList.add('hidden');
    if(_onSearch) _onSearch('');
  }

  function getQuery(){
    return input ? input.value.trim().toLowerCase() : '';
  }

  function highlightText(text, query){
    if(!query) return text;
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  return {
    init: init,
    clear: clear,
    getQuery: getQuery,
    highlightText: highlightText
  };
})();
