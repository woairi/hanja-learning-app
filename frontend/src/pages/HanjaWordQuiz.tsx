import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Question } from '../types';
import { saveQuizResult, QuizResult } from '../utils/storage';

const HanjaWordQuiz: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!grade) return;
      
      try {
        const data = await hanjaApi.generateHanjaWordQuestions(grade, 10);
        setQuestions(data);
      } catch (error) {
        console.error('문제 생성 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [grade]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    
    setSelectedAnswer(answer);
    setAnswered(true);
    
    if (answer === currentQuestion.answer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setAnswered(false);
    setCorrectCount(0);
    setShowResult(false);
  };

  if (loading) {
    return <div className="loading">문제를 생성하고 있습니다...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="error">
        <p>해당 급수에서 사용할 수 있는 한자어가 부족합니다.</p>
        <button onClick={() => window.location.href = '/'}>홈으로</button>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    React.useEffect(() => {
      if (grade) {
        const studyTime = Math.floor((Date.now() - quizStartTime) / 1000);
        const result: QuizResult = {
          grade,
          type: 'hanja-word',
          score: percentage,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          date: new Date().toISOString(),
          studyTime
        };
        saveQuizResult(result);
      }
    }, []);
    
    return (
      <div className="quiz-result">
        <h1>한자어 독음 퀴즈 완료!</h1>
        <div className="score">
          정답: {correctCount} / {questions.length} ({percentage}%)
        </div>
        <div className="actions">
          <button onClick={resetQuiz}>다시 풀기</button>
          <button onClick={() => window.location.href = `/quiz/${grade}`}>
            객관식 문제
          </button>
          <button onClick={() => window.location.href = '/'}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="error">문제를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <h1>{grade} 한자어 독음 문제</h1>
        <div className="progress">
          <div>문제 {currentQuestionIndex + 1} / {questions.length}</div>
          <div>정답: {correctCount} | 오답: {currentQuestionIndex + 1 - correctCount - (answered ? 0 : 1)}</div>
        </div>
      </div>

      <div className="question-card">
        <div className="question">{currentQuestion.question}</div>
        <div className="options">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              className={`option ${
                selectedAnswer === option ? 'selected' : ''
              } ${
                answered && option === currentQuestion.answer ? 'correct' : ''
              } ${
                answered && selectedAnswer === option && option !== currentQuestion.answer ? 'wrong' : ''
              }`}
              onClick={() => handleAnswerSelect(option)}
              disabled={answered}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="navigation">
        <button onClick={nextQuestion} disabled={!answered}>
          {currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default HanjaWordQuiz;