import React, { useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import quotesData from '../data/quotes.json';

function AboutPage({ onNavigateHome }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [currentTime]
  );

  const totalQuotes = useMemo(() => {
    const categories = quotesData.categories ?? {};
    return Object.values(categories).reduce(
      (acc, items) => acc + (Array.isArray(items) ? items.length : 0),
      0
    );
  }, []);

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl relative z-10 pt-8">
        <nav className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 dynamic-text-main font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg"
            onClick={onNavigateHome}
          >
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            <span>Home</span>
          </a>
        </nav>

        <div
          id="app-title-bar"
          className="app-title-bar"
          role="banner"
          aria-label="Application Title"
        >
          <h1 className="vb-logo heading-font !text-4xl" data-title="VibeMe">
            VibeMe
          </h1>
          <span className="logo-underline" aria-hidden="true"></span>
          <div
            id="flip-clock-mount"
            className="flip-clock-mount"
            data-skin="v2"
            aria-label="Current time"
            role="timer"
          >
            <span aria-hidden="true" className="text-white text-lg font-mono">
              {formattedTime}
            </span>
          </div>
        </div>

        <div className="quote-container-outer">
          <div className="quote-container-inner dynamic-text-secondary p-8 md:p-12">
            <h1 className="heading-font font-bold text-center mb-8 dynamic-text-main about-title">
              About This Space
            </h1>

            <section className="about-sections space-y-8">
              <article>
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3 flex items-center gap-2">
                  <span className="section-icon" aria-hidden="true">
                    🎯
                  </span>
                  <span>Our Mission</span>
                </h2>
                <p className="leading-relaxed">
                  Our mission is to provide a sanctuary for original thought and authentic expression. In a world saturated with familiar voices, we celebrate the unique perspectives that come from individual walks of life. This platform is dedicated to fostering diversity, equity, and inclusion by empowering everyone to share their own motivational quotes, ideas, and experiences. We believe that your voice matters and that your originality is a source of inspiration.
                </p>
              </article>

              <article>
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3 flex items-center gap-2">
                  <span className="section-icon" aria-hidden="true">
                    📖
                  </span>
                  <span>Our Story</span>
                </h2>
                <p className="leading-relaxed mb-4">
                  VibeMe started as a simple idea: make it easier to discover encouraging words that match the energy you need. Over time, the experience has grown into a carefully curated collection of original and classic quotes, animated backgrounds, and thoughtful accessibility touches. Every improvement is guided by feedback from people like you who use VibeMe to find a spark of motivation.
                </p>
                <p className="leading-relaxed">
                  Today the library spans {totalQuotes} quotes across multiple themes. Whether you are looking for resilience, love, focus, or a gentle reminder to slow down, there is always something new to explore.
                </p>
              </article>

              <article className="contact space-y-4">
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3 flex items-center gap-2">
                  <span className="section-icon" aria-hidden="true">
                    ✉️
                  </span>
                  <span>Contact Us</span>
                </h2>
                <p className="leading-relaxed">
                  We would love to hear from you! Whether you have a question, feedback, or a story to share, please reach out.
                </p>
                <p className="leading-relaxed">
                  <strong>Email:</strong> <a href="mailto:hello@vibeme.app" className="underline hover:text-white">hello@vibeme.app</a>
                </p>
                <p className="text-sm text-white/70">
                  You can also follow future updates on social platforms under the handle <strong>@vibeme</strong>.
                </p>
              </article>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AboutPage;
