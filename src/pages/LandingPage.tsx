import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hero3D } from '../components/Hero3D';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Lenis from 'lenis';

export const LandingPage: React.FC = () => {
    useEffect(() => {
        const lenis = new Lenis();
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    return (
        <div className="landing-page" style={{ position: 'relative' }}>
            <div className="grain-overlay" />

            {/* Navigation */}
            <nav className="border-bottom" style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
                padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(242, 240, 234, 0.9)', backdropFilter: 'blur(5px)'
            }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    FlashGen <span style={{ color: 'var(--accent)' }}>●</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/quiz" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Take Quiz</Link>
                    <Link to="/app" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Launch App</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ minHeight: '100vh', paddingTop: '80px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', position: 'relative' }}>
                <div className="border-right" style={{ padding: '4rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', lineHeight: 0.9, marginBottom: '2rem', color: '#1a1a1a' }}>
                            VISUALIZE <br />
                            <span className="serif" style={{ fontWeight: 400 }}>KNOWLEDGE</span> <br />
                            INSTANTLY.
                        </h1>

                        <p style={{ fontSize: '1.25rem', maxWidth: '500px', marginBottom: '3rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Turn complex paragraphs into beautiful, structured infographics.
                            The ultimate tool for visual learners and educators.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/app" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Start Designing <ArrowRight size={18} />
                            </Link>
                            <Link to="/quiz" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                                Take a Quiz
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side */}
                <div style={{ position: 'relative', background: '#e5e5e5', overflow: 'hidden' }}>

                    <Hero3D />
                    <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', width: '100px', height: '100px', borderLeft: '1px solid #000', borderBottom: '1px solid #000' }} />
                </div>
            </header>

            {/* Marquee Section */}
            <div className="border-bottom border-top" style={{ padding: '1.5rem 0', background: 'var(--text-main)', color: 'var(--bg-main)' }}>
                <div className="marquee-container">
                    <div className="marquee-content">
                        {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} style={{ fontSize: '4rem', fontWeight: '800', margin: '0 2rem', textTransform: 'uppercase' }}>
                                Design • Learn • Visualize • Create •
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Features */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <GridFeature
                    number="01"
                    title="Structure"
                    desc="Automatically organizes messy notes into clear, logical hierarchies."
                />
                <GridFeature
                    number="02"
                    title="Aesthetics"
                    desc="Generates Swiss-style posters suitable for printing and sharing."
                />
                <GridFeature
                    number="03"
                    title="Focus"
                    desc="Filters out distractions. Only educational content is processed."
                    last
                />
            </section>

            <footer style={{ padding: '4rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to see the big picture?</h2>
                <Link to="/app" style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    Generate Infographic <ArrowUpRight size={20} />
                </Link>
            </footer>
        </div>
    );
};

const GridFeature = ({ number, title, desc, last }: { number: string, title: string, desc: string, last?: boolean }) => (
    <div className={`border-bottom ${!last ? 'border-right' : ''}`} style={{ padding: '4rem 2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent)' }}>({number})</div>
        <div>
            <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '300px' }}>{desc}</p>
        </div>
    </div>
);
