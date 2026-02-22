import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTH_EVENT_NAME, AuthUser, getAuthUser, logoutAuth } from '../auth';

const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState<'main' | 'initiatives' | 'company' | 'offer'>('main');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getAuthUser());
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [navHeight, setNavHeight] = useState(110);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const syncAuth = () => setAuthUser(getAuthUser());
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      syncAuth();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener(AUTH_EVENT_NAME, syncAuth as EventListener);
    window.addEventListener('storage', syncAuth);

    const handleResize = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setNavHeight(Math.max(0, Math.round(rect.top + rect.height + 24)));
      }
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 50);
    syncAuth();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(AUTH_EVENT_NAME, syncAuth as EventListener);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleInternalNav = (e: React.MouseEvent, href: string) => {
    if (href && href.startsWith('/')) {
      e.preventDefault();
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsMobileMenuOpen(false);
      setIsAccountMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logoutAuth();
    setIsAccountMenuOpen(false);
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goToDashboard = () => {
    setIsAccountMenuOpen(false);
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goToSettings = () => {
    setIsAccountMenuOpen(false);
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Check if a nav item (or any of its children) matches the current path
  const isLinkActive = (href: string) => href !== '#' && currentPath === href;
  const isParentActive = (view?: string) => {
    if (!view) return false;
    const children = subMenus[view as keyof typeof subMenus] ?? [];
    return children.some((sub) => currentPath === sub.href);
  };

  const navLinks = [
    { name: 'Home', href: '/', hasDropdown: false },
    { name: 'AI Initiatives', href: '#', hasDropdown: true, view: 'initiatives' },
    { name: 'Our Company', href: '#', hasDropdown: true, view: 'company' },
    { name: 'What We Offer', href: '#', hasDropdown: true, view: 'offer' },
    { name: 'Philanthropy & Impact', href: '/philanthropy' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ];

  const subMenus = {
    initiatives: [
      { name: 'AI Services', href: '/ai-services' },
      { name: 'AI Projects', href: '/ai-projects' },
    ],
    company: [
      { name: 'About US', href: '/about-us' },
      { name: 'Offices', href: '/offices' },
    ],
    offer: [
      { name: 'Type A - Data Servicing', href: '/type-a-data-servicing' },
      { name: 'Type B-Horizontal LLM Data', href: '/type-b-horizontal-llm-data' },
      { name: 'Type C-Vertical LLM Data', href: '/type-c-vertical-llm-data' },
      { name: 'Type D-AIGC', href: '/type-d-aigc' },
    ],
  };

  const handleMobileLinkClick = (link: any) => {
    if (link.hasDropdown) {
      setMobileMenuView(link.view as any);
    } else if (link.href && link.href.startsWith('/')) {
      window.history.pushState({}, '', link.href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* unify logo sizing so light/dark variants render identically */}
      {/* logoSizeClass toggles with scroll state */}
      {/**/}
      
      
      {/* spacer to prevent fixed navbar overlapping page content */}
      <div style={{ height: navHeight }} aria-hidden="true" />

      {/* 
        KEY FLOATING CHANGES:
        1. `fixed top-4` — gives it breathing room from the top edge (instead of top-0)
        2. `flex justify-center` — centers the nav horizontally
        3. `w-fit` on the nav — shrinks to content width so it floats as an island
        4. Enhanced shadow & ring for the "lifted" appearance
      */}
      <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto w-fit"
          ref={navRef}
        >
          <motion.div
            animate={{
              y: isScrolled ? 0 : [0, -4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`flex items-center gap-6 xl:gap-8 transition-all duration-700 rounded-full
              border border-black/[0.04] dark:border-white/[0.07]
              ${isScrolled
                ? 'py-2.5 px-6 md:px-8 bg-white/30 dark:bg-brand-dark/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                : 'py-3.5 px-8 md:px-10 bg-white/40 dark:bg-brand-dark/45 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.07),0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
              }`}
          >
            {/* LOGO */}
            <div className="flex-shrink-0">
              <a href="#" className="flex items-center group">
                <div className="h-9 md:h-11 w-28 md:w-36 flex items-center justify-center">
                  {/* Light logo */}
                  <img
                    src="https://framerusercontent.com/images/BZSiFYgRc4wDUAuEybhJbZsIBQY.png"
                    alt="Lifewood Logo"
                    className="h-full w-full object-contain brightness-110 block dark:hidden mx-auto transition-all duration-500 group-hover:brightness-125"
                  />
                  {/* Dark logo (provided) - identical bounding box */}
                  <img
                    src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
                    alt="Lifewood Logo (dark)"
                    className="h-full w-full object-contain brightness-110 hidden dark:block mx-auto transition-all duration-500 group-hover:brightness-125 transform dark:scale-102"
                  />
                </div>
              </a>
            </div>

            {/* NAV LINKS (Desktop) */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown ? setHoveredMenu(link.view as string) : setHoveredMenu(null)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleInternalNav(e, link.href)}
                    className={`flex items-center gap-1.5 text-[11px] font-extrabold tracking-widest transition-all relative group whitespace-nowrap uppercase ${
                      isLinkActive(link.href) || isParentActive(link.view)
                        ? 'text-brand-saffron'
                        : 'text-brand-dark/60 dark:text-brand-seasalt/70 hover:text-brand-primary dark:hover:text-brand-saffron'
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <svg className="w-3 h-3 opacity-40 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-brand-primary dark:bg-brand-saffron transition-all duration-300 group-hover:w-full ${
                      isLinkActive(link.href) || isParentActive(link.view) ? 'w-full !bg-brand-saffron' : 'w-0'
                    }`} />
                  </a>

                  <AnimatePresence>
                    {link.hasDropdown && hoveredMenu === (link.view as string) && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-4 w-52 bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/[0.06] dark:border-white/10 py-2 overflow-hidden"
                        onMouseEnter={() => setHoveredMenu(link.view as string)}
                        onMouseLeave={() => setHoveredMenu(null)}
                      >
                        {subMenus[link.view as keyof typeof subMenus].map((sub) => (
                          <a
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => handleInternalNav(e, sub.href)}
                            className="block px-4 py-2.5 text-sm text-brand-dark/70 dark:text-brand-seasalt/70 hover:bg-brand-primary/5 dark:hover:bg-brand-saffron/10 hover:text-brand-primary dark:hover:text-brand-saffron transition-colors"
                          >
                            {sub.name}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* DIVIDER */}
            <div className="hidden lg:block w-px h-5 bg-brand-dark/10 dark:bg-white/10"></div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-brand-dark/40 dark:text-brand-seasalt/40 hover:text-brand-primary dark:hover:text-brand-saffron transition-all transform hover:scale-110 active:scale-90"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.757 7.757l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <button
                className="lg:hidden p-2 text-brand-dark dark:text-brand-seasalt"
                onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setMobileMenuView('main'); }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>

              {authUser ? (
                <div className="relative hidden sm:block" ref={accountRef}>
                  <button
                    onClick={() => setIsAccountMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-2.5 py-1.5 bg-white/70 dark:bg-white/10
                               border border-black/[0.06] dark:border-white/10
                               text-brand-dark dark:text-brand-seasalt hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="w-7 h-7 rounded-full bg-brand-primary dark:bg-brand-saffron text-white dark:text-brand-dark inline-flex items-center justify-center overflow-hidden">
                      {authUser.avatarUrl ? (
                        <img
                          src={authUser.avatarUrl}
                          alt={`${authUser.name || "User"} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 14a4 4 0 10-8 0m8 0a4 4 0 01-8 0m8 0v1a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1" />
                        </svg>
                      )}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 w-56 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-xl rounded-2xl
                                   shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/[0.06] dark:border-white/10 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-black/[0.06] dark:border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-dark/45 dark:text-brand-seasalt/45">
                            Signed In
                          </p>
                          <p className="text-[12px] font-semibold text-brand-dark/80 dark:text-brand-seasalt/85 truncate">
                            {authUser.email}
                          </p>
                        </div>

                        <button
                          onClick={goToDashboard}
                          className="w-full text-left block px-4 py-2.5 text-sm text-brand-dark/75 dark:text-brand-seasalt/75 hover:bg-brand-primary/5 dark:hover:bg-brand-saffron/10 hover:text-brand-primary dark:hover:text-brand-saffron transition-colors"
                        >
                          Dashboard
                        </button>
                        <a
                          href="/careers"
                          onClick={(e) => handleInternalNav(e, '/careers')}
                          className="block px-4 py-2.5 text-sm text-brand-dark/75 dark:text-brand-seasalt/75 hover:bg-brand-primary/5 dark:hover:bg-brand-saffron/10 hover:text-brand-primary dark:hover:text-brand-saffron transition-colors"
                        >
                          Analytics
                        </a>
                        <a
                          href="/contact"
                          onClick={(e) => handleInternalNav(e, '/contact')}
                          className="block px-4 py-2.5 text-sm text-brand-dark/75 dark:text-brand-seasalt/75 hover:bg-brand-primary/5 dark:hover:bg-brand-saffron/10 hover:text-brand-primary dark:hover:text-brand-saffron transition-colors"
                        >
                          Evaluation
                        </a>
                        <button
                          onClick={goToSettings}
                          className="w-full text-left block px-4 py-2.5 text-sm text-brand-dark/75 dark:text-brand-seasalt/75 hover:bg-brand-primary/5 dark:hover:bg-brand-saffron/10 hover:text-brand-primary dark:hover:text-brand-saffron transition-colors"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/login"
                  onClick={(e) => handleInternalNav(e, '/login')}
                  className="hidden sm:block bg-brand-primary dark:bg-brand-saffron text-white dark:text-brand-dark px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20 whitespace-nowrap"
                >
                  Get Started
                </a>
              )}
            </div>
          </motion.div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-brand-paper dark:bg-brand-dark lg:hidden pt-32 px-10 flex flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {mobileMenuView === 'main' ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-6"
                  >
                    {navLinks.map((link, idx) => (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={link.name}
                        onClick={() => handleMobileLinkClick(link)}
                        className={`text-2xl font-bold tracking-tight text-left hover:text-brand-primary dark:hover:text-brand-saffron transition-colors flex items-center justify-between group ${
                          isLinkActive(link.href) || isParentActive(link.view)
                            ? 'text-brand-saffron'
                            : 'text-brand-dark dark:text-brand-seasalt'
                        }`}
                      >
                        {link.name}
                        {link.hasDropdown && (
                          <svg className="w-5 h-5 text-brand-dark/30 dark:text-brand-seasalt/30 group-hover:text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="submenu"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-8"
                  >
                    <motion.button
                      onClick={() => setMobileMenuView('main')}
                      className="flex items-center gap-2 text-brand-saffron font-black uppercase tracking-[0.2em] text-sm mb-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </motion.button>

                    <h3 className="text-4xl font-black text-brand-dark dark:text-brand-seasalt tracking-tighter mb-4 capitalize">
                      {mobileMenuView === 'initiatives' ? 'AI Initiatives' : mobileMenuView === 'company' ? 'Our Company' : 'What We Offer'}
                    </h3>

                    <div className="flex flex-col gap-6">
                      {subMenus[mobileMenuView as keyof typeof subMenus].map((sub, idx) => (
                        <motion.a
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={sub.name}
                          href={sub.href}
                          onClick={(e) => { handleInternalNav(e as any, sub.href); setIsMobileMenuOpen(false); }}
                          className="text-2xl font-bold text-brand-dark/70 dark:text-brand-seasalt/70 hover:text-brand-saffron transition-colors"
                        >
                          {sub.name}
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!authUser && (
              <div className="pt-6 pb-8">
                <a
                  href="/login"
                  onClick={(e) => handleInternalNav(e, '/login')}
                  className="block w-full text-center bg-brand-primary dark:bg-brand-saffron text-white dark:text-brand-dark px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20"
                >
                  Get Started
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
