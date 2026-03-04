// Ensure DOM is ready before attaching handlers
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  // Copy button functionality for all code blocks
  document.querySelectorAll('pre').forEach((block) => {
    const code = block.querySelector('code');
    if (!code) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.textContent = 'Copy';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        const original = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = original;
        }, 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
    });

    block.appendChild(button);
  });

  // Accordion functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const currentlyOpen = header.classList.contains('open');
      const parentAccordion = header.closest('.accordion');

      // Optionally close all others within the same accordion
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.accordion-header.open').forEach((openHeader) => {
          if (openHeader !== header) {
            openHeader.classList.remove('open');
            const content = openHeader.nextElementSibling;
            if (content && content.classList.contains('accordion-content')) {
              content.style.maxHeight = null;
            }
          }
        });
      }

      const content = header.nextElementSibling;
      if (!content || !content.classList.contains('accordion-content')) return;

      if (currentlyOpen) {
        header.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        header.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Smooth scroll for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

