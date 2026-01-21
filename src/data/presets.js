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
      { id: 'brown', name: '갈색', color: '#92400e', baseScore: 150 },
      { id: 'gray', name: '회색', color: '#6b7280', baseScore: 120 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 90 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 70 },
      { id: 'navy', name: '남색', color: '#1e40af', baseScore: 50 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 30 },
    ]
  },
  climbingpark: {
    name: '클라이밍파크',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'gray', name: '회색', color: '#6b7280', baseScore: 120 },
      { id: 'brown', name: '갈색', color: '#92400e', baseScore: 90 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 70 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 50 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 30 },
    ]
  },
  seoulforest: {
    name: '서울숲클라이밍',
    levels: [
      { id: 'pink', name: '핑크', color: '#ec4899', baseScore: 150 },
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 120 },
      { id: 'brown', name: '갈색', color: '#92400e', baseScore: 90 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 70 },
      { id: 'navy', name: '남색', color: '#1e40af', baseScore: 50 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 30 },
    ]
  },
  stones: {
    name: '스톤즈',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'white', name: '흰색', color: '#f5f5f5', baseScore: 120 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 90 },
      { id: 'navy', name: '남색', color: '#1e40af', baseScore: 70 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 50 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 30 },
    ]
  },
  seoulboulders: {
    name: '서울볼더스',
    levels: [
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 150 },
      { id: 'white', name: '흰색', color: '#f5f5f5', baseScore: 120 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 90 },
      { id: 'navy', name: '남색', color: '#1e40af', baseScore: 70 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 50 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 30 },
    ]
  },
  theplastic: {
    name: '더플라스틱',
    levels: [
      { id: 'gray', name: '회색', color: '#6b7280', baseScore: 150 },
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 120 },
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 90 },
      { id: 'blue', name: '파랑', color: '#3b82f6', baseScore: 70 },
      { id: 'sky', name: '하늘', color: '#0ea5e9', baseScore: 50 },
      { id: 'green', name: '초록', color: '#16a34a', baseScore: 30 },
    ]
  },
  sonsangwon: {
    name: '손상원클라이밍',
    levels: [
      { id: 'purple', name: '보라', color: '#9333ea', baseScore: 150 },
      { id: 'pink', name: '핑크', color: '#ec4899', baseScore: 120 },
      { id: 'brown', name: '갈색', color: '#92400e', baseScore: 90 },
      { id: 'gray', name: '회색', color: '#6b7280', baseScore: 70 },
      { id: 'black', name: '검정', color: '#1a1a1a', baseScore: 50 },
      { id: 'red', name: '빨강', color: '#dc2626', baseScore: 30 },
    ]
  }
};

export const TEAM_COLORS = [
  { id: 'red', name: '레드', color: '#ef4444', bg: '#fef2f2' },
  { id: 'blue', name: '블루', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'green', name: '그린', color: '#22c55e', bg: '#f0fdf4' },
  { id: 'orange', name: '오렌지', color: '#f97316', bg: '#fff7ed' },
];

export const DEFAULT_SETTINGS = {
  multipliers: {
    challenge: 1.5,
    normal: 1.0,
    easy: 0.5
  },
  range: 1,
  maxProblems: 10,
  teamCount: 2
};
