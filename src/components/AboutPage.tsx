import { usePageSetup } from '../hooks/usePageSetup';

const AboutPage = (): JSX.Element => {
  usePageSetup({
    bodyClassName: 'min-h-screen flex items-center justify-center p-4 gradient-bg about-page',
    htmlClassName: 'about-page',
    htmlDataTheme: 'light'
  });

  return (
    <>
      <div id="mouse-glow" className="mouse-glow" aria-hidden="true"></div>
      <div id="matrix-bg" className="matrix-bg" aria-hidden="true"></div>
      <canvas id="matrix-canvas" className="matrix-canvas" aria-hidden="true"></canvas>
      <main id="main-content" className="container mx-auto max-w-4xl relative z-10 pt-8">
        <nav className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 dynamic-text-main font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg"
          >
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            <span>Home</span>
          </a>
        </nav>
        <div id="app-title-bar" className="app-title-bar" role="banner" aria-label="Application Title">
          <h1 className="vb-logo heading-font !text-4xl" data-title="VibeMe">
            VibeMe
          </h1>
          <span className="logo-underline" aria-hidden="true"></span>
          <div id="flip-clock-mount" className="flip-clock-mount" data-skin="v2" aria-label="Current time" role="timer"></div>
        </div>
        <div className="quote-container-outer">
          <div className="quote-container-inner dynamic-text-secondary p-8 md:p-12">
            <h1 className="heading-font font-bold text-center mb-8 dynamic-text-main about-title">About This Space</h1>
            <div id="about-content-placeholder" className="about-sections">
              <section>
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3">
                  <span className="section-icon" aria-hidden="true">🎯</span>
                  <span>Our Mission</span>
                </h2>
                <p className="leading-relaxed">
                  Our mission is to provide a sanctuary for original thought and authentic expression. In a world saturated with
                  familiar voices, we celebrate the unique perspectives that come from individual walks of life. This platform is
                  dedicated to fostering diversity, equity, and inclusion by empowering everyone to share their own motivational
                  quotes, ideas, and experiences. We believe that your voice matters and that your originality is a source of
                  inspiration.
                </p>
              </section>
              <section>
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3">
                  <span className="section-icon" aria-hidden="true">📖</span>
                  <span>Our Story</span>
                </h2>
                <p className="leading-relaxed mb-4">
                  <em>
                    (This is where you can share the story behind the application. Talk about the creator, what inspired them, and
                    the journey of bringing this idea to life. Your users will appreciate knowing the 'why' behind the project!)
                  </em>
                </p>
                <div className="my-6 rounded-lg overflow-hidden shadow-lg"></div>
              </section>
              <section className="contact">
                <h2 className="about-section-title heading-font font-semibold mb-4 dynamic-text-main border-b border-white/20 pb-3">
                  <span className="section-icon" aria-hidden="true">✉️</span>
                  <span>Contact Us</span>
                </h2>
                <p className="leading-relaxed">
                  We'd love to hear from you! Whether you have a question, feedback, or a story to share, please reach out.
                </p>
                <div className="mt-4">
                  <p>
                    <strong>Email:</strong>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 text-center py-2 z-[9999]">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white/70">Copyright © 2025 VibeMe By LHO. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default AboutPage;
