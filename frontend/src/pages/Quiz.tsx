import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Question } from '../types';
import { saveQuizResult, QuizResult, saveWrongAnswer, WrongAnswer } from '../utils/storage';

const Quiz: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!grade) return;
      
      try {
        const data = await hanjaApi.generateMultipleChoiceQuestions(grade, 10);
        setQuestions(data);
        setAnswers(new Array(data.length).fill(''));
      } catch (error) {
        console.error('문제 생성 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [grade]);

  // 퀴즈 결과 저장
  useEffect(() => {
    if (showResult && grade && questions.length > 0) {
      const finalScore = correctCount;
      const percentage = Math.round((finalScore / questions.length) * 100);
      const studyTime = Math.floor((Date.now() - quizStartTime) / 1000);
      
      const result: QuizResult = {
        grade,
        type: 'multiple-choice',
        score: percentage,
        totalQuestions: questions.length,
        correctAnswers: finalScore,
        date: new Date().toISOString(),
        studyTime
      };
      saveQuizResult(result);
    }
  }, [showResult, grade, questions.length, correctCount, quizStartTime]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showAnswerResult) return;
    
    setSelectedAnswer(answer);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    
    setShowAnswerResult(true);
    
    if (answer === currentQuestion.answer) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
      // 틀린 문제 저장
      if (grade) {
        const wrongAnswer: WrongAnswer = {
          character: currentQuestion.character,
          grade,
          userAnswer: answer,
          correctAnswer: currentQuestion.answer,
          type: 'multiple-choice',
          date: new Date().toISOString(),
          attempts: 1
        };
        saveWrongAnswer(wrongAnswer);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || '');
      setShowAnswerResult(!!answers[currentQuestionIndex + 1]);
    } else {
      // 마지막 문제 완료 시 결과 화면으로 이동
      setShowResult(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || '');
      setShowAnswerResult(!!answers[currentQuestionIndex - 1]);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');

    setShowResult(false);
    setAnswers(new Array(questions.length).fill(''));
    setShowAnswerResult(false);
    setCorrectCount(0);
    setWrongCount(0);
    setQuizStartTime(Date.now());
  };

  if (loading) {
    return <div className="loading">문제를 생성하고 있습니다...</div>;
  }

  if (showResult) {
    const finalScore = correctCount;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <div className="quiz-result">
        <h1>퀴즈 완료!</h1>
        <div className="score">
          점수: {finalScore} / {questions.length} ({percentage}%)
        </div>
        <div className="actions">
          <button onClick={resetQuiz}>다시 풀기</button>
          <button onClick={() => window.location.href = `/study/${grade}`}>
            학습하기
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
        <h1>{grade} 문제 풀이</h1>
        <div className="progress">
          <div>정답: {correctCount} | 오답: {wrongCount}</div>
          <div>문제 {currentQuestionIndex + 1} / {questions.length}</div>
        </div>
      </div>

      <div className="question-card">
        <div className="hanja-character">{currentQuestion.character}</div>
        <div className="question">{currentQuestion.question}</div>
        <div className="options">
          {currentQuestion.options?.map((option, index) => {
            let className = 'option';
            if (selectedAnswer === option) {
              className += ' selected';
            }
            if (showAnswerResult) {
              if (option === currentQuestion.answer) {
                className += ' correct';
              } else if (selectedAnswer === option && option !== currentQuestion.answer) {
                className += ' wrong';
              }
            }
            
            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswerSelect(option)}
                disabled={showAnswerResult}
              >
                {index + 1}. {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="navigation">
        <button onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
          이전
        </button>
        <button 
          onClick={nextQuestion} 
          disabled={!showAnswerResult}
        >
          {currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;