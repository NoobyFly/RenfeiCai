(() => {
  "use strict";
  const dialog = document.getElementById("sim-lightbox");
  const largeImage = document.getElementById("sim-lightbox-image");
  const caption = document.getElementById("sim-lightbox-caption");
  let trigger = null;
  let previousOverflow = "";
  document.querySelectorAll("[data-photo]").forEach(button => {
    button.addEventListener("click", () => {
      trigger = button;
      largeImage.src = button.dataset.photo;
      largeImage.alt = button.querySelector("img").alt;
      caption.textContent = button.dataset.photoCaption;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    });
  });
  dialog.querySelector(".sim-lightbox-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    if (trigger) trigger.focus();
  });

  const workbench = document.querySelector('.sim-strategy-workbench');
  const scenarioCopy = {
    contest: ['如果对手也看好同一市场', '机会越集中，越需要判断竞争代价。', '市场的吸引力，能否覆盖更强竞争下的资源投入。', '比较进入与避让的价值，同时考虑其他市场与手中可用资源。', '', '同向布局，意味着机会与竞争同时集中。', '我方与对手同时指向同一市场，形成正面竞争。'],
    diverge: ['如果对手集中于一处', '避开拥挤，也要确认别处是否值得进入。', '其他市场的机会、进入成本，以及对手转向的可能性。', '以竞争压力较小换取布局空间，同时衡量可能放弃的市场机会。', '错位的价值，来自机会与代价的比较。', '选择不同机会，仍然需要关注对手是否跟进。', '对手假设指向共同市场，我方考虑其他市场机会。'],
    adapt: ['如果实际反馈偏离预期', '判断需要调整，资源也要留有余地。', '对手布局或经营反馈的变化，是否动摇了原先的判断。', '比较维持原方案、调整布局与暂缓投入，考虑继续投入的代价。', '保留调整空间，也是经营选择的一部分。', '预期改变时，重新比较方案与可用资源。', '对手的可能布局发生变化，我方保留资源以调整选择。']
  };
  if (workbench) {
    const buttons = [...workbench.querySelectorAll('[data-scenario-select]')];
    const detail = workbench.querySelector('#sim-scenario-detail');
    buttons.forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.scenarioSelect;
      const copy = scenarioCopy[key];
      if (!copy) return;
      workbench.dataset.scenario = key;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      detail.querySelector('.sim-sheet-kicker').textContent = copy[0];
      detail.querySelector('h3').textContent = copy[1];
      detail.querySelectorAll('dd').forEach((item, index) => { item.textContent = copy[index + 2]; });
      const scenarioNote = detail.querySelector('.sim-scenario-question');
      scenarioNote.textContent = copy[4];
      scenarioNote.hidden = !copy[4];
      workbench.querySelector('#sim-diagram-caption').textContent = copy[5];
      workbench.querySelector('#sim-strategy-svg-desc').textContent = copy[6];
    }));
  }
})();
