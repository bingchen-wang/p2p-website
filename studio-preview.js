/* Recorded W42 run; local interactions only. The full workspace is P2P Studio. */
(() => {
  const preview = document.getElementById('studio-preview');
  if (!preview) return;
  const tabs = [...preview.querySelectorAll('[data-studio-tab]')];
  const proxies = [...preview.querySelectorAll('[data-proxy]')];
  const optionButtons = [...preview.querySelectorAll('[data-option]')];
  const byId = id => document.getElementById(id);
  const announce = text => { byId('studio-announcement').textContent = text; };
  let data;
  let maximumWeight = 1;
  let activeView = 'ensemble';
  let activeProxy = proxies.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  let activeOption = Number(preview.querySelector('.studio-option-key [aria-pressed="true"]').dataset.option);
  preview.dataset.view = activeView;

  function showView(view, focusTab = false, scrollToView = false) {
    activeView = view;
    preview.dataset.view = view;
    tabs.forEach(tab => {
      const selected = tab.dataset.studioTab === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      byId(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focusTab) tab.focus({ preventScroll: true });
    });
    byId('studio-view-heading').innerHTML = view === 'ensemble'
      ? 'From population to <em>ensemble.</em>'
      : 'Where does the <em>ensemble hold?</em>';
    if (scrollToView) {
      preview.querySelector('.studio-view-head').scrollIntoView({
        block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showView(tab.dataset.studioTab));
    tab.addEventListener('keydown', event => {
      let next;
      if (['ArrowLeft', 'ArrowRight'].includes(event.key)) next = tabs[1 - index];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs.at(-1);
      if (!next) return;
      event.preventDefault();
      showView(next.dataset.studioTab, true);
    });
  });
  preview.querySelector('[data-show-evidence]').addEventListener('click', () => showView('evidence', true, true));
  preview.querySelector('[data-show-ensemble]').addEventListener('click', () => showView('ensemble', true, true));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealInspector = label => {
    if (window.matchMedia('(max-width: 800px)').matches) {
      preview.querySelector(`aside[aria-label="${label}"]`).scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' });
    }
  };
  preview.querySelector('[data-back-to-formation]').addEventListener('click', () => {
    preview.querySelector('.studio-formation').scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' });
    proxies[activeProxy].focus({ preventScroll: true });
  });
  preview.querySelector('[data-back-to-options]').addEventListener('click', () => {
    preview.querySelector('.studio-question').scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' });
    preview.querySelector(`.studio-option-key [data-option="${activeOption}"]`).focus({ preventScroll: true });
  });


  function inspectProxy(index, moveFocus = false) {
    if (!data) return;
    const proxy = data.proxies[index];
    if (!proxy) return;
    proxies[activeProxy]?.setAttribute('aria-pressed', 'false');
    if (proxies[activeProxy]) proxies[activeProxy].tabIndex = -1;
    activeProxy = index;
    proxies[index].setAttribute('aria-pressed', 'true');
    proxies[index].tabIndex = 0;
    if (moveFocus) proxies[index].focus({ preventScroll: true });
    const retained = Math.abs(proxy.weight) > 1e-10;
    const negative = proxy.weight < 0;
    const status = !retained ? 'Generated · not retained' : negative ? 'Negative coefficient · anti-type' : 'Selected response law';
    byId('studio-proxy-number').textContent = String(index + 1).padStart(3, '0');
    byId('studio-proxy-mode').textContent = proxy.mode.replaceAll('_', ' ').replaceAll('+', ' + ');
    byId('studio-proxy-status').textContent = status;
    byId('studio-proxy-status').style.color = retained ? '#f1ad79' : '#a0aaa3';
    byId('studio-proxy-weight').textContent = retained ? `${negative ? '' : '+'}${proxy.weight.toFixed(4)}` : '0.0000';
    byId('studio-weight-fill').style.width = `${retained ? Math.max(4, Math.abs(proxy.weight) / maximumWeight * 100) : 0}%`;
    byId('studio-weight-fill').closest('.studio-weight').classList.toggle('is-negative', negative);
    byId('studio-weight-explanation').textContent = !retained
      ? 'This candidate received no fitted weight.'
      : negative ? 'Subtracts this response law from the fitted combination.' : 'Adds this response law to the fitted combination.';
    byId('studio-proxy-text').textContent = proxy.text;
    byId('studio-proxy-mode').closest('aside').scrollTop = 0;
    const attributes = document.createDocumentFragment();
    proxy.attributes.forEach(attribute => {
      const chip = document.createElement('span');
      chip.textContent = attribute;
      attributes.append(chip);
    });
    byId('studio-proxy-attributes').replaceChildren(attributes);
    announce(`Proxy ${index + 1}. ${status}. Coefficient ${proxy.weight.toFixed(4)}.`);
    if (!moveFocus) revealInspector('Inspected proxy');
  }
  proxies.forEach((button, index) => {
    button.addEventListener('click', () => inspectProxy(index));
    button.addEventListener('keydown', event => {
      const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -18, ArrowDown: 18 };
      let next;
      if (event.key in offsets) next = Math.max(0, Math.min(proxies.length - 1, index + offsets[event.key]));
      else if (event.key === 'Home') next = event.ctrlKey ? 0 : Math.floor(index / 18) * 18;
      else if (event.key === 'End') next = event.ctrlKey ? proxies.length - 1 : Math.min(proxies.length - 1, Math.floor(index / 18) * 18 + 17);
      if (next == null) return;
      event.preventDefault();
      inspectProxy(next, true);
    });
  });

  function inspectOption(index) {
    if (!data) return;
    const option = data.question.option_order[index];
    if (option == null) return;
    activeOption = index;
    optionButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.option) === index)));
    preview.querySelectorAll('[data-option-row]').forEach(row => row.classList.toggle('is-inspected', Number(row.dataset.optionRow) === index));
    const target = data.question.target[option] || 0;
    const prediction = data.question.prediction[option] || 0;
    const residual = prediction - target;
    byId('studio-inspected-option').textContent = option;
    byId('studio-inspected-option').closest('aside').scrollTop = 0;
    const unit = document.createElement('small');
    unit.textContent = ' pp';
    byId('studio-inspected-residual').replaceChildren(document.createTextNode(`${residual >= 0 ? '+' : ''}${(residual * 100).toFixed(1)}`), unit);
    byId('studio-inspected-residual').classList.toggle('is-over', residual >= 0);
    byId('studio-inspected-residual').classList.toggle('is-under', residual < 0);
    byId('studio-residual-explanation').textContent = Math.abs(residual) < 1e-12
      ? 'The ensemble matches the human survey share for this option.'
      : `The ensemble assigns ${(Math.abs(residual) * 100).toFixed(1)} percentage points ${residual > 0 ? 'more' : 'less'} than the human survey.`;
    byId('studio-inspected-target').textContent = `${(target * 100).toFixed(1)}%`;
    byId('studio-inspected-prediction').textContent = `${(prediction * 100).toFixed(1)}%`;
    announce(`${option}. Human survey ${(target * 100).toFixed(1)} percent. Ensemble ${(prediction * 100).toFixed(1)} percent.`);
    revealInspector('Inspected response option');
  }
  optionButtons.forEach(button => button.addEventListener('click', () => inspectOption(Number(button.dataset.option))));

  function initialiseEntropy() {
    const modes = data.entropy.modes;
    const selector = byId('studio-entropy-mode');
    const map = byId('studio-entropy-map');
    const trajectory = byId('studio-entropy-trajectory');
    const ns = 'http://www.w3.org/2000/svg';
    const svgNode = (tag, attrs, text) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      if (text != null) node.textContent = text;
      return node;
    };
    const addText = (root, x, y, text, attrs = {}) => root.append(svgNode('text', {x, y, fill:'#99a69d', 'font-size':10, 'font-family':'sans-serif', ...attrs}, text));
    const maxSelected = Math.max(...modes.map(mode => mode.selected), 1);
    const yMax = Math.ceil(maxSelected / 4) * 4;
    const xMax = Math.ceil(Math.max(...modes.map(mode => mode.finalEntropy)) * 10) / 10;
    const maxGenerated = Math.max(...modes.map(mode => mode.generated));
    const cx = entropy => 43 + entropy / xMax * 274;
    const cy = count => 198 - count / yMax * 174;
    const points = [];
    map.append(svgNode('rect', {x:43,y:24,width:274,height:174,rx:3,fill:'#10171b',stroke:'#293138'}));
    [0, .5, 1].forEach(fraction => {
      const y = cy(fraction * yMax);
      map.append(svgNode('line',{x1:43,y1:y,x2:317,y2:y,stroke:'#293138','stroke-dasharray':'2 4'}));
      addText(map,35,y+3,String(fraction*yMax),{'text-anchor':'end'});
      addText(map,cx(fraction*xMax),214,(fraction*xMax).toFixed(2),{'text-anchor':fraction===0?'start':fraction===1?'end':'middle'});
    });
    addText(map,180,237,'Final normalized entropy',{'text-anchor':'middle','font-size':11,fill:'#c9d3c5'});
    addText(map,43,14,'Agents selected',{'font-size':10,fill:'#c9d3c5'});
    modes.forEach((mode, index) => {
      const colour = data.familyColors[mode.family];
      const dot = svgNode('circle',{cx:cx(mode.finalEntropy),cy:cy(mode.selected),r:4+Math.sqrt(mode.generated/maxGenerated)*7,fill:colour,'fill-opacity':.75,stroke:'#10151a','stroke-width':1.5});
      dot.append(svgNode('title',{},`${mode.mode}: entropy ${mode.finalEntropy.toFixed(3)}, ${mode.selected} selected / ${mode.generated} generated`));
      dot.addEventListener('click', () => selectMode(index, true));
      points.push(dot); map.append(dot);
    });
    let currentMode = modes[0];
    function drawTrajectory() {
      const mode = currentMode;
      const {width, height} = trajectory.getBoundingClientRect();
      if (!width || !height) return;
      const left = 34, right = width - 10, top = 10, bottom = height - 32;
      const tx = step => left + step / 10 * (right - left);
      const ty = value => bottom - value / xMax * (bottom - top);
      const colour = data.familyColors[mode.family];
      trajectory.setAttribute('viewBox', `0 0 ${width} ${height}`);
      trajectory.setAttribute('aria-label', `Persistent entropy trajectory for ${mode.mode}`);
      trajectory.replaceChildren(svgNode('rect', {x:left,y:top,width:right-left,height:bottom-top,rx:3,fill:'#0d1216',stroke:'#293138'}));
      [0, .5, 1].forEach(fraction => {
        const value = xMax * fraction, y = ty(value);
        trajectory.append(svgNode('line', {x1:left,y1:y,x2:right,y2:y,stroke:'#293138','stroke-dasharray':'2 4'}));
        addText(trajectory,left-7,y+3,fraction ? value.toFixed(2) : '0',{'text-anchor':'end'});
      });
      [0,5,10].forEach(step => addText(trajectory,tx(step),height-17,String(step),{'text-anchor':step===0?'start':step===10?'end':'middle'}));
      addText(trajectory,(left+right)/2,height-3,'Generation step',{'text-anchor':'middle'});
      trajectory.append(svgNode('path', {d:mode.trajectory.map((point,i)=>`${i?'L':'M'} ${tx(point.step)} ${ty(point.value)}`).join(' '),fill:'none',stroke:colour,'stroke-width':2.5,'stroke-linejoin':'round'}));
      mode.trajectory.forEach(point => {
        const dot = svgNode('circle', {cx:tx(point.step),cy:ty(point.value),r:3,fill:colour});
        dot.append(svgNode('title', {}, `Step ${point.step}: ${point.value.toFixed(3)}`));
        trajectory.append(dot);
      });
    }
    const trajectoryObserver = new ResizeObserver(drawTrajectory);
    trajectoryObserver.observe(trajectory);
    function selectMode(index, userInitiated = false) {
      const mode = modes[index];
      if (!mode) return;
      selector.value = String(index);
      byId('studio-entropy-rank').textContent = `entropy rank ${index+1} / ${modes.length}`;
      byId('studio-entropy-final').textContent = mode.finalEntropy.toFixed(3);
      byId('studio-entropy-count').textContent = `${mode.selected} / ${mode.generated}`;
      const colour = data.familyColors[mode.family];
      const tokens = mode.mode.split('+').map(token => {
        const chip = document.createElement('span'); chip.textContent = token.replaceAll('_',' '); return chip;
      });
      byId('studio-entropy-tokens').style.setProperty('--mode-colour',colour);
      byId('studio-entropy-tokens').replaceChildren(...tokens);
      points.forEach((dot,i) => {
        dot.setAttribute('stroke',i===index?'#f4eee3':'#10151a');
        dot.setAttribute('stroke-width',i===index?'2':'1.5');
        dot.setAttribute('fill-opacity',i===index?'1':'.65');
      });
      // Draw the inspected mode last so overlapping modes remain identifiable.
      map.append(points[index]);
      currentMode = mode;
      drawTrajectory();
      if (userInitiated) announce(`${mode.mode}. Entropy ${mode.finalEntropy.toFixed(3)}. ${mode.selected} of ${mode.generated} proxies selected.`);
    }
    selector.addEventListener('change',()=>selectMode(Number(selector.value),true));
    selectMode(0);
  }

  fetch(new URL('assets/studio/w42.json', document.baseURI))
    .then(response => {
      if (!response.ok) throw new Error(`Preview data: HTTP ${response.status}`);
      return response.json();
    })
    .then(snapshot => {
      const retained = snapshot.proxies.filter(proxy => Math.abs(proxy.weight) > 1e-10).length;
      if (snapshot.proxies.length !== 300 || retained !== 58 || snapshot.provenance.backend !== 'gemini-2.0-flash') {
        throw new Error('Unexpected W42 walkthrough data');
      }
      data = snapshot;
      maximumWeight = Math.max(...data.proxies.map(proxy => Math.abs(proxy.weight)));
      initialiseEntropy();
      preview.dataset.ready = 'true';
    })
    .catch(error => {
      preview.dataset.ready = 'error';
      announce('The interactive preview could not load. The recorded example remains visible; follow the documentation link to explore Studio.');
      console.warn('Studio preview:', error.message);
    });
})();
