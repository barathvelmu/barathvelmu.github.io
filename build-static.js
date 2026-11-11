// Writes the Papers, Research Reports, and Projects cards into index.html as static HTML,
// using the same markup scripts.js produces at runtime, so scrapers that do not run
// JavaScript still see every entry. Run after editing publications.json:
//   node build-static.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('publications.json', 'utf8'));
const pubs = Array.isArray(data) ? data : data.publications;

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/ /g, '&nbsp;');
const link = (href, label) =>
  href && href !== '#' ? `<a href="${escAttr(href)}" target="_blank" rel="noopener noreferrer">${escText(label)}</a>` : '';
const nonEmpty = (v) => v && String(v).trim().length > 0;

function publicationCard(p) {
  const thumb = p.thumbnail || 'images/barath.JPG';
  let html = '<div class="publication-item">';
  html += `<div class="pub-thumbnail"><img src="${escAttr(thumb)}" alt="${escAttr(`${p.title} thumbnail`)}"></div>`;
  html += '<div class="pub-content">';
  html += `<div class="pub-title">${escText(p.title || '')}</div>`;
  const authors = (Array.isArray(p.authors) ? p.authors : [])
    .map((a) => (String(a).toLowerCase().includes('barath velmurugan') ? `<span class="highlight-name">${a}</span>` : a))
    .join(', ');
  html += `<div class="pub-authors">${authors}</div>`;
  html += `<div class="pub-venue-container"><div class="pub-venue">${escText(p.venue || '')}</div>`;
  if (nonEmpty(p.award)) html += `<div class="pub-award">${escText(p.award)}</div>`;
  html += '</div>';
  if (nonEmpty(p.summary)) html += `<div class="pub-summary">${escText(p.summary)}</div>`;
  if (p.links) {
    const links = [
      link(p.links.arxiv, 'arXiv'),
      link(p.links.pdf, 'PDF'),
      link(p.links.code, 'Code'),
      link(p.links.writeup, 'Writeup'),
      link(p.links.thread, 'Thread'),
      link(p.links.project, 'Project Page'),
    ].join('');
    if (links) html += `<div class="pub-links">${links}</div>`;
  }
  html += '</div></div>';
  return html;
}

function projectCard(p) {
  let html = '<div class="project-card">';
  if (nonEmpty(p.category)) html += `<span class="project-tag">${escText(p.category)}</span>`;
  html += `<div class="project-title">${escText(p.title || '')}</div>`;
  if (nonEmpty(p.summary)) html += `<p class="project-summary">${escText(p.summary)}</p>`;
  if (p.links) {
    const links = [
      link(p.links.code, 'Code'),
      link(p.links.paper, 'Paper'),
      link(p.links.writeup, 'Writeup'),
      link(p.links.thread, 'Thread'),
      link(p.links.demo, 'Demo'),
      link(p.links.models, 'Models'),
      link(p.links.project, 'Project'),
      link(p.links.pdf, p.links.pdfLabel || 'Writeup'),
    ].join('');
    if (links) html += `<div class="project-links">${links}</div>`;
  }
  html += '</div>';
  return html;
}

const isSelected = (p) => Number(p.selected) === 1 || p.selected === true;
const blocks = {
  'papers-container': pubs.filter((p) => p.type === 'paper').map(publicationCard),
  'publications-container': pubs.filter((p) => p.type === 'publication' && isSelected(p)).map(publicationCard),
  'projects-container': pubs.filter((p) => p.type === 'project').map(projectCard),
};

let html = fs.readFileSync('index.html', 'utf8');
for (const [id, cards] of Object.entries(blocks)) {
  const re = new RegExp(`(<div id="${id}">)[\\s\\S]*?(</div>\\s*</section>)`);
  if (!re.test(html)) throw new Error(`container #${id} not found in index.html`);
  html = html.replace(re, (m, open, close) => `${open}${cards.join("")}${close}`);
}
fs.writeFileSync('index.html', html);
console.log(Object.entries(blocks).map(([k, v]) => `${k}: ${v.length} cards`).join('\n'));
