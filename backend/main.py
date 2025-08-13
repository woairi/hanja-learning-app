from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd
import random
from contextlib import asynccontextmanager

# 데이터 모델
class HanjaModel(BaseModel):
    grade: str
    reading: str
    character: str
    meaning: str

class QuestionModel(BaseModel):
    id: int
    type: str
    question: str
    options: Optional[List[str]] = None
    answer: str
    character: str

class AnswerCheckModel(BaseModel):
    user_answer: str
    correct_answer: str

# 전역 변수로 데이터 저장
hanja_data: List[HanjaModel] = []
hanja_word_data: List[dict] = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작 시 CSV 데이터 로드"""
    global hanja_data, hanja_word_data
    try:
        # 한자 데이터 로드
        df = pd.read_csv("hanja.csv", on_bad_lines='skip', encoding='utf-8')
        hanja_data = [
            HanjaModel(
                grade=row["급수"],
                reading=row["대표음"],
                character=row["한자"],
                meaning=row["대표훈"]
            )
            for _, row in df.iterrows()
        ]
        print(f"한자 데이터 {len(hanja_data)}개 로드 완료")
        
        # 한자어 데이터 로드
        word_df = pd.read_csv("hanjaword.csv", encoding='utf-8')
        hanja_word_data = [
            {
                "grade": row["급수"],
                "korean": row["어휘(한글)"],
                "hanja": row["한자"]
            }
            for _, row in word_df.iterrows()
        ]
        print(f"한자어 데이터 {len(hanja_word_data)}개 로드 완료")
    except Exception as e:
        print(f"데이터 로드 오류: {e}")
        hanja_data = []
        hanja_word_data = []
    
    yield
    # 종료 시 정리 작업
    hanja_data.clear()
    hanja_word_data.clear()

app = FastAPI(title="한자 학습 API", version="1.0.0", lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "한자 학습 API"}

@app.get("/api/grades", response_model=List[str])
async def get_grades():
    """급수 목록 조회"""
    grades = list(set(hanja.grade for hanja in hanja_data))
    grade_order = ["준8급", "8급", "준7급", "7급", "준6급", "6급", "준5급", "5급", "준4급", "4급"]
    return [grade for grade in grade_order if grade in grades]

@app.get("/api/hanja/{grade}", response_model=List[HanjaModel])
async def get_hanja_by_grade(grade: str):
    """급수별 한자 목록 조회"""
    return [hanja for hanja in hanja_data if hanja.grade == grade]

@app.get("/api/hanja/character/{character}", response_model=HanjaModel)
async def get_hanja_by_character(character: str):
    """특정 한자 상세 조회"""
    for hanja in hanja_data:
        if hanja.character == character:
            return hanja
    return None

@app.post("/api/questions/multiple-choice/{grade}", response_model=List[QuestionModel])
async def generate_multiple_choice_questions(grade: str, count: int = 10, character: Optional[str] = None):
    """객관식 문제 생성"""
    grade_hanja = [hanja for hanja in hanja_data if hanja.grade == grade]
    
    if character:
        # 특정 한자로 문제 생성
        specific_hanja = [h for h in grade_hanja if h.character == character]
        if not specific_hanja:
            return []
        selected_hanja = specific_hanja
    else:
        # 랜덤 한자 선택
        if len(grade_hanja) < count:
            count = len(grade_hanja)
        selected_hanja = random.sample(grade_hanja, count)
    
    questions = []
    
    for i, hanja in enumerate(selected_hanja):
        # 뜻과 음을 고르는 문제
        wrong_options = random.sample(
            [h for h in grade_hanja if h.character != hanja.character], 3
        )
        options = [f"{hanja.reading}, {hanja.meaning}"] + [
            f"{h.reading}, {h.meaning}" for h in wrong_options
        ]
        random.shuffle(options)
        
        questions.append(QuestionModel(
            id=i + 1,
            type="meaning_reading",
            question=f"다음 한자의 음과 뜻을 고르시오: {hanja.character}",
            options=options,
            answer=f"{hanja.reading}, {hanja.meaning}",
            character=hanja.character
        ))
    
    return questions

@app.post("/api/questions/subjective/{grade}", response_model=List[QuestionModel])
async def generate_subjective_questions(grade: str, count: int = 10):
    """주관식 문제 생성"""
    grade_hanja = [hanja for hanja in hanja_data if hanja.grade == grade]
    if len(grade_hanja) < count:
        count = len(grade_hanja)
    
    selected_hanja = random.sample(grade_hanja, count)
    questions = []
    
    for i, hanja in enumerate(selected_hanja):
        questions.append(QuestionModel(
            id=i + 1,
            type="subjective",
            question=f"다음 한자의 음과 뜻을 쓰시오: {hanja.character}",
            options=None,
            answer=f"{hanja.reading}, {hanja.meaning}",
            character=hanja.character
        ))
    
    return questions

@app.post("/api/questions/hanja-word/{grade}", response_model=List[QuestionModel])
async def generate_hanja_word_questions(grade: str, count: int = 10):
    """한자어 독음 객관식 문제 생성 (6급 이상만)"""
    # 6급 이상만 한자어 문제 제공
    allowed_grades = ["6급", "준5급", "5급", "준4급", "4급"]
    if grade not in allowed_grades:
        return []
    
    # 해당 급수의 한자어 가져오기
    grade_words = [word for word in hanja_word_data if word["grade"] == grade]
    
    if len(grade_words) < count:
        count = len(grade_words)
    
    if count == 0:
        return []
    
    selected_words = random.sample(grade_words, count)
    questions = []
    
    for i, word_data in enumerate(selected_words):
        hanja_word = word_data["hanja"]
        correct_reading = word_data["korean"]
        
        # 오답 선택지 생성 (같은 급수의 다른 한자어 독음)
        other_words = [w["korean"] for w in grade_words if w["korean"] != correct_reading]
        
        wrong_readings = []
        if len(other_words) >= 3:
            wrong_readings = random.sample(other_words, 3)
        else:
            wrong_readings = other_words[:]
            # 부족한 경우 다른 급수에서 가져오기
            all_other_words = [w["korean"] for w in hanja_word_data 
                             if w["korean"] != correct_reading and w["korean"] not in wrong_readings]
            while len(wrong_readings) < 3 and all_other_words:
                wrong_readings.append(random.choice(all_other_words))
                all_other_words = [w for w in all_other_words if w != wrong_readings[-1]]
        
        options = [correct_reading] + wrong_readings[:3]
        random.shuffle(options)
        
        questions.append(QuestionModel(
            id=i + 1,
            type="hanja_word",
            question=f"다음 한자어의 독음을 고르시오: {hanja_word}",
            options=options,
            answer=correct_reading,
            character=hanja_word
        ))
    
    return questions

class AnswerCheckModel(BaseModel):
    user_answer: str
    correct_answer: str

def calculate_similarity(user_input: str, correct_answer: str) -> float:
    """문자열 유사도 계산"""
    if not user_input or not correct_answer:
        return 0.0
    
    def levenshtein_distance(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]
    
    distance = levenshtein_distance(user_input.lower(), correct_answer.lower())
    max_len = max(len(user_input), len(correct_answer))
    return 1.0 - (distance / max_len) if max_len > 0 else 1.0

@app.post("/api/check-answer")
async def check_answer(answer_data: AnswerCheckModel):
    """주관식 답안 채점 (유사도 검사 포함)"""
    user_answer = answer_data.user_answer.strip()
    correct_answer = answer_data.correct_answer.strip()
    
    if user_answer.lower() == correct_answer.lower():
        return {"is_correct": True, "score": 100, "similarity": 1.0}
    
    if ", " in correct_answer:
        correct_parts = correct_answer.split(", ")
        user_parts = user_answer.split(", ") if ", " in user_answer else [user_answer]
        
        score = 0
        total_similarity = 0.0
        
        if len(user_parts) >= 1 and len(correct_parts) >= 1:
            similarity1 = calculate_similarity(user_parts[0].strip(), correct_parts[0].strip())
            total_similarity += similarity1
            if similarity1 >= 0.8:
                score += 50
            elif similarity1 >= 0.6:
                score += 30
        
        if len(user_parts) >= 2 and len(correct_parts) >= 2:
            similarity2 = calculate_similarity(user_parts[1].strip(), correct_parts[1].strip())
            total_similarity += similarity2
            if similarity2 >= 0.8:
                score += 50
            elif similarity2 >= 0.6:
                score += 30
        else:
            total_similarity += 1.0
        
        avg_similarity = total_similarity / 2.0
        return {"is_correct": score >= 80, "score": min(score, 100), "similarity": avg_similarity}
    
    similarity = calculate_similarity(user_answer, correct_answer)
    if similarity >= 0.9:
        return {"is_correct": True, "score": 100, "similarity": similarity}
    elif similarity >= 0.8:
        return {"is_correct": True, "score": 90, "similarity": similarity}
    elif similarity >= 0.7:
        return {"is_correct": False, "score": 70, "similarity": similarity}
    elif similarity >= 0.6:
        return {"is_correct": False, "score": 50, "similarity": similarity}
    
    return {"is_correct": False, "score": 0, "similarity": similarity}

@app.post("/api/questions/hanja-word-subjective/{grade}", response_model=List[QuestionModel])
async def generate_hanja_word_subjective_questions(grade: str, count: int = 10):
    """한자어 독음 주관식 문제 생성"""
    allowed_grades = ["6급", "준5급", "5급", "준4급", "4급"]
    if grade not in allowed_grades:
        return []
    
    grade_words = [word for word in hanja_word_data if word["grade"] == grade]
    if len(grade_words) < count:
        count = len(grade_words)
    if count == 0:
        return []
    
    selected_words = random.sample(grade_words, count)
    questions = []
    
    for i, word_data in enumerate(selected_words):
        questions.append(QuestionModel(
            id=i + 1,
            type="hanja_word_subjective",
            question=f"다음 한자어의 독음을 쓰시오: {word_data['hanja']}",
            options=None,
            answer=word_data["korean"],
            character=word_data["hanja"]
        ))
    
    return questions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7781)