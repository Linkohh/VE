import { useEffect } from 'react';

interface PageSetupOptions {
  bodyClassName?: string;
  htmlClassName?: string;
  htmlDataTheme?: string;
}

export function usePageSetup({
  bodyClassName = '',
  htmlClassName = '',
  htmlDataTheme = 'light',
}: PageSetupOptions = {}) {
  useEffect(() => {
    const htmlEl = document.documentElement;
    const previousHtmlClass = htmlEl.className;
    const previousDataTheme = htmlEl.getAttribute('data-theme');
    const previousBodyClass = document.body.className;

    if (htmlClassName) {
      htmlEl.className = htmlClassName;
    }

    if (htmlDataTheme) {
      htmlEl.setAttribute('data-theme', htmlDataTheme);
    }

    if (bodyClassName) {
      document.body.className = bodyClassName;
    }

    return () => {
      htmlEl.className = previousHtmlClass;

      if (previousDataTheme === null) {
        htmlEl.removeAttribute('data-theme');
      } else {
        htmlEl.setAttribute('data-theme', previousDataTheme);
      }

      document.body.className = previousBodyClass;
    };
  }, [bodyClassName, htmlClassName, htmlDataTheme]);
}
