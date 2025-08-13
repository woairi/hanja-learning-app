import axios from 'axios';
import { Hanja, Question, Grade, AnswerResult } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const hanjaApi = {
  getGrades: (): Promise<Grade[]> => 
    api.get('/grades').then(res => res.data),
  
  getHanjaByGrade: (grade: string): Promise<Hanja[]> => 
    api.get(`/hanja/${grade}`).then(res => res.data),
  
  getHanjaByCharacter: (character: string): Promise<Hanja> => 
    api.get(`/hanja/character/${character}`).then(res => res.data),
  
  generateMultipleChoiceQuestions: (grade: string, count: number = 10, character?: string): Promise<Question[]> => 
    api.post(`/questions/multiple-choice/${grade}?count=${count}${character ? `&character=${character}` : ''}`).then(res => res.data),
  
  generateSubjectiveQuestions: (grade: string, count: number = 10): Promise<Question[]> => 
    api.post(`/questions/subjective/${grade}?count=${count}`).then(res => res.data),
  
  generateHanjaWordQuestions: (grade: string, count: number = 10): Promise<Question[]> => 
    api.post(`/questions/hanja-word/${grade}?count=${count}`).then(res => res.data),
  
  generateHanjaWordSubjectiveQuestions: (grade: string, count: number = 10): Promise<Question[]> => 
    api.post(`/questions/hanja-word-subjective/${grade}?count=${count}`).then(res => res.data),
  
  checkAnswer: (userAnswer: string, correctAnswer: string): Promise<AnswerResult> => 
    api.post('/check-answer', { user_answer: userAnswer, correct_answer: correctAnswer }).then(res => res.data),
};