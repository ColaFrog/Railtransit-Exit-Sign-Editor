const initialState = {
  station: "2/3",
  titleSize: 170,
  destinationSize: 30,
  arrow: "left",
  align: "left",
  widthMode: "auto",
  fixedWidth: 360,
  exits: [
    { number: "2", status: "暂未开通", icons: [], iconAlign: "left", destinations: [] },
    {
      number: "3",
      status: "",
      icons: [],
      iconAlign: "left",
      destinations: [
        { cn: "你好路", en: "Nihao Rd." },
        { cn: "你好风景旅游区", en: "Nihao Scenic Tourism Area" }
      ]
    }
  ]
};

let state = structuredClone(initialState);
const $ = (selector) => document.querySelector(selector);
const signPreview = $("#signPreview");

// Arrow paths copied from the provided icons.js icon library.
const arrowPaths = {
  left: "M27.8417 0.244357L39.193 0.244358L15.1895 23.8184L56 23.8184L56 32.1815L15.1895 32.1815L39.193 55.7556L27.8417 55.7556L2.42647e-06 28L27.8417 0.244357Z",
  right: "M28.1583 55.7556H16.807L40.8105 32.1815H-8.74046e-07V23.8185L40.8105 23.8185L16.807 0.244385L28.1583 0.244385L56 28L28.1583 55.7556Z"
};

const serviceIcons = Object.entries((window.SignIcons && window.SignIcons.ALL) || {})
  .filter(([, icon]) => icon.cat === "service")
  .map(([id, icon]) => ({ id, name: icon.name, vb: icon.vb, body: icon.body }));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function arrowSvg() {
  return `<svg viewBox="0 0 56 56" aria-hidden="true"><path d="${arrowPaths[state.arrow]}" fill="currentColor"/></svg>`;
}

function iconSvg(id, className = "") {
  const icon = serviceIcons.find((item) => item.id === id);
  if (!icon) return "";
  const body = icon.body.replaceAll('fill="black"', 'fill="currentColor"');
  return `<svg class="${className}" viewBox="${icon.vb}" aria-hidden="true">${body}</svg>`;
}

function getExitIcons(exit) {
  return Array.isArray(exit.icons) ? exit.icons : exit.icon ? [exit.icon] : [];
}

function iconPickerMarkup(exit) {
  const icons = getExitIcons(exit);
  return `<div class="destination-tools">
    <div class="icon-picker" role="group" aria-label="服务设施图标">
      <button type="button" class="icon-choice none ${icons.length === 0 ? "active" : ""}" data-icon="" title="清空图标" aria-label="清空图标">−</button>
      ${serviceIcons.map((icon) => `<button type="button" class="icon-choice ${icons.includes(icon.id) ? "active" : ""}" data-icon="${icon.id}" title="${escapeHtml(icon.name)}" aria-label="${escapeHtml(icon.name)}">${iconSvg(icon.id)}</button>`).join("")}
    </div>
    <span class="icon-count">${icons.length}/10</span>
    <div class="icon-align" role="group" aria-label="图标对齐">
      <button type="button" class="${exit.iconAlign !== "right" ? "active" : ""}" data-icon-align="left" title="图标左对齐" aria-label="图标左对齐"><span class="align-symbol left"></span></button>
      <button type="button" class="${exit.iconAlign === "right" ? "active" : ""}" data-icon-align="right" title="图标右对齐" aria-label="图标右对齐"><span class="align-symbol right"></span></button>
    </div>
  </div>`;
}

function stationTitleMarkup(value) {
  return Array.from(String(value ?? "")).map((character) => character === "/"
    ? `<span class="station-slash" aria-hidden="true">/</span>`
    : `<span class="station-glyph">${escapeHtml(character)}</span>`).join("");
}

function exitNumberMarkup(value) {
  return Array.from(String(value ?? "")).map((character) => character === "/"
    ? `<span class="exit-number-slash" aria-hidden="true">/</span>`
    : `<span class="exit-number-glyph">${escapeHtml(character)}</span>`).join("");
}

function renderEditor() {
  $("#exitCount").textContent = `${String(state.exits.length).padStart(2, "0")} 个出口`;
  $("#exitEditor").innerHTML = state.exits.map((exit, exitIndex) => `
    <div class="exit-card" data-exit="${exitIndex}">
      <div class="exit-card-top">
        <div class="exit-card-label"><span class="number-chip">${exitIndex + 1}</span>出口 ${exitIndex + 1}</div>
        <div class="exit-actions">
          <button class="icon-button move-up" type="button" title="上移" aria-label="上移出口" ${exitIndex === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-button move-down" type="button" title="下移" aria-label="下移出口" ${exitIndex === state.exits.length - 1 ? "disabled" : ""}>↓</button>
          <button class="icon-button delete" type="button" title="删除" aria-label="删除出口" ${state.exits.length === 1 ? "disabled" : ""}>×</button>
        </div>
      </div>
      <div class="mini-field"><input class="exit-num" data-field="number" value="${escapeHtml(exit.number)}" maxlength="32" aria-label="出口编号" /><input data-field="status" value="${escapeHtml(exit.status)}" placeholder="状态标签（可选）" maxlength="16" aria-label="状态标签" /></div>
      <div class="destinations">
        ${exit.destinations.map((destination, destinationIndex) => `<div class="destination-row" data-destination="${destinationIndex}"><input data-field="cn" value="${escapeHtml(destination.cn)}" placeholder="中文目的地" aria-label="中文目的地" /><input data-field="en" value="${escapeHtml(destination.en)}" placeholder="English destination" aria-label="英文目的地" /><button type="button" class="remove-destination" title="删除目的地" aria-label="删除目的地">×</button></div>`).join("")}
        ${iconPickerMarkup(exit)}
        <button type="button" class="add-destination"><span>＋</span> 添加目的地</button>
      </div>
    </div>`).join("");
}

function renderPreview() {
  const hasIcons = state.exits.some((exit) => getExitIcons(exit).length);
  signPreview.className = `sign-preview align-${state.align}${hasIcons ? " has-icons" : ""}`;
  signPreview.style.setProperty("--title-size", `${state.titleSize}px`);
  signPreview.style.setProperty("--destination-size", `${state.destinationSize}px`);
  signPreview.innerHTML = `
    <div class="sign-header" aria-label="${escapeHtml(state.station)}">${stationTitleMarkup(state.station)}</div>
    <div class="sign-arrow ${state.arrow}">${arrowSvg()}</div>
    ${state.exits.map((exit) => `
      <section class="exit-block">
        <div class="exit-layout">
          <span class="exit-number" aria-label="${escapeHtml(exit.number)}">${exitNumberMarkup(exit.number)}</span>
          <div class="exit-info">
            <div class="exit-wordline"><span class="exit-word">出口</span><span class="exit-english">Exit</span></div>
          </div>
        </div>
        <div class="exit-details">
          ${exit.status ? `<span class="status-tag">${escapeHtml(exit.status)}</span>` : ""}
          ${exit.destinations.map((destination) => `<div class="destination"><div class="destination-copy"><div class="destination-cn">${escapeHtml(destination.cn)}</div><div class="destination-en">${escapeHtml(destination.en)}</div></div></div>`).join("")}
          ${getExitIcons(exit).length ? `<div class="exit-service-icons ${exit.iconAlign === "right" ? "icon-right" : "icon-left"}">${getExitIcons(exit).map((icon) => `<span class="exit-service-icon">${iconSvg(icon)}</span>`).join("")}</div>` : ""}
        </div>
      </section>`).join("")}
  `;
  fitDestinationText();
  resizeSignPreview();
  $("#previewStatus").textContent = "已同步";
}

function fitExitTitles() {
  document.querySelectorAll(".exit-title").forEach((title) => {
    const number = title.querySelector(".exit-number");
    const info = title.querySelector(".exit-info");
    if (!number || !info) return;
    number.style.fontSize = "";
    let size = parseFloat(getComputedStyle(number).fontSize);
    const minimum = 28;
    const gap = parseFloat(getComputedStyle(title).columnGap) || 0;
    const available = title.clientWidth;
    while (number.getBoundingClientRect().width + info.getBoundingClientRect().width + gap > available + 1 && size > minimum) {
      size -= 1;
      number.style.fontSize = `${size}px`;
    }
  });
}

function resizeSignPreview() {
  const stage = document.querySelector(".sign-stage");
  const longestTitle = Math.max(1, String(state.station || "").length);
  const longestExit = Math.max(1, ...state.exits.map((exit) => String(exit.number || "").length));
  const longestDestination = Math.max(1, ...state.exits.flatMap((exit) => exit.destinations.map((item) => Math.max(String(item.cn || "").length, String(item.en || "").length / 1.6))));
  const autoWidth = Math.max(320, 296 + Math.max(0, longestTitle - 3) * 34 + Math.max(0, longestExit - 1) * 30 + Math.max(0, longestDestination - 9) * 2 + Math.max(0, state.titleSize - 170) * 1.15);
  const targetWidth = state.widthMode === "fixed" ? state.fixedWidth : Math.min(1500, autoWidth);
  signPreview.style.setProperty("--sign-width", `${targetWidth}px`);
  signPreview.style.width = `${targetWidth}px`;
  // Keep the top number and arrow at their fixed design sizes while allowing
  // the sign body to grow naturally as exits, destinations, and icons are added.
  signPreview.style.aspectRatio = "auto";
  signPreview.style.height = "auto";
  const baseHeight = targetWidth * 785 / 360;
  const contentHeight = signPreview.scrollHeight;
  signPreview.style.height = `${Math.max(baseHeight, contentHeight)}px`;
  const availableWidth = Math.max(250, stage?.clientWidth || targetWidth);
  const scale = Math.min(1, availableWidth / targetWidth);
  signPreview.style.setProperty("--sign-scale", scale.toFixed(4));
  if (stage) stage.style.height = `${signPreview.offsetHeight * scale + 28}px`;
}

function fitDestinationText() {
  document.querySelectorAll(".destination-cn, .destination-en").forEach((element) => {
    element.style.fontSize = "";
    const minimum = element.classList.contains("destination-cn") ? 13 : 10;
    let size = parseFloat(getComputedStyle(element).fontSize);
    while (element.scrollWidth > element.clientWidth + 1 && size > minimum) {
      size -= 0.5;
      element.style.fontSize = `${size}px`;
    }
  });
}

function renderAll() { renderEditor(); renderPreview(); }

function updateStateFromInput(input) {
  const card = input.closest(".exit-card");
  if (!card) return;
  const exitIndex = Number(card.dataset.exit);
  const destinationRow = input.closest(".destination-row");
  const field = input.dataset.field;
  if (destinationRow) {
    const destinationIndex = Number(destinationRow.dataset.destination);
    state.exits[exitIndex].destinations[destinationIndex][field] = input.value;
  } else {
    state.exits[exitIndex][field] = input.value;
  }
  renderPreview();
}

$("#stationInput").addEventListener("input", (event) => { state.station = event.target.value; renderPreview(); });

function weightLabel(value, min, max) {
  const ratio = (Number(value) - min) / (max - min);
  if (ratio < .34) return "细";
  if (ratio > .66) return "粗";
  return "标准";
}

$("#titleSizeRange").addEventListener("input", (event) => {
  state.titleSize = Math.max(170, Number(event.target.value));
  $("#titleSizeValue").textContent = `${state.titleSize}px`;
  renderPreview();
});

$("#destinationSizeRange").addEventListener("input", (event) => {
  state.destinationSize = Number(event.target.value);
  $("#destinationSizeValue").textContent = `${state.destinationSize}px`;
  renderPreview();
});

$("#arrowControl").addEventListener("click", (event) => {
  const button = event.target.closest("[data-arrow]");
  if (!button) return;
  state.arrow = button.dataset.arrow;
  document.querySelectorAll("#arrowControl .segment").forEach((item) => item.classList.toggle("active", item === button));
  renderPreview();
});

$("#alignControl").addEventListener("click", (event) => {
  const button = event.target.closest("[data-align]");
  if (!button) return;
  state.align = button.dataset.align;
  document.querySelectorAll("#alignControl .segment").forEach((item) => item.classList.toggle("active", item === button));
  renderPreview();
});

$("#widthModeControl").addEventListener("click", (event) => {
  const button = event.target.closest("[data-width-mode]");
  if (!button) return;
  state.widthMode = button.dataset.widthMode;
  document.querySelectorAll("#widthModeControl .segment").forEach((item) => item.classList.toggle("active", item === button));
  $(".fixed-width-field").hidden = state.widthMode !== "fixed";
  renderPreview();
});

$("#fixedWidthRange").addEventListener("input", (event) => {
  state.fixedWidth = Number(event.target.value);
  $("#fixedWidthValue").textContent = `${state.fixedWidth} px`;
  renderPreview();
});

$("#exitEditor").addEventListener("input", (event) => {
  if (event.target.matches("input[data-field]")) updateStateFromInput(event.target);
});

$("#exitEditor").addEventListener("click", (event) => {
  const card = event.target.closest(".exit-card");
  if (!card) return;
  const exitIndex = Number(card.dataset.exit);
  const destinationRow = event.target.closest(".destination-row");
  const destinationTools = event.target.closest(".destination-tools");
  if (destinationTools && event.target.closest("[data-icon]")) {
    const iconId = event.target.closest("[data-icon]").dataset.icon || "";
    if (!iconId) state.exits[exitIndex].icons = [];
    else {
      const icons = getExitIcons(state.exits[exitIndex]);
      state.exits[exitIndex].icons = icons.includes(iconId) ? icons.filter((id) => id !== iconId) : icons.length < 10 ? [...icons, iconId] : icons;
    }
    renderAll();
  } else if (destinationTools && event.target.closest("[data-icon-align]")) {
    state.exits[exitIndex].iconAlign = event.target.closest("[data-icon-align]").dataset.iconAlign;
    renderAll();
  } else if (event.target.closest(".add-destination")) {
    state.exits[exitIndex].destinations.push({ cn: "", en: "" });
    renderAll();
  } else if (event.target.closest(".remove-destination")) {
    const row = event.target.closest(".destination-row");
    state.exits[exitIndex].destinations.splice(Number(row.dataset.destination), 1);
    renderAll();
  } else if (event.target.closest(".delete")) {
    state.exits.splice(exitIndex, 1);
    renderAll();
  } else if (event.target.closest(".move-up") && exitIndex > 0) {
    [state.exits[exitIndex - 1], state.exits[exitIndex]] = [state.exits[exitIndex], state.exits[exitIndex - 1]];
    renderAll();
  } else if (event.target.closest(".move-down") && exitIndex < state.exits.length - 1) {
    [state.exits[exitIndex + 1], state.exits[exitIndex]] = [state.exits[exitIndex], state.exits[exitIndex + 1]];
    renderAll();
  }
});

$("#addExitBtn").addEventListener("click", () => {
  const nextNumber = String(state.exits.length + 1);
  state.exits.push({ number: nextNumber, status: "", icons: [], iconAlign: "left", destinations: [{ cn: "", en: "" }] });
  renderAll();
  const cards = document.querySelectorAll(".exit-card");
  cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

$("#resetBtn").addEventListener("click", () => {
  state = structuredClone(initialState);
  $("#stationInput").value = state.station;
  $("#titleSizeRange").value = state.titleSize;
  $("#destinationSizeRange").value = state.destinationSize;
  $("#fixedWidthRange").value = state.fixedWidth;
  $("#fixedWidthValue").textContent = `${state.fixedWidth} px`;
  $("#titleSizeValue").textContent = `${state.titleSize}px`;
  $("#destinationSizeValue").textContent = `${state.destinationSize}px`;
  document.querySelectorAll("#arrowControl .segment").forEach((item) => item.classList.toggle("active", item.dataset.arrow === state.arrow));
  document.querySelectorAll("#alignControl .segment").forEach((item) => item.classList.toggle("active", item.dataset.align === state.align));
  document.querySelectorAll("#widthModeControl .segment").forEach((item) => item.classList.toggle("active", item.dataset.widthMode === state.widthMode));
  $(".fixed-width-field").hidden = state.widthMode !== "fixed";
  renderAll();
});

function svgText(x, y, text, size, weight = 500, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="Microsoft YaHei, Noto Sans SC, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="#14130d">${escapeHtml(text)}</text>`;
}

function svgHeaderText(x, y, text, size) {
  let cursor = x;
  const parts = [];
  Array.from(String(text ?? "")).forEach((character) => {
    if (character === "/") {
      parts.push(`<text x="${cursor}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size * 1.06}" font-weight="400" text-anchor="start" fill="#14130d">/</text>`);
      cursor += size * 0.24;
    } else {
      parts.push(`<text x="${cursor}" y="${y}" font-family="'Frutiger 55 Roman', Frutiger, Arial, sans-serif" font-size="${size}" font-weight="400" text-anchor="start" fill="#14130d">${escapeHtml(character)}</text>`);
      cursor += size * 0.57;
    }
  });
  return `<g>${parts.join("")}</g>`;
}

function svgNumberText(x, y, text, size, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="'Frutiger 55 Roman', Frutiger, Arial, sans-serif" font-size="${size}" font-weight="400" text-anchor="${anchor}" fill="#14130d">${escapeHtml(text)}</text>`;
}

function svgExitNumberText(x, y, text, size) {
  let cursor = x;
  const parts = [];
  Array.from(String(text ?? "")).forEach((character) => {
    if (character === "/") {
      parts.push(`<text x="${cursor}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="400" text-anchor="start" fill="#14130d">/</text>`);
      cursor += size * 0.24 + size * 0.11;
    } else {
      parts.push(`<text x="${cursor}" y="${y}" font-family="'Frutiger 55 Roman', Frutiger, Arial, sans-serif" font-size="${size}" font-weight="400" text-anchor="start" fill="#14130d">${escapeHtml(character)}</text>`);
      cursor += size * 0.57;
    }
  });
  return { markup: `<g>${parts.join("")}</g>`, width: Math.max(0, cursor - x) };
}

function svgEnglishText(x, y, text, size, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="400" text-anchor="${anchor}" fill="#14130d">${escapeHtml(text)}</text>`;
}

function svgIconExport(id, x, y, size) {
  const icon = serviceIcons.find((item) => item.id === id);
  if (!icon) return "";
  const body = icon.body.replaceAll('fill="black"', 'fill="#14130d"');
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${icon.vb}" aria-hidden="true">${body}</svg>`;
}

function canvasText(ctx, x, y, text, size, family, weight = 400, align = "left", color = "#14130d") {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.fillText(String(text ?? ""), x, y);
}

function drawCanvasNumber(ctx, x, y, text, size) {
  let cursor = x;
  Array.from(String(text ?? "")).forEach((character) => {
    if (character === "/") {
      canvasText(ctx, cursor, y, character, size, "Helvetica, Arial, sans-serif");
      cursor += size * .35;
    } else {
      canvasText(ctx, cursor, y, character, size, "'Frutiger 55 Roman', Frutiger, Arial, sans-serif");
      cursor += size * .57;
    }
  });
}

function measureCanvasNumber(ctx, text, size) {
  let width = 0;
  Array.from(String(text ?? "")).forEach((character) => {
    if (character === "/") {
      ctx.font = `400 ${size}px Helvetica, Arial, sans-serif`;
      width += size * .35;
    } else {
      ctx.font = `400 ${size}px "Frutiger 55 Roman", Frutiger, Arial, sans-serif`;
      width += Math.max(ctx.measureText(character).width, size * .48);
    }
  });
  return width;
}

function drawCanvasHeader(ctx, x, y, text, size) {
  let cursor = x;
  Array.from(String(text ?? "")).forEach((character) => {
    if (character === "/") {
      canvasText(ctx, cursor, y, character, size * 1.06, "Helvetica, Arial, sans-serif");
      cursor += size * .24;
    } else {
      canvasText(ctx, cursor, y, character, size, "'Frutiger 55 Roman', Frutiger, Arial, sans-serif", 400);
      cursor += size * .57;
    }
  });
}

function loadIconImage(id) {
  const icon = serviceIcons.find((item) => item.id === id);
  if (!icon) return Promise.resolve(null);
  const body = icon.body.replaceAll('fill="black"', 'fill="#14130d"');
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.vb}">${body}</svg>`)}`;
  return new Promise((resolve) => { image.onload = () => resolve(image); image.onerror = () => resolve(null); });
}

async function buildExportCanvas() {
  if (document.fonts?.ready) await document.fonts.ready;
  await Promise.all([
    document.fonts?.load?.('400 40px "Microsoft YaHei"'),
    document.fonts?.load?.('400 82px "Frutiger 55 Roman"'),
    document.fonts?.load?.('400 40px Helvetica')
  ].filter(Boolean));
  const longestExit = Math.max(1, ...state.exits.map((exit) => String(exit.number || "").length));
  const longestTitle = Math.max(1, String(state.station || "").length);
  const longestDestination = Math.max(1, ...state.exits.flatMap((exit) => exit.destinations.map((item) => Math.max(String(item.cn || "").length, String(item.en || "").length / 1.6))));
  const autoWidth = Math.max(720, 640 + Math.max(0, longestTitle - 3) * 34 + Math.max(0, longestExit - 1) * 42 + Math.max(0, longestDestination - 9) * 3 + Math.max(0, state.titleSize - 170) * 2.3);
  const outputWidth = state.widthMode === "fixed"
    ? state.fixedWidth * 2
    : Math.min(1500 * 2, Math.max(720, autoWidth * 2));
  const baseWidth = 720;
  // outputWidth includes the 2x export density; designScale only describes
  // the physical sign size relative to the 720px base layout.
  const raster = 2;
  const designScale = outputWidth / (baseWidth * raster);
  const pad = 56;
  let y = 210;
  const rows = Math.max(0, ...state.exits.map((exit) => Math.ceil(getExitIcons(exit).length / 2)));
  const baseHeight = Math.max(980, y + 158 + 285 + state.exits.reduce((total, exit) => total + 79 + (exit.status ? 61 : 0) + exit.destinations.filter((d) => d.cn || d.en).length * 72 + (getExitIcons(exit).length ? Math.ceil(getExitIcons(exit).length / 2) * 76 + 10 : 0) + 27, 0) + 50);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth; canvas.height = baseHeight * designScale * raster;
  const ctx = canvas.getContext("2d");
  ctx.scale(raster * designScale, raster * designScale);
  ctx.fillStyle = "#f6d600"; ctx.fillRect(0, 0, baseWidth, baseHeight);
  drawCanvasHeader(ctx, pad, y, state.station, state.titleSize);
  y += Math.max(158, state.titleSize * .93);
  ctx.save(); ctx.translate(pad, y - 18); ctx.scale(2.55, 2.55); ctx.fillStyle = "#14130d"; ctx.fill(new Path2D(arrowPaths[state.arrow])); ctx.restore();
  y += 285;
  for (const [index, exit] of state.exits.entries()) {
    if (index > 0) { ctx.strokeStyle = "#14130d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, y - 27); ctx.lineTo(baseWidth - pad, y - 27); ctx.stroke(); }
    const numberSize = 82;
    const numberWidth = Math.max(82, measureCanvasNumber(ctx, exit.number, numberSize));
    drawCanvasNumber(ctx, pad, y + 43, exit.number, numberSize);
    const infoX = pad + numberWidth + 4;
    canvasText(ctx, infoX, y + 27, "出口", 39, "Microsoft YaHei, Noto Sans SC, sans-serif");
    canvasText(ctx, infoX, y + 56, "Exit", 24, "Helvetica, Arial, sans-serif");
    y += 79;
    const detailX = pad + 20;
    if (exit.status) { ctx.fillStyle = "#17150e"; ctx.fillRect(detailX, y - 2, 145, 39); canvasText(ctx, detailX + 72, y + 25, exit.status, 22, "Microsoft YaHei, Noto Sans SC, sans-serif", 400, "center", "#d4b800"); y += 61; }
    for (const destination of exit.destinations) {
      if (destination.cn || destination.en) { canvasText(ctx, detailX, y + 3, destination.cn, state.destinationSize, "Microsoft YaHei, Noto Sans SC, sans-serif"); y += state.destinationSize + 4; canvasText(ctx, detailX, y, destination.en, state.destinationSize * .6, "Helvetica, Arial, sans-serif"); y += state.destinationSize * 1.27; }
    }
    const icons = getExitIcons(exit);
    if (icons.length) {
      const iconSize = 58;
      const startX = exit.iconAlign === "right" ? baseWidth - pad - iconSize * 2 - 8 : detailX;
      const loaded = await Promise.all(icons.map(loadIconImage));
      loaded.forEach((image, iconIndex) => { if (image) ctx.drawImage(image, startX + (iconIndex % 2) * (iconSize + 8), y - 2 + Math.floor(iconIndex / 2) * (iconSize + 8), iconSize, iconSize); });
      y += Math.ceil(icons.length / 2) * 76 + 10;
    }
    y += 27;
  }
  return canvas;
}

function inlineComputedStyles(source, target) {
  const computed = getComputedStyle(source);
  const declarations = [];
  for (const property of computed) declarations.push(`${property}:${computed.getPropertyValue(property)};`);
  target.setAttribute("style", declarations.join(""));
  Array.from(source.children).forEach((child, index) => {
    const clonedChild = target.children[index];
    if (clonedChild) inlineComputedStyles(child, clonedChild);
  });
}

let embeddedFontCssPromise;
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function loadFontResource(url) {
  if (typeof fetch === "function") {
    return fetch(url, { cache: "force-cache" }).then((response) => {
      if (!response.ok) throw new Error(`字体资源加载失败: ${response.status}`);
      return response.arrayBuffer();
    });
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "arraybuffer";
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve(request.response) : reject(new Error(`字体资源加载失败: ${request.status}`));
    request.onerror = () => reject(new Error("字体资源网络错误"));
    request.send();
  });
}

async function getEmbeddedFontCss() {
  if (!embeddedFontCssPromise) {
    embeddedFontCssPromise = (async () => {
      const fonts = [
        { family: "Frutiger 55 Roman", file: "frutiger-55-roman.woff", mime: "font/woff", format: "woff" },
        { family: "Microsoft YaHei", file: "microsoft-yahei.ttc", mime: "font/ttc", format: "truetype-collection" }
      ];
      const rules = [];
      for (const font of fonts) {
        try {
          const data = arrayBufferToBase64(await loadFontResource(font.file));
          rules.push("@font-face{font-family:\"" + font.family + "\";font-style:normal;font-weight:400;src:url(data:" + font.mime + ";base64," + data + ") format(\"" + font.format + "\");}");
        } catch (error) {
          console.warn("字体嵌入失败: " + font.family, error);
        }
      }
      return rules.join("");
    })();
  }
  return embeddedFontCssPromise;
}

async function buildPreviewExportCanvas() {
  if (document.fonts?.ready) await document.fonts.ready;
  const embeddedFontCss = await getEmbeddedFontCss();
  await Promise.all([
    document.fonts?.load?.('400 120px "Frutiger 55 Roman"'),
    document.fonts?.load?.('400 40px "Microsoft YaHei"')
  ].filter(Boolean));
  const source = document.querySelector("#signPreview");
  if (!source) return buildExportCanvas();

  const width = source.offsetWidth;
  const height = source.offsetHeight;
  const clone = source.cloneNode(true);
  inlineComputedStyles(source, clone);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.transform = "none";
  clone.style.transition = "none";
  clone.style.boxShadow = "none";
  clone.style.margin = "0";

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + width + "\" height=\"" + height + "\"><foreignObject x=\"0\" y=\"0\" width=\"" + width + "\" height=\"" + height + "\"><div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"width:" + width + "px;height:" + height + "px;overflow:hidden\"><style>" + embeddedFontCss + "</style>" + serialized + "</div></foreignObject></svg>";
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("preview render failed")); image.src = url; });
    const raster = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * raster;
    canvas.height = height * raster;
    const ctx = canvas.getContext("2d");
    ctx.scale(raster, raster);
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function buildPreviewCoordinateCanvas() {
  const source = document.querySelector("#signPreview");
  if (!source) throw new Error("preview missing");
  if (document.fonts?.ready) await document.fonts.ready;
  const previousTransform = source.style.transform;
  const previousTransition = source.style.transition;
  source.style.transform = "none";
  source.style.transition = "none";
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const root = source.getBoundingClientRect();
  const width = source.offsetWidth;
  const height = source.offsetHeight;
  const raster = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * raster;
  canvas.height = height * raster;
  const ctx = canvas.getContext("2d");
  ctx.scale(raster, raster);
  ctx.fillStyle = getComputedStyle(source).backgroundColor || "#f6d600";
  ctx.fillRect(0, 0, width, height);
  const textNodes = source.querySelectorAll(".station-glyph, .station-slash, .exit-number-glyph, .exit-number-slash, .exit-word, .exit-english, .destination-cn, .destination-en");
  textNodes.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const size = parseFloat(style.fontSize) || 16;
    const line = style.lineHeight === "normal" ? size * 1.2 : parseFloat(style.lineHeight) || size;
    const align = style.textAlign === "right" ? "right" : style.textAlign === "center" ? "center" : "left";
    const x = align === "right" ? rect.right - root.left : align === "center" ? (rect.left + rect.right) / 2 - root.left : rect.left - root.left;
    const y = rect.top - root.top + (rect.height - line) / 2 + line * .82;
    ctx.font = style.fontStyle + " " + style.fontWeight + " " + size + "px " + style.fontFamily;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = style.color;
    ctx.fillText(element.textContent || "", x, y);
  });
  source.querySelectorAll(".status-tag").forEach((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const size = parseFloat(style.fontSize) || 16;
    const line = parseFloat(style.lineHeight) || size;
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(rect.left - root.left, rect.top - root.top, rect.width, rect.height);
    ctx.font = style.fontStyle + " " + style.fontWeight + " " + size + "px " + style.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = style.color;
    ctx.fillText(element.textContent || "", rect.left - root.left + rect.width / 2, rect.top - root.top + rect.height / 2 + line * .03);
  });
  source.querySelectorAll(".exit-block").forEach((block, index) => {
    if (!index) return;
    const rect = block.getBoundingClientRect();
    const style = getComputedStyle(block);
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = parseFloat(style.borderTopWidth) || 1;
    ctx.beginPath();
    ctx.moveTo(rect.left - root.left, rect.top - root.top);
    ctx.lineTo(rect.right - root.left, rect.top - root.top);
    ctx.stroke();
  });
  await Promise.all(Array.from(source.querySelectorAll(".sign-arrow svg, .exit-service-icon svg")).map((element) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const rect = element.getBoundingClientRect();
      ctx.drawImage(image, rect.left - root.left, rect.top - root.top, rect.width, rect.height);
      resolve();
    };
    image.onerror = resolve;
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(element));
  })));
  source.style.transform = previousTransform;
  source.style.transition = previousTransition;
  return canvas;
}

$("#downloadBtn").addEventListener("click", async () => {
  const downloadBtn = $("#downloadBtn");
  const exportStatus = $("#exportStatus");
  const exportProgress = $("#exportProgress");
  const exportProgressValue = $("#exportProgressValue");
  const downloadLabel = $("#downloadLabel");
  const setExportProgress = (value) => {
    exportProgress.value = value;
    exportProgressValue.textContent = `${value}%`;
  };
  downloadBtn.disabled = true;
  downloadLabel.textContent = "正在导出中";
  setExportProgress(8);
  exportStatus.hidden = false;
  let dataUrl;
  try {
    try {
      const previewCanvas = await buildPreviewCoordinateCanvas();
      dataUrl = previewCanvas.toDataURL("image/png");
      setExportProgress(78);
    } catch (error) {
      console.warn("预览字体渲染失败，尝试兼容导出模式", error);
    }
    if (!dataUrl && window.htmlToImage?.toPng) {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
        const embeddedFontCss = await getEmbeddedFontCss();
        setExportProgress(35);
        dataUrl = await window.htmlToImage.toPng(document.querySelector("#signPreview"), {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#f6d600",
          fontEmbedCSS: embeddedFontCss,
          style: { transform: "none", boxShadow: "none", margin: "0" }
        });
        setExportProgress(78);
      } catch (error) {
        console.warn("预览 DOM 导出失败，使用兼容导出模式", error);
      }
    }
    if (!dataUrl) {
      let canvas;
      try { canvas = await buildPreviewExportCanvas(); }
      catch (error) { console.warn("预览 SVG 导出失败，使用兼容导出模式", error); canvas = await buildExportCanvas(); }
      dataUrl = canvas.toDataURL("image/png");
      setExportProgress(78);
    }
    const link = document.createElement("a");
    link.download = `chongqing-exit-sign-${state.station || "custom"}.png`;
    link.href = dataUrl;
    setExportProgress(94);
    link.click();
    setExportProgress(100);
  } finally {
    window.setTimeout(() => { exportStatus.hidden = true; setExportProgress(0); downloadBtn.disabled = false; downloadLabel.textContent = "导出 PNG"; }, 700);
  }
});

$("#stationInput").value = state.station;
renderAll();
