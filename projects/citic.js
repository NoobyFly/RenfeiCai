(() => {
  'use strict';
  const byId = id => document.getElementById(id);

  const data = JSON.parse(byId('spread-data').textContent);
  const wrap = byId('spread-chart');
  const range = byId('spread-date-range');
  let chosen = data.length - 1;
  let frame;
  if (data.length && data.every(row => Number.isFinite(row.spread) && Number.isFinite(Date.parse(row.date)))) {
    const times = data.map(row => Date.parse(row.date));
    const first = times[0], last = times[times.length - 1];
    range.max = String(data.length - 1);
    range.value = String(chosen);
    function renderChart() {
      const width = Math.max(260, Math.round(wrap.getBoundingClientRect().width));
      if (frame && frame.width === width) return;
      const height = width < 600 ? 270 : 340;
      const left = width < 600 ? 36 : 48, right = width - 12, top = 15, bottom = height - 38;
      const x = stamp => left + (stamp - first) / (last - first) * (right - left);
      const y = value => bottom - (value + 150) / 300 * (bottom - top);
      const path = data.map((row, i) => (i ? 'L' : 'M') + x(times[i]).toFixed(2) + ' ' + y(row.spread).toFixed(2)).join(' ');
      const grids = [-150, -100, -50, 0, 50, 100, 150].map(value => '<line class="' + (value === 0 ? 'cr-zero-line' : 'cr-grid-line') + '" x1="' + left + '" x2="' + right + '" y1="' + y(value) + '" y2="' + y(value) + '"/><text class="cr-axis-text" x="' + (left - 9) + '" y="' + (y(value) + 5) + '" text-anchor="end">' + value + '</text>').join('');
      const months = (width < 600 ? [1, 3, 5, 7] : [1, 2, 3, 4, 5, 6, 7]).map(month => {
        const stamp = month === 1 ? first : Date.parse('2026-' + String(month).padStart(2, '0') + '-01');
        return '<text class="cr-axis-text" x="' + x(stamp) + '" y="' + (bottom + 29) + '" text-anchor="middle">' + month + ' 月</text>';
      }).join('');
      wrap.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="spread-svg-title spread-svg-description"><title id="spread-svg-title">LME 铜现货与三个月价格之差</title><desc id="spread-svg-description">2026 年 1 月 2 日至 7 月 27 日，143 条日期记录。正值为现货高于三个月报价，负值相反。可通过图下日期滑块读取数值。</desc>' + grids + months + '<path class="cr-data-line" d="' + path + '"/><line id="spread-guide" class="cr-hover-line" x1="0" x2="0" y1="' + top + '" y2="' + bottom + '"/><circle id="spread-dot" class="cr-hover-dot" cx="0" cy="0" r="5"/></svg>';
      frame = { left, right, x, y, first, last, width };
      select(chosen);
    }
    function select(index) {
      chosen = Math.max(0, Math.min(data.length - 1, Math.round(index)));
      const row = data[chosen];
      const value = (row.spread > 0 ? '+' : '') + new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(row.spread);
      byId('spread-date').textContent = row.date.replaceAll('-', '.');
      byId('spread-value').textContent = value;
      byId('spread-label').textContent = row.spread > 0 ? '现货高于三个月报价' : row.spread < 0 ? '现货低于三个月报价' : '两者报价相同';
      range.value = String(chosen);
      range.setAttribute('aria-valuetext', row.date + '，价差 ' + value + ' 美元每吨');
      if (frame) {
        const xx = frame.x(times[chosen]);
        byId('spread-guide').setAttribute('x1', xx); byId('spread-guide').setAttribute('x2', xx);
        byId('spread-dot').setAttribute('cx', xx); byId('spread-dot').setAttribute('cy', frame.y(row.spread));
      }
    }
    function pointerSelect(event) {
      if (!frame || (event.type === 'pointermove' && event.pointerType !== 'mouse')) return;
      const rect = wrap.getBoundingClientRect();
      const localX = (event.clientX - rect.left) * frame.width / rect.width;
      const stamp = first + Math.max(0, Math.min(1, (localX - frame.left) / (frame.right - frame.left))) * (last - first);
      let nearest = 0;
      for (let i = 1; i < times.length; i++) if (Math.abs(times[i] - stamp) < Math.abs(times[nearest] - stamp)) nearest = i;
      select(nearest);
    }
    range.addEventListener('input', () => select(Number(range.value)));
    wrap.addEventListener('pointermove', pointerSelect);
    wrap.addEventListener('pointerdown', pointerSelect);
    renderChart();
    if ('ResizeObserver' in window) new ResizeObserver(renderChart).observe(wrap);
  }
  if (new URLSearchParams(location.search).get('review') === '1') document.querySelectorAll('.cr-editor-note').forEach(note => { note.hidden = false; });
})();
