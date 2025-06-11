// Main gallery loading and rendering
let allPaintings = []; // Store original data

function renderPaintings(paintings) {
  const gallery = document.querySelector(".gallery-wall");
  if (!gallery) {
    console.error("Gallery element not found");
    return;
  }
  
  gallery.innerHTML = ''; // Clear existing
  
  // Show/hide no results message
  const noResults = document.getElementById('no-results-message');
  if (paintings.length === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
  
  paintings.forEach(painting => {
    const container = document.createElement("div");
    container.className = "painting-container";
    container.setAttribute("data-amId", painting.id);
    if (painting.frame) {
      container.setAttribute("data-frame", painting.frame);
    }

    const frameStyle = painting.frame ? `style="background-image: url('${painting.frame}')"` : "";

    let infoHTML = `
      <strong>Title:</strong> ${painting.title || "Untitled"} <br>
      <strong>Medium:</strong> ${painting.medium || "—"} <br>
      <strong>Canvas:</strong> ${painting.canvas || "—"} <br>
      <strong>Year:</strong> ${painting.year || "—"} <br>`;

    const createLink = (item) => {
      if (typeof item === 'object' && item.link) {
        return `<a href="${item.link}" target="_blank">${item.text || 'Link'}</a>`;
      }
      return item || '';
    };

    if (painting.original) {
      infoHTML += `<strong>Original:</strong> ${createLink(painting.original)} <br>`;
    }
    if (painting.funFact) {
      infoHTML += `<strong>Fun-fact:</strong> ${painting.funFact} <br>`;
    }
    if (painting.book) {
      infoHTML += `<strong>Book:</strong> ${createLink(painting.book)} <br>`;
    }
    if (painting.kdrama) {
      infoHTML += `<strong>K-drama:</strong> ${createLink(painting.kdrama)} <br>`;
    }
    if (painting.movie) {
      infoHTML += `<strong>Movie:</strong> ${createLink(painting.movie)} <br>`;
    }
    if (painting.show) {
      infoHTML += `<strong>Show:</strong> ${createLink(painting.show)} <br>`;
    }
    if (painting.song) {
      infoHTML += `<strong>Song:</strong> ${createLink(painting.song)} <br>`;
    }
    if (painting.quote) {
      infoHTML += `<strong>Quote:</strong> <em>${painting.quote}</em> <br>`;
    }
    if (painting.youtube) {
      infoHTML += `<strong>Video:</strong> ${createLink(painting.youtube)} <br>`;
    }
    if (painting.blog) {
      infoHTML += `<strong>Blog:</strong> ${createLink(painting.blog)} <br>`;
    }

    container.innerHTML = `
    <div class="painting-with-info">
      <div class="frame-wrapper" ${frameStyle}>
        <img src="${painting.image}" alt="${painting.title || 'Artwork'}" class="painting" loading="lazy" />
      </div>
      <div class="info">
        ${infoHTML}
      </div>
    </div>
  `;

    gallery.appendChild(container);
  });

  initializeFrames();
  setupInfoPanels();
  
  imagesLoaded(gallery, () => {
    if (window.pckry) {
      window.pckry.destroy();
    }
    window.pckry = new Packery(gallery, {
      itemSelector: ".painting-container",
      gutter: 10,
      percentPosition: true
    });
    console.log("✅ Packery layout updated");
    
    // Setup lightbox after paintings are rendered
    setupLightbox();
  });
}

// Initial load
fetch("gallery.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    allPaintings = data;
    renderPaintings(data);
    
    // Search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const term = document.getElementById('search').value.toLowerCase();
        const filtered = allPaintings.filter(painting => {
          const searchString = [
            painting.id,
            painting.title || '',
            painting.medium || '',
            painting.canvas || '',
            painting.year || '',
            painting.funFact || '',
            painting.original?.text || ''
          ].join(' ').toLowerCase();
          return searchString.includes(term);
        });
        renderPaintings(filtered);
      });
    }
    
    // Reset button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        document.getElementById('search').value = '';
        renderPaintings(allPaintings);
      });
    }
  })
  .catch(err => console.error("Failed to load paintings:", err));

// Frame initialization
function initializeFrames() {
  const containers = document.querySelectorAll(".painting-container");
  containers.forEach(container => {
    const frameWrapper = container.querySelector('.frame-wrapper');
    const frameFile = container.getAttribute("data-frame");

    if (frameFile && frameWrapper) {
      frameWrapper.style.backgroundImage = `url('frames/${frameFile}')`;
    }
  });
}

function setupInfoPanels() {
  const containers = document.querySelectorAll('.painting-container');

  function adjustInfoPosition() {
    containers.forEach(container => {
      const info = container.querySelector('.info');
      if (!info) return;

      // Reset classes first
      info.classList.remove('info-left', 'info-right');
      
      const containerRect = container.getBoundingClientRect();
      const rightSpace = window.innerWidth - containerRect.right;
      const leftSpace = containerRect.left;

      // Check if info panel would overflow on right
      const infoWidth = 250; // Same as CSS width
      const requiredSpace = infoWidth + 40; // Additional margin

      if (rightSpace < requiredSpace && leftSpace > requiredSpace) {
        info.classList.add('info-left');
      } else {
        info.classList.add('info-right');
      }
    });
  }

  // Initial positioning
  adjustInfoPosition();
  
  // Event listeners
  window.addEventListener('resize', adjustInfoPosition);
  window.addEventListener('scroll', adjustInfoPosition);
  if (window.pckry) {
    window.pckry.on('layoutComplete', adjustInfoPosition);
  }
}

function setupDarkMode() {
  // Check local storage for saved preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
      toggle.textContent = "☀️ Light Mode";
    }
  }

  // Set up toggle button
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
      
      // Save preference to local storage
      localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    });
  }
}

let currentLightboxIndex = 0;
let lightboxPaintings = [];

function setupLightbox() {
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  const paintings = document.querySelectorAll('.painting');

  // Verify elements exist
  if (!lightbox || !lightboxImg || !closeBtn || !prevBtn || !nextBtn) {
    console.error("Lightbox elements not found");
    return;
  }

  // Open lightbox
  paintings.forEach((painting, index) => {
    painting.addEventListener('click', (e) => {
      // Prevent triggering if clicking on a link in the info panel
      if (e.target.tagName === 'A') return;
      
      currentLightboxIndex = index;
      lightboxPaintings = Array.from(paintings);
      updateLightboxImage();
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  // Navigation
  function updateLightboxImage() {
    if (lightboxPaintings.length === 0) return;
    const painting = lightboxPaintings[currentLightboxIndex];
    lightboxImg.src = painting.src;
    lightboxImg.alt = painting.alt || "Artwork";
  }

  // Navigation handlers
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxPaintings.length) % lightboxPaintings.length;
    updateLightboxImage();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxPaintings.length;
    updateLightboxImage();
  });

  // Close handlers
  closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
      switch(e.key) {
        case 'Escape':
          lightbox.style.display = 'none';
          document.body.style.overflow = 'auto';
          break;
        case 'ArrowLeft':
          currentLightboxIndex = (currentLightboxIndex - 1 + lightboxPaintings.length) % lightboxPaintings.length;
          updateLightboxImage();
          break;
        case 'ArrowRight':
          currentLightboxIndex = (currentLightboxIndex + 1) % lightboxPaintings.length;
          updateLightboxImage();
          break;
      }
    }
  });
}

function setupBottomTrims() {
  const bottomTrims = document.querySelector('.footer-trims');
  const gallery = document.querySelector('.gallery-wall');
  
  if (!bottomTrims || !gallery) {
    console.error("Bottom trims or gallery not found");
    return;
  }
  
  function checkScroll() {
    const galleryBottom = gallery.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;
    
    // Show trims when gallery is at the bottom
    if (galleryBottom <= windowHeight + 100) {
      bottomTrims.style.opacity = '1';
    } else {
      bottomTrims.style.opacity = '0';
    }
  }
  
  // Initial check
  checkScroll();
  
  // Add scroll event listener with debounce
  let isScrolling;
  window.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(checkScroll, 50);
  }, false);
}

// Add this to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  setupDarkMode();
  setupBottomTrims();
  // Don't call setupLightbox here - it will be called after paintings render
});