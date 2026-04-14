const copyButton = document.getElementById("copy-bibtex");
const bibtexText = document.getElementById("bibtex-text");

if (copyButton && bibtexText) {
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bibtexText.textContent);
      copyButton.textContent = "Copied";
      copyButton.classList.add("is-copied");

      setTimeout(() => {
        copyButton.textContent = "Copy";
        copyButton.classList.remove("is-copied");
      }, 1200);
    } catch (error) {
      copyButton.textContent = "Failed";

      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1200);
    }
  });
}

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

const stepCards = document.querySelectorAll(".process-step-card");
const displayImage = document.getElementById("process-display-image");

if (stepCards.length && displayImage) {
  stepCards.forEach((card) => {
    card.addEventListener("click", () => {
      stepCards.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });

      card.classList.add("is-active");
      card.setAttribute("aria-selected", "true");

      const gif = card.dataset.gif;

      displayImage.style.opacity = "0";

      setTimeout(() => {
        displayImage.src = gif;
        displayImage.style.opacity = "1";
      }, 120);
    });
  });
}