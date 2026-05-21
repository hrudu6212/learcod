import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface QuizSectionProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ questions, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    
    const correct = selectedOption === currentQuestion.answerIndex;
    if (correct) {
      setCorrectAnswersCount(prev => prev + 1);
    }
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      onComplete(correctAnswersCount + (selectedOption === currentQuestion.answerIndex ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
    onComplete(0);
  };

  const getRank = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio === 1) return { title: 'Grand Magus of Code', color: '#22d3ee', description: 'Flawless victory! You have mastered this logic chamber.' };
    if (ratio >= 0.7) return { title: 'High Sorcerer', color: '#a78bfa', description: 'Splendid! You understand the intricate pathways of this spell.' };
    if (ratio >= 0.4) return { title: 'Apprentice Scribe', color: '#f472b6', description: 'Good effort! Some pathways remain clouded, but you are learning fast.' };
    return { title: 'Initiate Scholar', color: '#9ca3af', description: 'The runes are tricky. Study the scrolls once more and return stronger.' };
  };

  if (quizFinished) {
    const score = correctAnswersCount;
    const rank = getRank(score, questions.length);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
        <div style={{ 
          width: '70px', 
          height: '70px', 
          borderRadius: '50%', 
          background: `rgba(${score === questions.length ? '16, 185, 129' : '139, 92, 246'}, 0.1)`, 
          border: `2px dashed ${score === questions.length ? '#10b981' : '#a78bfa'}`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: score === questions.length ? '#10b981' : '#a78bfa',
          marginBottom: '0.5rem'
        }}>
          <Award size={36} />
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Trial Concluded!</h3>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>You navigated the code runes successfully.</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#9ca3af' }}>Achieved Title</span>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: rank.color, margin: '0.25rem 0 0.5rem 0' }}>
            {rank.title}
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
            {rank.description}
          </p>
          <div style={{ display: 'inline-block', marginTop: '1rem', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
            Score: <span style={{ color: '#22d3ee' }}>{score}</span> / {questions.length} Correct
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={onBack}
            style={{ flex: 1, fontSize: '0.85rem' }}
          >
            Read Story
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleRestart}
            style={{ flex: 1, fontSize: '0.85rem' }}
          >
            <RotateCcw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Question Header */}
      <div>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
          CHALLENGE {currentIndex + 1} OF {questions.length}
        </span>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6', marginTop: '0.25rem', lineHeight: 1.5 }}>
          {currentQuestion.question}
        </h4>
      </div>

      {/* Multiple Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {currentQuestion.options.map((option, idx) => {
          let optionClass = '';
          let isOptionCorrect = idx === currentQuestion.answerIndex;
          let isOptionSelected = idx === selectedOption;

          if (isAnswered) {
            if (isOptionCorrect) {
              optionClass = 'correct';
            } else if (isOptionSelected) {
              optionClass = 'wrong';
            }
          } else if (isOptionSelected) {
            optionClass = 'selected';
          }

          return (
            <button
              key={idx}
              className={`quiz-option ${optionClass}`}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              style={{
                borderColor: isOptionSelected && !isAnswered ? '#a78bfa' : undefined,
                background: isOptionSelected && !isAnswered ? 'rgba(167, 139, 250, 0.05)' : undefined,
                cursor: isAnswered ? 'default' : 'pointer'
              }}
            >
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isOptionSelected ? '#fff' : '#9ca3af'
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{option}</span>
              
              {isAnswered && isOptionCorrect && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
              {isAnswered && isOptionSelected && !isOptionCorrect && <XCircle size={16} style={{ color: '#ef4444' }} />}
            </button>
          );
        })}
      </div>

      {/* Submit / Explanations section */}
      {isAnswered ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderLeft: `3px solid ${selectedOption === currentQuestion.answerIndex ? '#10b981' : '#ef4444'}`,
            padding: '0.75rem 1rem',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.8rem',
            lineHeight: 1.5
          }}>
            <strong style={{ color: selectedOption === currentQuestion.answerIndex ? '#10b981' : '#f87171', display: 'block', marginBottom: '0.25rem' }}>
              {selectedOption === currentQuestion.answerIndex ? 'Correct Rune!' : 'Wrong Rune!'}
            </strong>
            <span style={{ color: '#9ca3af' }}>{currentQuestion.explanation}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ width: '100%' }}
          >
            {currentIndex === questions.length - 1 ? 'Finish Trial' : 'Next Challenge'}
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedOption === null}
          style={{ width: '100%' }}
        >
          Cast Answer
        </button>
      )}
    </div>
  );
};
