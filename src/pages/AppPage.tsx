import React, { useState, useRef } from 'react';
import { generateInfographic, type InfographicData } from '../services/ai';
import { Infographic } from '../components/Infographic';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download, Loader2, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppPage: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [data, setData] = useState<InfographicData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const graphicRef = useRef<HTMLDivElement>(null);

    const [showKeyWarning, setShowKeyWarning] = useState(!import.meta.env.VITE_HF_TOKEN);

    const handleGenerate = async () => {
        if (!import.meta.env.VITE_HF_TOKEN) {
            setShowKeyWarning(true);
            // We still allow generation, which will use mock data from the service
        }

        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await generateInfographic(topic);
            if (result) {
                setData(result);
            } else {
                setError("This topic doesn't seem to be educational. Please try a study-related topic.");
            }
        } catch (error: any) {
            setError(error.message || "Failed to generate content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!graphicRef.current) return;
        try {
            const canvas = await html2canvas(graphicRef.current, {
                backgroundColor: '#f2f0ea',
                scale: 2,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `${topic.replace(/\s+/g, '_')}_infographic.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div className="grain-overlay" />

            {/* Top Bar */}
            <nav className="border-bottom nav-container" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', zIndex: 10 }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} /> Exit
                </Link>
                <div style={{ fontWeight: '800', letterSpacing: '-0.02em' }}>WORKSPACE / DESIGNER</div>
                <div style={{ width: '60px' }}></div>
            </nav>

            <div className="container mobile-p-1" style={{ maxWidth: '1400px', flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '4rem' }}>

                {/* Input Section */}
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center', marginBottom: '4rem' }}>

                    {showKeyWarning && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404',
                                padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.9rem'
                            }}
                        >
                            <strong>⚠️ API Key Missing:</strong> You are seeing mock data because no Hugging Face token was found.
                            <br />
                            1. Get a free token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" style={{ color: '#856404', fontWeight: 'bold' }}>huggingface.co</a>
                            <br />
                            2. Add it to the <code>.env</code> file as <code>VITE_HF_TOKEN=your_token</code>
                            <br />
                            3. Restart the server.
                        </motion.div>
                    )}

                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Topic Synthesis</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter a concept, paragraph, or subject to visualize.</p>

                    <div className="border-box mobile-flex-col" style={{ display: 'flex', padding: '0.5rem', background: 'white' }}>
                        <input
                            type="text"
                            placeholder="e.g. 'The French Revolution', 'Black Holes', 'Supply and Demand'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            style={{
                                flex: 1, border: 'none', background: 'transparent', padding: '1rem',
                                fontSize: '1.2rem', color: 'var(--text-main)', outline: 'none', boxShadow: 'none'
                            }}
                        />
                        <button
                            className="btn-primary mobile-w-full"
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Design <Sparkles size={18} /></>}
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '1.5rem', color: '#ff3333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
                        >
                            <AlertCircle size={20} /> {error}
                        </motion.div>
                    )}
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {data && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div className="mobile-flex-col mobile-gap-1" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Preview</h3>
                                </div>
                                <button className="btn-secondary mobile-w-full" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                    <Download size={18} /> Export Poster
                                </button>
                            </div>

                            <div ref={graphicRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Infographic data={data} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
