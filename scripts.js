// Global state
let allPublications = [];
let showingSelected = true;

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadPublications();

  // Stagger section animations (optional)
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.08}s`;
  });

  const toggleButton = document.getElementById('toggle-publications');
  if (toggleButton) toggleButton.addEventListener('click', togglePublications);
});

// Load publications
function loadPublications() {
  fetch('publications.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      // Support either { publications: [...] } or [...]
      const pubs = Array.isArray(data) ? data : data.publications;
      if (!Array.isArray(pubs)) throw new Error('Invalid publications.json format');

      allPublications = pubs;
      renderPublications(true);

      // Ensure button/header are in sync with initial state
      updateToggleUI();
    })
    .catch((error) => {
      console.error('Error loading publications:', error);
      const container = document.getElementById('publications-container');
      if (container) container.textContent = `Error loading publications: ${error.message}`;
    });
}

// Toggle selected/all
function togglePublications() {
  showingSelected = !showingSelected;
  renderPublications(showingSelected);
  updateToggleUI();
}

function updateToggleUI() {
  const toggleButton = document.getElementById('toggle-publications');
  const toggleHeader = document.getElementById('toggle-header');

  if (toggleButton) toggleButton.textContent = showingSelected ? 'Show All' : 'Show Selected';
  if (toggleHeader) toggleHeader.textContent = showingSelected ? 'Selected Publications' : 'All Publications';
}

// Render list
function renderPublications(showSelectedOnly = true) {
  const pubContainer = document.getElementById('publications-container');
  const projContainer = document.getElementById('projects-container');

  if (pubContainer) pubContainer.innerHTML = '';
  if (projContainer) projContainer.innerHTML = '';

  const publications = allPublications.filter(p => p.type === 'publication');
  const projects = allPublications.filter(p => p.type === 'project');

  const pubsToShow = showSelectedOnly
    ? publications.filter(p => Number(p.selected) === 1 || p.selected === true)
    : publications;

  pubsToShow.forEach(pub => pubContainer.appendChild(createPublicationElement(pub)));
  projects.forEach(proj => projContainer.appendChild(createPublicationElement(proj)));
}


// Build a single publication card
function createPublicationElement(publication) {
  const pubItem = document.createElement('div');
  pubItem.className = 'publication-item';

  const content = document.createElement('div');
  content.className = 'pub-content';

  // Thumbnail
  const thumbnail = document.createElement('div');
  thumbnail.className = 'pub-thumbnail';

  const thumbSrc = publication.thumbnail || 'images/barath.JPG';

  const thumbImg = document.createElement('img');
  thumbImg.src = thumbSrc;
  thumbImg.alt = `${publication.title} thumbnail`;
  thumbImg.onerror = () => {
    thumbImg.src = 'images/barath.JPG';
  };

  thumbnail.appendChild(thumbImg);
  thumbnail.onclick = () => openModal(thumbImg.src);

  // Title
  const title = document.createElement('div');
  title.className = 'pub-title';
  title.textContent = publication.title || '';
  content.appendChild(title);

  // Authors (highlight Barath)
  const authors = document.createElement('div');
  authors.className = 'pub-authors';

  const authorList = Array.isArray(publication.authors) ? publication.authors : [];
  const authorsHTML = authorList
    .map((a) => {
      const lower = String(a).toLowerCase();
      if (lower.includes('barath velmurugan')) return `<span class="highlight-name">${a}</span>`;
      return a;
    })
    .join(', ');

  authors.innerHTML = authorsHTML;
  content.appendChild(authors);

  // Venue + award
  const venueContainer = document.createElement('div');
  venueContainer.className = 'pub-venue-container';

  const venue = document.createElement('div');
  venue.className = 'pub-venue';
  venue.textContent = publication.venue || '';
  venueContainer.appendChild(venue);

  if (publication.award && String(publication.award).trim().length > 0) {
    const award = document.createElement('div');
    award.className = 'pub-award';
    award.textContent = publication.award;
    venueContainer.appendChild(award);
  }

  content.appendChild(venueContainer);



  // Summary (your descriptions)
  if (publication.summary && String(publication.summary).trim().length > 0) {
    const summary = document.createElement('div');
    summary.className = 'pub-summary';
    summary.textContent = publication.summary;
    content.appendChild(summary);
  }

  // Links
  if (publication.links) {
    const links = document.createElement('div');
    links.className = 'pub-links';

    if (publication.links.pdf && publication.links.pdf !== '#') {
      const pdfLink = document.createElement('a');
      pdfLink.href = publication.links.pdf;
      pdfLink.textContent = '[PDF]';
      pdfLink.target = '_blank';
      pdfLink.rel = 'noopener noreferrer';
      links.appendChild(pdfLink);
    }

    if (publication.links.code && publication.links.code !== '#') {
      const codeLink = document.createElement('a');
      codeLink.href = publication.links.code;
      codeLink.textContent = '[Code]';
      codeLink.target = '_blank';
      codeLink.rel = 'noopener noreferrer';
      links.appendChild(codeLink);
    }

    if (publication.links.project && publication.links.project !== '#') {
      const projectLink = document.createElement('a');
      projectLink.href = publication.links.project;
      projectLink.textContent = '[Project Page]';
      projectLink.target = '_blank';
      projectLink.rel = 'noopener noreferrer';
      links.appendChild(projectLink);
    }

    content.appendChild(links);
  }

  pubItem.appendChild(thumbnail);
  pubItem.appendChild(content);

  return pubItem;
}

// Modal (image viewer)
function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  if (!modal || !modalImg) return;

  modal.style.display = 'block';
  setTimeout(() => modal.classList.add('show'), 10);
  modalImg.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (!modal) return;

  modal.classList.remove('show');
  setTimeout(() => (modal.style.display = 'none'), 300);
}

window.onclick = function (event) {
  const modal = document.getElementById('imageModal');
  if (modal && event.target === modal) closeModal();
};
