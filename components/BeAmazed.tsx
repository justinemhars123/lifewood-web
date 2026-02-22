import React, { useEffect, useRef, useState } from 'react';

// ImageReveal: small component that reveals its child image when scrolled into view.
// Uses IntersectionObserver for performant scroll detection and honours
// `prefers-reduced-motion` by immediately showing content when reduced motion
// is requested by the user.
const ImageReveal: React.FC<{ src: string; alt: string; from?: 'up' | 'left' | 'right' | 'down' }> = ({ src, alt, from = 'up' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (entry.target) io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // initial transform classes depending on direction
  const initialTransform =
    from === 'up' ? 'translate-y-8' : from === 'down' ? '-translate-y-8' : from === 'left' ? '-translate-x-8' : 'translate-x-8';

  return (
    <div
      ref={ref}
      // Tailwind utility classes used; when `visible` becomes true we remove opacity/translate
      className={`rounded-lg overflow-hidden will-change-transform transform transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${initialTransform}`
      }`}
      aria-hidden={visible ? 'false' : 'true'}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
    </div>
  );
};

// BeAmazed: horizontal scrolling marquee of images
const BeAmazed: React.FC = () => {
  const images = [
    { src: 'https://images.unsplash.com/photo-1541718701207-3c6f0b2e6b2a?auto=format&fit=crop&w=800&q=80', alt: 'Portrait of a creative at work' },
    { src: 'https://images.unsplash.com/photo-1532074205216-d0e1f5b79b36?auto=format&fit=crop&w=800&q=80', alt: 'AI concept illustration' },
    { src: 'https://images.unsplash.com/photo-1526178613264-4f8e1d4e8a68?auto=format&fit=crop&w=800&q=80', alt: 'Autonomous vehicle technology' },
    { src: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', alt: 'Team meeting and collaboration' },
    { src: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80', alt: 'Waveform visual for audio' },
    { src: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=1000&q=80', alt: 'Data capture on mobile' },
  ];

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-0 mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-center text-[#0f2318] dark:text-white">Be Amazed</h2>
      </div>

      {/* Marquee container - single horizontal scroll */}
      <div className="relative w-full overflow-hidden">
        <style>{`
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .marquee {
            display: flex;
            animation: scroll-left 30s linear infinite;
          }
          .marquee:hover {
            animation-play-state: paused;
          }
          .marquee-item {
            flex-shrink: 0;
            padding: 0 12px;
          }
        `}</style>

        <div className="marquee">
          {[...images, ...images].map((img, i) => (
            <div key={i} className="marquee-item">
              <img
                src={img.src}
                alt={img.alt}
                className="w-48 h-40 object-cover rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeAmazed;
