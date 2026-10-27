// Copy buttons: each names the <pre> it copies in data-copy.
document.querySelectorAll("[data-copy]").forEach((button) => {
  const source = document.getElementById(button.dataset.copy);
  if (!source) return;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(source.textContent);
      button.textContent = "Copied";
      button.classList.add("is-copied");
    } catch (error) {
      button.textContent = "Failed";
    }

    setTimeout(() => {
      button.textContent = "Copy";
      button.classList.remove("is-copied");
    }, 1200);
  });
});

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => {
  observer.observe(element);
});

// Ensure hero animates immediately on load
window.addEventListener("load", () => {
  document.querySelectorAll(".hero .reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
});

const stepCards = [...document.querySelectorAll(".process-step-card")];
const displayImage = document.getElementById("process-display-image");
const displayPanel = document.getElementById("process-panel");
const displayCaption = document.getElementById("process-display-caption");
const captionNumber = document.getElementById("process-caption-num");
const currentTitle = document.querySelector(".process-current-title");
const currentText = document.querySelector(".process-current-text");

if (stepCards.length && displayImage) {
  const gifCache = new Map();
  let switchToken = 0;

  // Preload all process GIFs once.
  stepCards.forEach((card) => {
    const src = card.dataset.gif;
    if (!src || gifCache.has(src)) return;

    const img = new Image();
    img.src = src;
    gifCache.set(src, img);
  });

  const selectStep = (card) => {
    const gif = card.dataset.gif;
    if (!gif || card.classList.contains("is-active")) return;

    switchToken += 1;
    const token = switchToken;

    // Roving tabindex: only the active tab is in the Tab order.
    stepCards.forEach((c) => {
      const active = c === card;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-selected", String(active));
      c.tabIndex = active ? 0 : -1;
    });

    const stepNumber = stepCards.indexOf(card) + 1;

    if (displayPanel) {
      displayPanel.setAttribute("aria-labelledby", card.id);
      displayPanel.dataset.step = String(stepNumber);
      if (captionNumber) captionNumber.textContent = `0${stepNumber}`;
    }

    // The phone-only summary mirrors the active card's title and text.
    if (currentTitle) currentTitle.textContent = card.querySelector(".step-card-title").textContent;
    if (currentText) currentText.textContent = card.querySelector(".step-card-text").textContent;

    displayImage.style.opacity = "0";

    const cached = gifCache.get(gif) || new Image();

    const showNewGif = () => {
      if (token !== switchToken) return;
      displayImage.src = gif;
      displayImage.alt = `Animated illustration for Step ${stepNumber} of P2P`;
      if (displayCaption) displayCaption.textContent = card.dataset.caption || "";
      displayImage.style.opacity = "1";
    };

    if (cached.complete) {
      showNewGif();
    } else {
      cached.onload = showNewGif;
      cached.src = gif;
    }
  };

  // Arrow keys move between tabs (and select them); Home and End jump to the ends.
  const keyOffsets = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

  stepCards.forEach((card, index) => {
    card.addEventListener("click", () => selectStep(card));

    card.addEventListener("keydown", (event) => {
      let next;
      if (event.key in keyOffsets) {
        next = stepCards[(index + keyOffsets[event.key] + stepCards.length) % stepCards.length];
      } else if (event.key === "Home") {
        next = stepCards[0];
      } else if (event.key === "End") {
        next = stepCards[stepCards.length - 1];
      } else {
        return;
      }

      event.preventDefault();
      next.focus();
      selectStep(next);
    });
  });
}

// At a glance: a dashed leader line from the top of each card straight up to
// its pin on the drawing, with a node where it leaves the card. Redrawn
// whenever the layout changes; hidden by CSS when the cards stack.
const glance = document.querySelector(".glance");
const leaders = glance && glance.querySelector(".glance-leaders");

if (glance && leaders) {
  const svgNS = "http://www.w3.org/2000/svg";

  const drawLeaders = () => {
    leaders.replaceChildren();
    if (getComputedStyle(leaders).display === "none") return;

    const box = glance.getBoundingClientRect();

    glance.querySelectorAll(".glance-pin").forEach((pin) => {
      const card = glance.querySelector(`.glance-card-${pin.dataset.pin}`);
      if (!card) return;

      const p = pin.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const pinX = p.left + p.width / 2 - box.left;
      const pinBottom = p.bottom - box.top;
      const cardTop = c.top - box.top;

      // Leave the card under the pin where possible, else at its nearest edge.
      const x = Math.min(Math.max(pinX, c.left - box.left + 18), c.right - box.left - 18);
      const d = x === pinX
        ? `M${x} ${cardTop} V${pinBottom}`
        : `M${x} ${cardTop} V${pinBottom + 14} H${pinX} V${pinBottom}`;

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      const node = document.createElementNS(svgNS, "circle");
      node.setAttribute("cx", x);
      node.setAttribute("cy", cardTop);
      node.setAttribute("r", 3);
      leaders.append(path, node);
    });
  };

  new ResizeObserver(drawLeaders).observe(glance);
}
