// ─── NAV ────────────────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function setNavActive(idx) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
}
document.querySelectorAll('.nav-tab').forEach((tab, idx) => {
  tab.addEventListener('click', () => setNavActive(idx));
});

// ─── QUIZ ────────────────────────────────────────────────────────────────────
function checkAnswer(btn, isCorrect, qid) {
  const q = btn.closest('.quiz-question');
  q.querySelectorAll('.quiz-option').forEach(b => b.style.pointerEvents = 'none');
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    q.querySelectorAll('.quiz-option').forEach(b => {
      if (b.onclick && b.onclick.toString().includes('true')) b.classList.add('correct');
    });
  }
  const fb = document.getElementById('fb-' + qid);
  fb.classList.add('show', isCorrect ? 'correct-fb' : 'wrong-fb');
  fb.innerHTML = isCorrect ? '✓ Correct! Well done.' : '✗ Not quite. Review the lesson content and try again on paper.';
}

// ─── PROGRESS TRACKER ────────────────────────────────────────────────────────
function advanceTracker(barId, pctId) {
  const bar = document.getElementById(barId);
  const pct = document.getElementById(pctId);
  const current = parseInt(bar.style.width) || 0;
  const next = Math.min(current + 10, 100);
  bar.style.width = next + '%';
  pct.textContent = next + '%';
}

// ─── NOTE EXPLORER DATA ──────────────────────────────────────────────────────
const noteMap = {
  'G': ['G3','A3','B3','C4','D4'],
  'D': ['D4','E4','F#4','G4','A4'],
  'A': ['A4','B4','C#5','D5','E5'],
  'E': ['E5','F#5','G#5','A5','B5']
};
const noteInfo = {
  'G3': 'G string · Open (0) → G3',
  'Ab3':'G string · Low 1st finger → A♭3', 'A3': 'G string · 1st finger → A3',
  'Bb3':'G string · Low 2nd finger → B♭3', 'B3': 'G string · 2nd finger → B3',
  'C4': 'G string · 3rd finger → C4',       'D4': 'G string · 4th finger / D string Open → D4',
  'Eb4':'D string · Low 1st finger → E♭4',  'E4': 'D string · 1st finger → E4',
  'F4': 'D string · Low 2nd finger → F4',   'F#4':'D string · 2nd finger → F#4',
  'G4': 'D string · 3rd finger → G4',       'A4': 'A string · Open (0) → A4',
  'Bb4':'A string · Low 1st finger → B♭4',  'B4': 'A string · 1st finger → B4',
  'C5': 'A string · Low 2nd finger → C5',   'C#5':'A string · 2nd finger → C#5',
  'D5': 'A string · 3rd finger → D5',       'E5': 'E string · Open (0) → E5',
  'F5': 'E string · Low 1st finger → F5',   'F#5':'E string · 1st finger → F#5',
  'G5': 'E string · Low 2nd finger → G5',   'G#5':'E string · 2nd finger → G#5',
  'A5': 'E string · 3rd finger → A5',       'B5': 'E string · 4th finger → B5'
};
let selectedString = 'A', selectedFinger = 1;

function selectString(s, btn) {
  selectedString = s;
  document.querySelectorAll('#string-btns .note-btn').forEach(b => b.classList.remove('selected','playing'));
  btn.classList.add('selected');
  updateNoteDisplay(true);
}
function selectFinger(f, btn) {
  selectedFinger = f;
  document.querySelectorAll('#finger-btns .note-btn').forEach(b => b.classList.remove('selected','playing'));
  btn.classList.add('selected');
  updateNoteDisplay(true);
}
function updateNoteDisplay(andPlay) {
  const note = noteMap[selectedString][selectedFinger];
  const info = noteInfo[note] || note;
  document.getElementById('note-display').innerHTML =
    `<strong style="font-size:1.4rem; color:var(--gold-light); margin-right:1rem;">${note}</strong>` +
    `<span style="font-size:0.85rem; color:rgba(245,240,232,0.75);">${info}</span>` +
    `<span style="margin-left:1rem; font-size:0.75rem; color:rgba(245,240,232,0.4);">🔊 Playing…</span>`;
  if (andPlay) playNote(note);
}

// ─── FINGERBOARD SVG RENDERER ────────────────────────────────────────────────
function renderFB(id, notes) {
  var el = document.getElementById(id);
  if (!el) return;
  var strs = ['E','A','D','G'];
  var sC = {E:'#e0e0e0',A:'#d4b483',D:'#c8963e',G:'#8b6a3e'};
  var sW = {E:1.5,A:2,D:2.5,G:3};
  var W=540, H=195, L=32, T=28, S=38;
  var px = [L+30, L+130, L+230, L+330, L+430];
  var h = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:'+W+'px">';
  h += '<line x1="'+(px[0]-12)+'" y1="'+(T-8)+'" x2="'+(px[0]-12)+'" y2="'+(T+3*S+8)+'" stroke="rgba(200,150,62,0.4)" stroke-width="3"/>';
  for (var i=0;i<4;i++){
    var y=T+i*S;
    h += '<line x1="'+(px[0]-15)+'" y1="'+y+'" x2="'+(px[4]+30)+'" y2="'+y+'" stroke="'+sC[strs[i]]+'" stroke-width="'+sW[strs[i]]+'" opacity="0.6"/>';
    h += '<text x="14" y="'+(y+5)+'" text-anchor="middle" font-family="Playfair Display,serif" font-size="14" font-weight="700" fill="'+sC[strs[i]]+'">'+strs[i]+'</text>';
  }
  var fl=['Open','1st','2nd','3rd','4th'];
  for(var j=0;j<5;j++){
    h += '<text x="'+px[j]+'" y="'+(T+4*S)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9.5" fill="rgba(245,240,232,0.35)">'+fl[j]+'</text>';
  }
  for(var k=0;k<notes.length;k++){
    var n=notes[k], si=strs.indexOf(n.s);
    if(si<0) continue;
    // Support fractional finger positions (e.g. 0.5 = low 1st, 1.5 = low 2nd)
    var cx, fi=Math.floor(n.f), frac=n.f-fi;
    if(frac>0 && fi+1<px.length){ cx=px[fi]+frac*(px[fi+1]-px[fi]); } else { cx=px[fi]; }
    var cy=T+si*S;
    var rad = frac>0 ? 11 : 13; // slightly smaller dots for low-finger positions
    var fill=n.t==='r'?'#8B1A1A':n.t==='g'?'#2A5535':n.t==='h'?'#E8B85A':n.t==='l'?'rgba(139,26,26,0.55)':'rgba(200,150,62,0.85)';
    var tc=(n.t==='r'||n.t==='g')?'#F5F0E8':n.t==='l'?'#F5F0E8':'#1C1C1C';
    var noteVal = n.note || (n.l ? n.l.replace(/\s*\(\d\)/,'') : '');
    h += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rad+'" fill="'+fill+'" data-note="'+noteVal+'" data-label="'+(n.l||'')+'" data-info="'+(n.l||'')+(n.d?' — '+n.d:'')+'" style="cursor:pointer"/>';
    var fs = frac>0 ? '7.5' : '9';
    h += '<text x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="'+fs+'" font-weight="700" fill="'+tc+'" style="pointer-events:none">'+(n.l||'')+'</text>';
  }
  h += '</svg>';
  var d=el.querySelector('.fb-svg');
  if(d) d.innerHTML=h;
}

// Hover & click for SVG fingerboard
document.addEventListener('mouseover', function(e){
  if(e.target.tagName==='circle' && e.target.dataset.info){
    var w=e.target.closest('.fb-wrap');
    if(w){ var h=w.querySelector('.fb-hint'); if(h) h.textContent=e.target.dataset.info+' · Click to hear'; }
  }
});
document.addEventListener('mouseout', function(e){
  if(e.target.tagName==='circle'){
    var w=e.target.closest('.fb-wrap');
    if(w){ var h=w.querySelector('.fb-hint'); if(h) h.textContent='Click a note dot to hear the sound · Hover to see details'; }
  }
});

// Render all fingerboards
renderFB('fb-open',[
  {s:'G',f:0,l:'G3',note:'G3',t:'r',d:'Lowest string, rich warm tone'},
  {s:'D',f:0,l:'D4',note:'D4',t:'r',d:'2nd string, core of the range'},
  {s:'A',f:0,l:'A4',note:'A4',t:'r',d:'Concert A 440Hz, tuning reference'},
  {s:'E',f:0,l:'E5',note:'E5',t:'r',d:'Highest string, brilliant tone'}
]);
renderFB('fb-1pos',[
  // G string — open, low 1st, high 1st, low 2nd, high 2nd, 3rd, 4th
  {s:'G',f:0,l:'G',note:'G3',t:'r'},
  {s:'G',f:0.5,l:'A♭',note:'Ab3',t:'l',d:'Low 1st finger'},{s:'G',f:1,l:'A',note:'A3',d:'High 1st finger'},
  {s:'G',f:1.5,l:'B♭',note:'Bb3',t:'l',d:'Low 2nd finger'},{s:'G',f:2,l:'B',note:'B3',d:'High 2nd finger'},
  {s:'G',f:3,l:'C',note:'C4'},{s:'G',f:4,l:'D',note:'D4',d:'= open D'},
  // D string
  {s:'D',f:0,l:'D',note:'D4',t:'r'},
  {s:'D',f:0.5,l:'E♭',note:'Eb4',t:'l',d:'Low 1st finger'},{s:'D',f:1,l:'E',note:'E4',d:'High 1st finger'},
  {s:'D',f:1.5,l:'F',note:'F4',t:'l',d:'Low 2nd finger'},{s:'D',f:2,l:'F#',note:'F#4',d:'High 2nd finger'},
  {s:'D',f:3,l:'G',note:'G4'},{s:'D',f:4,l:'A',note:'A4',d:'= open A'},
  // A string
  {s:'A',f:0,l:'A',note:'A4',t:'r'},
  {s:'A',f:0.5,l:'B♭',note:'Bb4',t:'l',d:'Low 1st finger'},{s:'A',f:1,l:'B',note:'B4',d:'High 1st finger'},
  {s:'A',f:1.5,l:'C',note:'C5',t:'l',d:'Low 2nd finger'},{s:'A',f:2,l:'C#',note:'C#5',d:'High 2nd finger'},
  {s:'A',f:3,l:'D',note:'D5'},{s:'A',f:4,l:'E',note:'E5',d:'= open E'},
  // E string
  {s:'E',f:0,l:'E',note:'E5',t:'r'},
  {s:'E',f:0.5,l:'F',note:'F5',t:'l',d:'Low 1st finger'},{s:'E',f:1,l:'F#',note:'F#5',d:'High 1st finger'},
  {s:'E',f:1.5,l:'G',note:'G5',t:'l',d:'Low 2nd finger'},{s:'E',f:2,l:'G#',note:'G#5',d:'High 2nd finger'},
  {s:'E',f:3,l:'A',note:'A5'},{s:'E',f:4,l:'B',note:'B5'}
]);
renderFB('fb-int',[
  {s:'A',f:0,l:'A',note:'A4',t:'r',d:'Root — open A'},
  {s:'A',f:4,l:'E',note:'E5',t:'g',d:'Perfect 5th above A'},
  {s:'D',f:0,l:'D',note:'D4',t:'r',d:'Root — open D'},
  {s:'D',f:4,l:'A',note:'A4',t:'g',d:'Perfect 5th above D'}
]);
renderFB('fb-dbl',[
  {s:'D',f:0,l:'D',note:'D4',t:'r',d:'D string open'},{s:'A',f:2,l:'F#',note:'F#5',t:'g',d:'Major 3rd above'},
  {s:'D',f:1,l:'E',note:'E4',t:'r',d:'D string 1st finger'},{s:'A',f:3,l:'G',note:'G5',t:'g',d:'Minor 3rd above'},
  {s:'D',f:2,l:'F#',note:'F#4',t:'r',d:'D string 2nd finger'},{s:'A',f:4,l:'A',note:'A5',t:'g',d:'Minor 3rd above'},
  {s:'A',f:0,l:'A',note:'A4',t:'r',d:'A string open'},{s:'E',f:2,l:'C#',note:'C#5',t:'g',d:'Major 3rd above'}
]);
renderFB('fb-dmaj',[
  {s:'D',f:0,l:'D',note:'D4',t:'r',d:'Tonic, scale degree 1'},
  {s:'D',f:1,l:'E',note:'E4',d:'Scale degree 2'},
  {s:'D',f:2,l:'F#',note:'F#4',d:'Scale degree 3'},
  {s:'D',f:3,l:'G',note:'G4',d:'Scale degree 4'},
  {s:'A',f:0,l:'A',note:'A4',t:'h',d:'Scale degree 5 — cross to A string'},
  {s:'A',f:1,l:'B',note:'B4',d:'Scale degree 6'},
  {s:'A',f:2,l:'C#',note:'C#5',d:'Scale degree 7, leading tone'},
  {s:'A',f:3,l:'D',note:'D5',t:'r',d:'Octave, scale degree 8'}
]);

// ─── VIOLIN SOUND ENGINE (Tone.js) ──────────────────────────────────────────
const statusEl  = document.getElementById('audio-status');
const statusTxt = document.getElementById('audio-status-text');
const toast     = document.getElementById('note-toast');
const toastNote = document.getElementById('toast-note');
const toastInfo = document.getElementById('toast-info');
let toastTimer  = null;
let violinReady = false;

// Use MusyngKite violin samples from gleitz's public CDN
const violin = new Tone.Sampler({
  urls: {
    G3: "G3.mp3",
    D4: "D4.mp3",
    A4: "A4.mp3",
    E5: "E5.mp3",
  },
  baseUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/violin-mp3/",
  onload: () => {
    violinReady = true;
    if (statusEl) statusEl.classList.add('ready');
    if (statusTxt) statusTxt.textContent = 'VIOLIN READY · CLICK ANY NOTE';
  },
  onerror: (err) => {
    if (statusTxt) statusTxt.textContent = 'SOUND ERROR — check console';
    console.error('Sampler error:', err);
  }
}).toDestination();

// Convert raw note text to Tone.js format
function parseToneNote(raw) {
  if (!raw) return null;
  // Clean up: strip parens like "(0)", strip spaces
  let s = raw.trim().replace(/\s*\(.*\)/, '').replace(/\s+/g,'');
  // Match e.g. G3, F#4, Bb5, C#5, G#5, Ab4, A#4
  const m = s.match(/^([A-Ga-g])([#b♭♯]?)(\d)$/);
  if (!m) return null;
  let note = m[1].toUpperCase() + m[2].replace('♭','b').replace('♯','#');
  return note + m[3];
}

function showToast(note, label) {
  if (!toast) return;
  if (toastNote) toastNote.textContent = note;
  if (toastInfo) toastInfo.textContent = label ? '· ' + label : '';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function playNote(rawNote, label) {
  try {
    await Tone.start();
    const note = parseToneNote(rawNote);
    if (!note) { console.warn('Could not parse note:', rawNote); return; }
    violin.triggerAttackRelease(note, "1.2");
    // UI feedback
    if (statusEl) {
      statusEl.classList.add('playing');
      setTimeout(() => statusEl.classList.remove('playing'), 500);
    }
    showToast(note, label);
  } catch(err) {
    console.error('Playback error:', err);
  }
}

// ─── Render individual string fingerboards (Finger Placement Drill) ─────────
// G String
renderFB('fb-drill-g',[
  {s:'G',f:0,l:'G',note:'G3',t:'r',d:'Open G String (No finger)'},
  {s:'G',f:1,l:'A',note:'A3',d:'1st Finger (Close to nut)'},
  {s:'G',f:2,l:'B',note:'B3',d:'2nd Finger (Close to 1st)'},
  {s:'G',f:3,l:'C',note:'C4',d:'3rd Finger (Slight gap)'},
  {s:'G',f:4,l:'D',note:'D4',t:'h',d:'4th Finger (Next to 3rd)'}
]);
// D String
renderFB('fb-drill-d',[
  {s:'D',f:0,l:'D',note:'D4',t:'r',d:'Open D String (No finger)'},
  {s:'D',f:1,l:'E',note:'E4',d:'1st Finger (Close to nut)'},
  {s:'D',f:2,l:'F#',note:'F#4',d:'2nd Finger (Close to 1st)'},
  {s:'D',f:3,l:'G',note:'G4',d:'3rd Finger (Slight gap)'},
  {s:'D',f:4,l:'A',note:'A4',t:'h',d:'4th Finger (Next to 3rd)'}
]);
// A String
renderFB('fb-drill-a',[
  {s:'A',f:0,l:'A',note:'A4',t:'r',d:'Open A String (No finger)'},
  {s:'A',f:1,l:'B',note:'B4',d:'1st Finger (Close to nut)'},
  {s:'A',f:2,l:'C#',note:'C#5',d:'2nd Finger (Close to 1st)'},
  {s:'A',f:3,l:'D',note:'D5',d:'3rd Finger (Slight gap)'},
  {s:'A',f:4,l:'E',note:'E5',t:'h',d:'4th Finger (Next to 3rd)'}
]);
// E String
renderFB('fb-drill-e',[
  {s:'E',f:0,l:'E',note:'E5',t:'r',d:'Open E String (No finger)'},
  {s:'E',f:1,l:'F#',note:'F#5',d:'1st Finger (Close to nut)'},
  {s:'E',f:2,l:'G#',note:'G#5',d:'2nd Finger (Close to 1st)'},
  {s:'E',f:3,l:'A',note:'A5',d:'3rd Finger (Slight gap)'},
  {s:'E',f:4,l:'B',note:'B5',t:'h',d:'4th Finger (Next to 3rd)'}
]);

// All Strings Combined — Complete First Position Map
renderFB('fb-finger-drill',[
  // G string
  {s:'G',f:0,l:'G',note:'G3',t:'r',d:'Open G String'},
  {s:'G',f:1,l:'A',note:'A3',d:'G string · 1st Finger'},
  {s:'G',f:2,l:'B',note:'B3',d:'G string · 2nd Finger'},
  {s:'G',f:3,l:'C',note:'C4',d:'G string · 3rd Finger'},
  {s:'G',f:4,l:'D',note:'D4',t:'h',d:'G string · 4th Finger'},
  // D string
  {s:'D',f:0,l:'D',note:'D4',t:'r',d:'Open D String'},
  {s:'D',f:1,l:'E',note:'E4',d:'D string · 1st Finger'},
  {s:'D',f:2,l:'F#',note:'F#4',d:'D string · 2nd Finger'},
  {s:'D',f:3,l:'G',note:'G4',d:'D string · 3rd Finger'},
  {s:'D',f:4,l:'A',note:'A4',t:'h',d:'D string · 4th Finger'},
  // A string
  {s:'A',f:0,l:'A',note:'A4',t:'r',d:'Open A String'},
  {s:'A',f:1,l:'B',note:'B4',d:'A string · 1st Finger'},
  {s:'A',f:2,l:'C#',note:'C#5',d:'A string · 2nd Finger'},
  {s:'A',f:3,l:'D',note:'D5',d:'A string · 3rd Finger'},
  {s:'A',f:4,l:'E',note:'E5',t:'h',d:'A string · 4th Finger'},
  // E string
  {s:'E',f:0,l:'E',note:'E5',t:'r',d:'Open E String'},
  {s:'E',f:1,l:'F#',note:'F#5',d:'E string · 1st Finger'},
  {s:'E',f:2,l:'G#',note:'G#5',d:'E string · 2nd Finger'},
  {s:'E',f:3,l:'A',note:'A5',d:'E string · 3rd Finger'},
  {s:'E',f:4,l:'B',note:'B5',t:'h',d:'E string · 4th Finger'}
]);

// ─── CLICK HANDLER: .note-box elements ──────────────────────────────────────
document.addEventListener('click', function(e) {
  const nb = e.target.closest('.note-box');
  if (!nb) return;

  // Prefer data-note attribute (explicit), otherwise parse text
  const raw = nb.dataset.note || nb.textContent.trim();
  const label = nb.closest('.scale-row')?.querySelector('.scale-name')?.textContent || '';

  // Flash animation
  nb.classList.add('playing');
  setTimeout(() => nb.classList.remove('playing'), 500);

  playNote(raw, label);
});

// ─── CLICK HANDLER: SVG fingerboard circles ─────────────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.tagName !== 'circle') return;
  const raw = e.target.dataset.note;
  const label = e.target.dataset.info || '';
  if (!raw) return;

  // Flash the circle
  const origFill = e.target.getAttribute('fill');
  e.target.setAttribute('fill', '#E8B85A');
  setTimeout(() => e.target.setAttribute('fill', origFill), 500);

  playNote(raw, label);
});

// ─── UX & NAVIGATION ENHANCEMENTS ───────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // 1. Handle Back-button routing via Hash
  const hash = window.location.hash.substring(1);
  if (hash && document.getElementById(hash)) {
    // Hide all first
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(hash).classList.add('active');
    
    // Sync the tabs
    const tabMap = { 'overview': 0, 'level1': 1, 'level2': 2, 'level3': 3, 'level4': 4, 'theory': 5, 'practice': 6, 'eartraining': 7, 'resources': 8 };
    if (tabMap[hash] !== undefined) {
      const tabs = document.querySelectorAll('.nav-tab');
      tabs.forEach((t, i) => t.classList.toggle('active', i === tabMap[hash]));
    }
    
    // Smooth scroll to top implicitly done by CSS or we can force it
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // 2. Setup scroll reveal animations
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, stop observing to keep it visible
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  // Add the reveal class to aesthetic components
  const componentsToAnimate = document.querySelectorAll('.content-block, .img-card, .video-card, .tip-item, .level-card, .section-header, .panel-header, .routine-block, .exercise-box, .notation-box, .quiz-question, .note-checker, .tracker-item');
  
  componentsToAnimate.forEach((el, index) => {
    el.classList.add('reveal');
    // Slight staggered delay based on DOM order for cascading effect
    el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    revealObserver.observe(el);
  });
});