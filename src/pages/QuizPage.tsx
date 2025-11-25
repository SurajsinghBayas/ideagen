import React, { useState, useEffect, useRef } from 'react';
import { generateQuiz, type QuizData } from '../services/ai';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, AlertTriangle, Download, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

export const QuizPage: React.FC = () => {
    const [step, setStep] = useState<'SETUP' | 'LOADING' | 'QUIZ' | 'RESULT'>('SETUP');
    const [topic, setTopic] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Difficult'>('Moderate');
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const resultRef = useRef<HTMLDivElement>(null);
    const certificateRef = useRef<HTMLDivElement>(null);

    // Anti-cheat: Tab switching detection
    useEffect(() => {
        if (step === 'QUIZ') {
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    alert("Warning: Tab switching is not allowed during the quiz!");
                }
            };
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    }, [step]);

    // Timer Logic
    useEffect(() => {
        if (step === 'QUIZ' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleNextQuestion(); // Auto-submit on timeout
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    const handleStartQuiz = async () => {
        if (!topic.trim()) return;

        // Enter Full Screen immediately on user interaction
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Could not enter full screen", err);
        }

        setStep('LOADING');
        try {
            const data = await generateQuiz(topic, syllabus, difficulty);
            if (data) {
                setQuizData(data);
                setStep('QUIZ');
                setCurrentQuestionIndex(0);
                setTimeLeft(data.questions[0].timeLimit);
                setUserAnswers(new Array(10).fill(-1));
            }
        } catch (error) {
            alert("Failed to generate quiz. Please try again.");
            setStep('SETUP');
        }
    };

    const handleNextQuestion = () => {
        if (!quizData) return;

        if (currentQuestionIndex < 9) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(quizData.questions[currentQuestionIndex + 1].timeLimit);
        } else {
            calculateScore();
        }
    };

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const calculateScore = () => {
        if (!quizData) return;
        let newScore = 0;
        quizData.questions.forEach((q, i) => {
            if (userAnswers[i] === q.correctIndex) {
                newScore++;
            }
        });
        setScore(newScore);
        setStep('RESULT');

        // Exit Full Screen
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.warn("Could not exit full screen", err));
        }
    };

    const handleReattempt = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers(new Array(10).fill(-1));
        setScore(0);
        setStep('QUIZ');
        if (quizData) setTimeLeft(quizData.questions[0].timeLimit);

        // Re-enter Full Screen
        try {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Could not enter full screen", err);
        }
    };

    const handleDownloadResult = async () => {
        if (!resultRef.current) return;
        const canvas = await html2canvas(resultRef.current, { backgroundColor: '#f2f0ea', scale: 2 });
        const link = document.createElement('a');
        link.download = `FlashGen_Report_${topic}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleDownloadCertificate = async () => {
        if (!certificateRef.current) return;
        const canvas = await html2canvas(certificateRef.current, { backgroundColor: '#1a1a1a', scale: 2 });
        const link = document.createElement('a');
        link.download = `FlashGen_ScoreCard_${topic}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="grain-overlay" />

            {/* Navigation */}
            <nav className="border-bottom nav-container" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', zIndex: 10 }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} /> Exit
                </Link>
                <div style={{ fontWeight: '800', letterSpacing: '-0.02em' }}>FLASHGEN / QUIZ MODE</div>
                <div style={{ width: '60px' }}></div>
            </nav>

            <div className="container mobile-p-1" style={{ maxWidth: '1000px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>

                {/* SETUP STEP */}
                {step === 'SETUP' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-box mobile-p-2" style={{ background: 'white', padding: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Configure Assessment</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>TOPIC</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Thermodynamics, World War II"
                                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', fontSize: '1.1rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>SYLLABUS / CONTEXT (Optional)</label>
                                <textarea
                                    value={syllabus}
                                    onChange={(e) => setSyllabus(e.target.value)}
                                    placeholder="Paste specific syllabus or notes here..."
                                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', fontSize: '1rem', minHeight: '100px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>DIFFICULTY</label>
                                <div className="mobile-flex-col" style={{ display: 'flex', gap: '1rem' }}>
                                    {['Easy', 'Moderate', 'Difficult'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level as any)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                border: '1px solid var(--border-color)',
                                                background: difficulty === level ? 'var(--text-main)' : 'transparent',
                                                color: difficulty === level ? 'white' : 'var(--text-main)',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-primary" onClick={handleStartQuiz} style={{ marginTop: '1rem' }}>
                                Start Quiz Protocol
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* LOADING STEP */}
                {step === 'LOADING' && (
                    <div style={{ textAlign: 'center' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Brain size={64} />
                        </motion.div>
                        <h3 style={{ marginTop: '2rem', fontSize: '1.5rem' }}>Generating Assessment...</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Analyzing topic complexity and formulating questions.</p>
                    </div>
                )}

                {/* QUIZ STEP */}
                {step === 'QUIZ' && quizData && (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>Question {currentQuestionIndex + 1} / 10</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 10 ? 'red' : 'inherit', fontWeight: '600' }}>
                                <Clock size={20} /> {timeLeft}s
                            </div>
                        </div>

                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-box mobile-p-2"
                            style={{ background: 'white', padding: '3rem' }}
                        >
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem', lineHeight: 1.4 }}>
                                {quizData.questions[currentQuestionIndex].question}
                            </h3>

                            <div className="mobile-grid-1" style={{ display: 'grid', gap: '1rem' }}>
                                {quizData.questions[currentQuestionIndex].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(idx)}
                                        style={{
                                            padding: '1.5rem',
                                            textAlign: 'left',
                                            border: userAnswers[currentQuestionIndex] === idx ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                            background: userAnswers[currentQuestionIndex] === idx ? 'rgba(255, 51, 51, 0.05)' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <span style={{ fontWeight: '700', marginRight: '1rem' }}>{String.fromCharCode(65 + idx)}.</span> {option}
                                        {userAnswers[currentQuestionIndex] === idx && (
                                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%' }} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleNextQuestion()}
                                    disabled={userAnswers[currentQuestionIndex] === -1}
                                    style={{ opacity: userAnswers[currentQuestionIndex] === -1 ? 0.5 : 1 }}
                                >
                                    {currentQuestionIndex === 9 ? 'Finish Assessment' : 'Next Question'}
                                </button>
                            </div>
                        </motion.div>

                        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Anti-cheat active: Do not switch tabs. Full screen enforced.
                        </div>
                    </div>
                )}

                {/* RESULT STEP */}
                {step === 'RESULT' && quizData && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div ref={resultRef} className="border-box mobile-p-2" style={{ background: 'white', padding: '4rem', width: '100%', maxWidth: '800px', position: 'relative' }}>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <div style={{ fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>FLASHGEN AI ASSESSMENT</div>
                                <h2 style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '0.5rem' }}>{score} / 10</h2>
                                <div style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: score > 7 ? 'green' : score > 4 ? 'orange' : 'red' }}>
                                    {score > 8 ? 'Excellent' : score > 5 ? 'Good Effort' : 'Needs Improvement'}
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '1rem', letterSpacing: '0.1em' }}>Detailed Analysis</h3>

                                {quizData.questions.map((q, i) => (
                                    <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ color: userAnswers[i] === q.correctIndex ? 'green' : 'red' }}>
                                                {userAnswers[i] === q.correctIndex ? '✓' : '✕'}
                                            </span>
                                            {i + 1}. {q.question}
                                        </div>
                                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                            <div style={{ color: userAnswers[i] === q.correctIndex ? 'green' : 'red' }}>
                                                <span style={{ fontWeight: '600' }}>Your Answer:</span> {q.options[userAnswers[i]] || 'Skipped'}
                                            </div>
                                            {userAnswers[i] !== q.correctIndex && (
                                                <div style={{ color: 'green' }}>
                                                    <span style={{ fontWeight: '600' }}>Correct Answer:</span> {q.options[q.correctIndex]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {score < 10 && (
                                <div>
                                    <h3 style={{ borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '1rem', letterSpacing: '0.1em' }}>Areas for Improvement</h3>
                                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                        {quizData.questions.filter((q, i) => userAnswers[i] !== q.correctIndex).map((q, i) => (
                                            <li key={i} style={{ marginBottom: '0.5rem' }}>
                                                Review concept: "{q.question.substring(0, 50)}..."
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString()}</div>
                        </div>

                        <div className="mobile-flex-col mobile-gap-1" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '4rem' }}>
                            <button className="btn-primary mobile-w-full" onClick={handleDownloadCertificate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={18} /> Download Score Card
                            </button>
                            <button className="btn-secondary mobile-w-full" onClick={handleDownloadResult} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={18} /> Download Full Report
                            </button>
                            <button className="btn-secondary mobile-w-full" onClick={handleReattempt}>
                                Reattempt
                            </button>
                            <button className="btn-secondary mobile-w-full" onClick={() => setStep('SETUP')}>
                                New Topic
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden Certificate Template */}
                <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                    <div ref={certificateRef} style={{
                        width: '800px',
                        height: '600px',
                        background: '#1a1a1a',
                        color: '#f2f0ea',
                        padding: '4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '20px solid #f2f0ea',
                        fontFamily: 'Manrope, sans-serif'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em' }}>FLASHGEN AI</div>
                            <div style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.9rem', opacity: 0.7 }}>Official Score Card</div>
                        </div>

                        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '1.5rem', opacity: 0.8, marginBottom: '1rem' }}>ASSESSMENT RESULT FOR</div>
                            <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '2rem', color: '#fff' }}>{topic}</h1>

                            <div style={{ display: 'inline-block', border: '2px solid #ff3333', padding: '1rem 3rem', margin: '0 auto' }}>
                                <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff3333', marginBottom: '0.5rem' }}>Final Score</div>
                                <div style={{ fontSize: '5rem', fontWeight: '800', lineHeight: 1 }}>{score}/10</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #333', paddingTop: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.25rem' }}>DIFFICULTY</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{difficulty}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.25rem' }}>DATE</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
