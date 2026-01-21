// 클라이밍장 프리셋
// 난이도 순서: 어려움 → 쉬움 (배열 앞이 가장 어려움)

export const PRESETS = {
  damjang: {
    name: '담장',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'white', name: '흰색', color: '#f5f5f5', baseScore: 100 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 70 },
      { id: 'navy', name: '남색', color: '#1e40af', baseScore: 60 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 40 },
    ]
  },
  theclimb: {
    name: '더클라임',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 120 },
      { id: 'orange', name: '주황', color: '#ea580c', baseScore: 90 },
      { id: 'yellow', name: '노랑', color: '#eab308', baseScore: 70 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 50 },
      { id: 'blue', name: '파랑', color: '#2563eb', baseScore: 30 },
    ]
  },
  climbingpark: {
    name: '클라이밍파크',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 120 },
      { id: 'blue', name: '파랑', color: '#2563eb', baseScore: 90 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 60 },
      { id: 'yellow', name: '노랑', color: '#eab308', baseScore: 40 },
    ]
  },
  seoulforest: {
    name: '서울숲클라이밍',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'pink', name: '핑크', color: '#ec4899', baseScore: 110 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 80 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 55 },
      { id: 'blue', name: '파랑', color: '#2563eb', baseScore: 35 },
    ]
  },
  stones: {
    name: '스톤즈',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'white', name: '흰색', color: '#f5f5f5', baseScore: 120 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 90 },
      { id: 'blue', name: '파랑', color: '#2563eb', baseScore: 60 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 35 },
    ]
  },
  seoulboulders: {
    name: '서울볼더스',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 110 },
      { id: 'orange', name: '주황', color: '#ea580c', baseScore: 80 },
      { id: 'yellow', name: '노랑', color: '#eab308', baseScore: 55 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 35 },
    ]
  },
  theplastic: {
    name: '더플라스틱',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 110 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 80 },
      { id: 'blue', name: '파랑', color: '#2563eb', baseScore: 55 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 35 },
    ]
  },
  sonsangwon: {
    name: '손상원클라이밍',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 140 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 110 },
      { id: 'orange', name: '주황', color: '#ea580c', baseScore: 80 },
      { id: 'yellow', name: '노랑', color: '#eab308', baseScore: 55 },
      { id: 'white', name: '흰색', color: '#f5f5f5', baseScore: 35 },
    ]
  }
};

// 기본 팀 색상
export const TEAM_COLORS = [
  { id: 'red', name: '레드', color: '#ef4444', bg: '#fef2f2' },
  { id: 'blue', name: '블루', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'green', name: '그린', color: '#22c55e', bg: '#f0fdf4' },
  { id: 'orange', name: '오렌지', color: '#f97316', bg: '#fff7ed' },
];

// 기본 게임 설정
export const DEFAULT_SETTINGS = {
  multipliers: {
    challenge: 1.5,  // 도전 (+1단계)
    normal: 1.0,     // 적정 (본인 레벨)
    easy: 0.5        // 기본 (-1단계)
  },
  range: 1,          // 집계 범위 ±1
  maxProblems: 10,   // 최대 집계 문제 수
  teamCount: 2       // 팀 수
};
