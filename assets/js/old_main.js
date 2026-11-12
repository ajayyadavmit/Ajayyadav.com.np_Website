/* WITHOUT ACCESSIBILITY Feature. Edit the header and footer in /partials, not on every page. */
(() => {
  const loadPartial = async (selector, file) => {
    const target = document.querySelector(selector);
    if (!target) return;
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Could not load ${file}: ${response.status}`);
      target.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
      target.innerHTML = `<p class="partial-error">This shared section could not load. Please open the site through a web server or its deployed website.</p>`;
    }
  };

  const initialiseNavigation = () => {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.primary-navigation');
    if (menuButton && nav) {
      menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('is-open', !expanded);
      });
    }
    document.querySelectorAll('.dropdown-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        button.parentElement.classList.toggle('is-open', !expanded);
      });
    });
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === page) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
        const dropdown = link.closest('.nav-dropdown');
        if (dropdown) dropdown.querySelector('.dropdown-toggle')?.classList.add('is-active');
      }
    });
  };


  
  const initialiseCarousels = () => {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const previous = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!track || !previous || !next) return;
      const distance = () => {
        const card = track.querySelector('.carousel-card');
        return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0) : track.clientWidth;
      };
      previous.addEventListener('click', () => track.scrollBy({ left: -distance(), behavior: 'smooth' }));
      next.addEventListener('click', () => track.scrollBy({ left: distance(), behavior: 'smooth' }));
    });
  };

  const start = async () => {
    await Promise.all([loadPartial('#site-header', 'partials/header.html'), loadPartial('#site-footer', 'partials/footer.html')]);
    initialiseNavigation();
    initialiseCarousels();
    document.querySelectorAll('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());
  };
  document.addEventListener('DOMContentLoaded', start);
})();

// TABBED SCRIPT 


document.querySelectorAll(".profile-tabs").forEach(tabList => {

  const tabs = Array.from(
    tabList.querySelectorAll('[role="tab"]')
  );

  const activateTab = (selectedTab) => {

    tabs.forEach(tab => {
      const isActive = tab === selectedTab;

      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive);
      tab.tabIndex = isActive ? 0 : -1;

      const panel = document.getElementById(
        tab.getAttribute("aria-controls")
      );

      if (panel) {
        panel.hidden = !isActive;
      }
    });

  };

  tabs.forEach((tab, index) => {

    tab.addEventListener("click", () => {
      activateTab(tab);
    });

    tab.addEventListener("keydown", event => {

      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else {
        return;
      }

      event.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);

    });

  });

});