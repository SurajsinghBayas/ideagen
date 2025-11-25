import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Flashcard.css';

interface FlashcardProps {
    front: string;
    back: string;
    index?: number;
}

export const Flashcard: React.FC<FlashcardProps> = ({ front, back, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="flashcard-inner"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div className="flashcard-front border-box">
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent)' }}>
                        {index ? `0${index}` : '01'}
                    </div>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '10px', height: '10px', background: 'var(--text-main)', borderRadius: '50%' }} />

                    <div className="content">
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', lineHeight: 1.4 }}>{front}</h3>
                    </div>

                    <div style={{ position: 'absolute', bottom: '1rem', width: '100%', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                        Tap to Reveal
                    </div>
                </div>

                {/* Back */}
                <div className="flashcard-back border-box">
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        ANSWER
                    </div>
                    <div className="content">
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{back}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
