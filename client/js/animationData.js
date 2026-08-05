/* ─── Fast Bian — Animation Data ─── */
// Text Animation: satu kartu per gaya, mode In/Out/Tengah dipilih di settings
var TEXT_ANIMATIONS = [
  {id:'fade',      name:'Fade',      desc:'Muncul, hilang, atau berdenyut transparan.',     icon:'eye'},
  {id:'slide',     name:'Slide',     desc:'Geser masuk, keluar, atau naik-turun.',           icon:'move-up'},
  {id:'pop',       name:'Pop',       desc:'Skala membesar — masuk, keluar, atau berdenyut.',  icon:'circle'},
  {id:'bounce',    name:'Bounce',    desc:'Memantul — masuk, keluar, atau gerak di tengah.', icon:'arrow-up-down'},
  {id:'swing',     name:'Swing',     desc:'Rotasi goyang — masuk, keluar, atau di tengah.',  icon:'repeat'},
  {id:'typewriter',name:'Typewriter',desc:'Efek ketik karakter demi karakter.',              icon:'keyboard'}
];

// ─── Speed Graph curve presets (cubic-bezier control points, value space) ───
var GRAPH_CURVES = {
  'easy-ease':        [0.55,0, 0.45,1],
  'smooth':           [0.33,0, 0.67,1],
  'cinematic':        [0.68,0, 1,1],
  'fast-out-slow-in': [0,0, 0.58,1],
  'fast-in-slow-out': [0.42,0, 1,1],
  'heavy-ease':       [0.82,0, 0.8,1],
  'soft-ease':        [0.28,0, 0.72,1],
  'linear':           [0.334,0.334, 0.667,0.667],
  'overshoot':        [0.52,0.28, 0.2,1.28],
  'bounce':           [0.6,0, 0.4,1],
  'elastic':          [0.5,0, 0.5,1]
};

// ─── Animate Layer Data (satu kartu per gaya, mode In/Out/Tengah + durasi + loop) ───
var ANIMATE_ANIMATIONS = [
  {id:'bounce', name:'Bounce', desc:'Memantul — masuk, keluar, atau gerak di tengah.',  icon:'arrow-up-down'},
  {id:'pop',    name:'Pop',    desc:'Skala membesar — masuk, keluar, atau berdenyut.',   icon:'circle'},
  {id:'fade',   name:'Fade',   desc:'Transparansi — muncul, hilang, atau berdenyut.',     icon:'eye'},
  {id:'slide',  name:'Slide',  desc:'Geser — masuk, keluar, atau naik-turun di tengah.',  icon:'move-up'},
  {id:'swing',  name:'Swing',  desc:'Rotasi goyang — masuk, keluar, atau di tengah.',     icon:'repeat'}
];

// ─── Shape Data ───
var SHAPES = [
  {id:'rect',       name:'Rectangle',   desc:'Persegi panjang.',                    icon:'rectangle-horizontal',    script:'rect'},
  {id:'square',     name:'Square',      desc:'Persegi.',                             icon:'square',   script:'square'},
  {id:'circle',     name:'Circle',      desc:'Lingkaran.',                           icon:'circle',   script:'circle'},
  {id:'ellipse',    name:'Ellipse',     desc:'Elips.',                               icon:'egg',      script:'ellipse'},
  {id:'triangle',   name:'Triangle',    desc:'Segitiga.',                            icon:'triangle', script:'triangle'},
  {id:'pentagon',   name:'Pentagon',    desc:'Segi lima.',                           icon:'pentagon', script:'pentagon'},
  {id:'hexagon',    name:'Hexagon',     desc:'Segi enam.',                           icon:'hexagon',  script:'hexagon'},
  {id:'star',       name:'Star',        desc:'Bintang 5 ujung.',                     icon:'star',     script:'star'},
  {id:'diamond',    name:'Diamond',     desc:'Belah ketupat.',                       icon:'gem',  script:'diamond'}
];



// ─── Speed Graph Data ───
var GRAPH_ANIMATIONS = [
  {id:'easy-ease',        name:'Easy Ease',           desc:'Smooth motion with balanced easing.',            icon:'s-curve'},
  {id:'smooth',           name:'Smooth',              desc:'Gentle ease with higher influence.',             icon:'s-curve-gentle'},
  {id:'cinematic',        name:'Cinematic',           desc:'Slow in, fast out for cinematic feel.',          icon:'slow-in'},
  {id:'fast-out-slow-in', name:'Fast Out Slow In',    desc:'Fast start, slow end.',                          icon:'fast-out'},
  {id:'fast-in-slow-out', name:'Fast In Slow Out',    desc:'Slow start, fast end.',                          icon:'fast-in'},
  {id:'heavy-ease',       name:'Heavy Ease',          desc:'Strong, heavy easing with low influence.',       icon:'heavy'},
  {id:'soft-ease',        name:'Soft Ease',           desc:'Soft, gentle curve with high influence.',        icon:'soft'},
  {id:'linear',           name:'Linear',              desc:'No easing \u2014 straight interpolation.',        icon:'linear'},
  {id:'overshoot',        name:'Overshoot',           desc:'Speed past target then settle back.',            icon:'overshoot'},
  {id:'bounce',           name:'Bounce',              desc:'Bouncing motion with diminishing returns.',       icon:'bounce'},
  {id:'elastic',          name:'Elastic',             desc:'Elastic oscillation settling at target.',         icon:'elastic'}
];

// ─── Camera Movement Data ───
var CAMERA_ANIMATIONS = [
  {id:'cam-push-in',     name:'Push In',        desc:'Camera dolly maju mendekati objek.',        icon:'zoom-in'},
  {id:'cam-push-out',    name:'Push Out',       desc:'Camera dolly mundur menjauhi objek.',        icon:'zoom-out'},
  {id:'cam-truck-left',  name:'Truck Left',     desc:'Camera geser ke kiri.',                     icon:'move-left'},
  {id:'cam-truck-right', name:'Truck Right',    desc:'Camera geser ke kanan.',                    icon:'move-right'},
  {id:'cam-pedestal-up', name:'Pedestal Up',    desc:'Camera naik (pedestal up).',                 icon:'move-up'},
  {id:'cam-pedestal-down',name:'Pedestal Down', desc:'Camera turun (pedestal down).',               icon:'move-down'},
  {id:'cam-orbit-left',  name:'Orbit Left',     desc:'Camera memutar ke kiri mengitari pusat.',    icon:'rotate-ccw'},
  {id:'cam-orbit-right', name:'Orbit Right',    desc:'Camera memutar ke kanan mengitari pusat.',   icon:'rotate-cw'},
  {id:'cam-roll',        name:'Roll',           desc:'Camera berotasi pada sumbu Z (dutch angle).', icon:'refresh-cw'}
];

var CAMERA_ICONS = {
  'zoom-in':'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'zoom-out':'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'move-left':'<svg viewBox="0 0 24 24"><polyline points="15 4 15 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="21 12 3 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="6 9 3 12 6 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'move-right':'<svg viewBox="0 0 24 24"><polyline points="9 4 9 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="3 12 21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="18 15 21 12 18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'move-up':'<svg viewBox="0 0 24 24"><polyline points="4 15 20 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="12 21 12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="9 6 12 3 15 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'move-down':'<svg viewBox="0 0 24 24"><polyline points="4 9 20 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="12 3 12 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="15 18 12 21 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'rotate-ccw':'<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'rotate-cw':'<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'refresh-cw':'<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="1 20 1 14 7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

// ─── Stabilizer Video Data ───
var STABILIZER_ANIMATIONS = [
  {id:'stab-smooth',      name:'Smooth Motion',    desc:'Warp Stabilizer — gerakan halus (default).',          icon:'wind'},
  {id:'stab-lock',        name:'Lock Motion',      desc:'Warp Stabilizer — hapus semua gerakan kamera.',       icon:'lock'},
  {id:'stab-crop-less',   name:'Crop Less',        desc:'Warp Stabilizer — cropping minimal (sub-pixel).',     icon:'maximize'},
  {id:'stab-scale',       name:'Scale Stabilize',  desc:'Warp Stabilizer — stabilisasi via Zoom (Scale).',      icon:'zoom-in'},
  {id:'stab-roll',        name:'Roll Smoothing',   desc:'Warp Stabilizer — smoothing roll saja.',               icon:'refresh-cw'}
];

var STABILIZER_ICONS = {
  'wind':'<svg viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'lock':'<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'maximize':'<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 21 3 21 3 15" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="3" x2="14" y2="10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="21" x2="10" y2="14" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'zoom-in':'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'refresh-cw':'<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="1 20 1 14 7 14" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

var GRAPH_ICONS = {
  's-curve':'<svg viewBox="0 0 40 28"><path d="M4,24 C12,24 16,4 26,4 S32,24 36,24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  's-curve-gentle':'<svg viewBox="0 0 40 28"><path d="M4,24 C14,24 18,4 26,4 S30,24 36,24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'slow-in':'<svg viewBox="0 0 40 28"><path d="M4,24 C4,24 16,22 26,4 S36,4 36,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'fast-out':'<svg viewBox="0 0 40 28"><path d="M4,24 C4,24 6,4 20,4 S36,24 36,24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'fast-in':'<svg viewBox="0 0 40 28"><path d="M4,24 C16,24 20,4 36,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'heavy':'<svg viewBox="0 0 40 28"><path d="M4,24 C4,24 8,4 28,4 S36,4 36,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'soft':'<svg viewBox="0 0 40 28"><path d="M4,24 C16,24 18,4 28,4 S36,24 36,24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'linear':'<svg viewBox="0 0 40 28"><line x1="4" y1="24" x2="36" y2="4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'overshoot':'<svg viewBox="0 0 40 28"><path d="M4,24 C12,24 14,4 28,4 C32,4 34,10 30,12 C26,14 22,8 36,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'bounce':'<svg viewBox="0 0 40 28"><path d="M4,24 C10,24 12,12 16,12 C20,12 20,20 24,20 C28,20 28,8 36,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  'elastic':'<svg viewBox="0 0 40 28"><path d="M4,24 C6,24 10,4 14,4 C18,4 18,20 22,20 C26,20 26,4 30,4 C34,4 34,14 36,14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

// ─── Lucide Icons (stroke, 2px, rounded) ───
var LUCIDE_ICONS = {
  'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" /></svg>',
  'eye-off': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /> <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /> <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /> <path d="m2 2 20 20" /></svg>',
  'arrow-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7" /> <path d="M12 19V5" /></svg>',
  'arrow-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /> <path d="m19 12-7 7-7-7" /></svg>',
  'move-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8L2 12L6 16" /> <path d="M2 12H22" /></svg>',
  'move-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8L22 12L18 16" /> <path d="M2 12H22" /></svg>',
  'move-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6L12 2L16 6" /> <path d="M12 2V22" /></svg>',
  'move-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18L12 22L16 18" /> <path d="M12 2V22" /></svg>',
  'keyboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 8h.01" /> <path d="M12 12h.01" /> <path d="M14 8h.01" /> <path d="M16 12h.01" /> <path d="M18 8h.01" /> <path d="M6 8h.01" /> <path d="M7 16h10" /> <path d="M8 12h.01" /> <rect width="20" height="16" x="2" y="4" rx="2" /></svg>',
  'rectangle-horizontal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" /></svg>',
  'square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>',
  'circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /></svg>',
  'egg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12" /></svg>',
  'triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>',
  'pentagon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z" /></svg>',
  'hexagon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>',
  'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>',
  'gem': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3 8 9l4 13 4-13-2.5-6" /> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" /> <path d="M2 9h20" /></svg>',
  'arrow-up-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg>',
  'repeat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>',
  'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>',
};
