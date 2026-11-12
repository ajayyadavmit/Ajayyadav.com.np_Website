/* =====================================================
   ACCESSIBILITY TOOLS
   ===================================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "websiteAccessibility";

  const DEFAULT_SETTINGS = {
    scale: 1,
    dark: false,
    grayscale: false,
    contrast: false,
    negative: false,
    light: false,
    underline: false,
    readable: false
  };

  const CLASS_NAMES = {
    dark: "a11y-dark",
    grayscale: "a11y-grayscale",
    contrast: "a11y-contrast",
    negative: "a11y-negative",
    light: "a11y-light",
    underline: "a11y-underline",
    readable: "a11y-readable"
  };

  const COLOUR_MODES = [
    "dark",
    "contrast",
    "negative",
    "light"
  ];

  let settings = { ...DEFAULT_SETTINGS };
  let initialised = false;

  /* -----------------------------------------
     STORAGE
     ----------------------------------------- */

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn("Accessibility settings could not be saved.", error);
    }
  }

  function restoreSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object") return;

      const scale = Number(parsed.scale);

      settings.scale = Number.isFinite(scale)
        ? Math.min(1.5, Math.max(0.8, scale))
        : 1;

      Object.keys(CLASS_NAMES).forEach(key => {
        settings[key] = parsed[key] === true;
      });

      /* Keep colour modes mutually exclusive. */

      const activeModes = COLOUR_MODES.filter(
        key => settings[key]
      );

      if (activeModes.length > 1) {
        COLOUR_MODES.forEach(key => {
          settings[key] = false;
        });

        settings[activeModes[0]] = true;
      }

    } catch (error) {
      console.warn("Accessibility settings could not be restored.", error);
    }
  }

  /* -----------------------------------------
     APPLY SETTINGS
     ----------------------------------------- */

  function updateDisplay() {
    const root = document.documentElement;
    const body = document.body;

    root.style.setProperty(
      "--a11y-text-scale",
      settings.scale
    );

    Object.entries(CLASS_NAMES).forEach(([key, className]) => {
      body.classList.toggle(
        className,
        settings[key]
      );
    });

    document
      .querySelectorAll("#accessibility-widget [data-a11y-action]")
      .forEach(button => {
        const action = button.dataset.a11yAction;

        if (action in CLASS_NAMES) {
          button.setAttribute(
            "aria-pressed",
            String(settings[action])
          );
        }
      });
  }

  /* -----------------------------------------
     PANEL CONTROLS
     ----------------------------------------- */

  function initialiseWidget(widget) {
    if (initialised) return;

    const toggle = widget.querySelector("#accessibility-toggle");
    const panel = widget.querySelector("#accessibility-panel");
    const close = widget.querySelector("#accessibility-close");

    if (!toggle || !panel || !close) {
      console.error("Accessibility widget is missing required elements.");
      return;
    }

    initialised = true;

    function openPanel() {
      panel.hidden = false;

      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close accessibility tools");

      close.focus();
    }

    function closePanel(returnFocus = true) {
      panel.hidden = true;

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open accessibility tools");

      if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => {
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    close.addEventListener("click", () => {
      closePanel();
    });

    /* -----------------------------------------
       BUTTON ACTIONS
       ----------------------------------------- */

    widget.addEventListener("click", event => {
      const button = event.target.closest("[data-a11y-action]");

      if (!button) return;

      const action = button.dataset.a11yAction;

      switch (action) {

        case "increase":
          settings.scale = Math.min(
            1.5,
            Number((settings.scale + 0.1).toFixed(1))
          );
          break;

        case "decrease":
          settings.scale = Math.max(
            0.8,
            Number((settings.scale - 0.1).toFixed(1))
          );
          break;

        case "reset":
          settings = { ...DEFAULT_SETTINGS };
          break;

        case "dark":
        case "contrast":
        case "negative":
        case "light":
          COLOUR_MODES.forEach(mode => {
            settings[mode] = false;
          });

          settings[action] = true;
          break;

        case "grayscale":
        case "underline":
        case "readable":
          settings[action] = !settings[action];
          break;

        default:
          return;
      }

      updateDisplay();
      saveSettings();
    });

    /* -----------------------------------------
       KEYBOARD SUPPORT
       ----------------------------------------- */

    document.addEventListener("keydown", event => {
      if (panel.hidden) return;

      if (event.key === "Escape") {
        closePanel();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        panel.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(element => {
        return element.offsetParent !== null;
      });

      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    });

    /* -----------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
       ----------------------------------------- */

    document.addEventListener("click", event => {
      if (panel.hidden) return;

      if (!widget.contains(event.target)) {
        closePanel(false);
      }
    });

    /* Restore saved settings. */

    restoreSettings();
    updateDisplay();
  }

  /* -----------------------------------------
     WAIT FOR DYNAMICALLY LOADED WIDGET
     ----------------------------------------- */

  function findWidget() {
    const widget = document.getElementById("accessibility-widget");

    if (!widget || initialised) return;

    /*
      Keep the widget directly under body.
      This prevents filters and transformed ancestors
      from affecting its fixed position.
    */

    if (widget.parentElement !== document.body) {
      document.body.appendChild(widget);
    }

    initialiseWidget(widget);
  }

  function start() {
    findWidget();

    if (initialised) return;

    const observer = new MutationObserver(() => {
      findWidget();

      if (initialised) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();