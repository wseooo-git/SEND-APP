import { useState, useEffect, useCallback } from 'react';
import { database, ref, set, get, onValue, remove, update } from './firebase';
import { PRESETS, TEAM_COLORS, DEFAULT_SETTINGS } from './data/presets';

// 유틸리티
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 아이콘 컴포넌트
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    back: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    trophy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  };
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name]}
    </svg>
  );
};

export default function App() {
  const [view, setView] = useState('home');
  const [partyCode, setPartyCode] = useState('');
  const [party, setParty] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 파티 데이터 실시간 구독
  useEffect(() => {
    if (!partyCode) return;
    const partyRef = ref(database, `parties/${partyCode}`);
    const unsubscribe = onValue(partyRef, (snapshot) => {
      const data = snapshot.val();
      setParty(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [partyCode]);

  // 파티 저장
  const saveParty = async (data) => {
    await set(ref(database, `parties/${partyCode}`), data);
  };

  // 점수 계산
  const calculateScore = (memberLevel, problemLevel, levels, settings) => {
    const memberIdx = levels.findIndex(l => l.id === memberLevel);
    const problemIdx = levels.findIndex(l => l.id === problemLevel);
    const diff = memberIdx - problemIdx;
    
    if (Math.abs(diff) > (settings?.range || 1)) return 0;
    
    const base = levels[problemIdx]?.baseScore || 0;
    const mult = settings?.multipliers || DEFAULT_SETTINGS.multipliers;
    
    if (diff > 0) return Math.round(base * mult.challenge);
    if (diff === 0) return Math.round(base * mult.normal);
    return Math.round(base * mult.easy);
  };

  // 상위 N개 점수 합계
  const getTopScores = (scores, max = 10) => {
    if (!scores || scores.length === 0) return { total: 0, counted: [], uncounted: [] };
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const counted = sorted.slice(0, max);
    const uncounted = sorted.slice(max);
    return {
      total: counted.reduce((sum, s) => sum + s.score, 0),
      counted,
      uncounted
    };
  };

  // ===== 홈 화면 =====
  const HomeView = () => (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-16 animate-in">
        <h1 className="font-display text-6xl font-800 tracking-tight mb-3">SEND</h1>
        <p className="text-gray-500 text-lg">클라이밍 파티 점수 관리</p>
      </div>
      
      <div className="w-full max-w-xs space-y-3 animate-in" style={{animationDelay: '0.1s'}}>
        <button
          onClick={() => setView('create')}
          className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          <Icon name="plus" className="w-5 h-5" />
          파티 만들기
        </button>
        
        <button
          onClick={() => setView('join')}
          className="w-full py-4 bg-white text-black font-medium rounded-lg border border-gray-200 hover:border-gray-400 transition flex items-center justify-center gap-2"
        >
          파티 참여하기
          <Icon name="arrow" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // ===== 파티 생성 =====
  const CreateView = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
      name: '',
      venue: '',
      date: new Date().toISOString().split('T')[0],
      presetKey: '',
      levels: [],
      settings: { ...DEFAULT_SETTINGS },
      teamCount: 2,
      teams: {}
    });

    const handlePresetSelect = (key) => {
      if (key === 'custom') {
        setForm(f => ({ ...f, presetKey: 'custom', levels: [] }));
      } else {
        setForm(f => ({ ...f, presetKey: key, levels: [...PRESETS[key].levels] }));
      }
    };

    const addCustomLevel = () => {
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#1a1a1a', '#f5f5f5'];
      const newLevel = {
        id: `level_${Date.now()}`,
        name: '',
        color: colors[form.levels.length % colors.length],
        baseScore: Math.max(0, 150 - form.levels.length * 30)
      };
      setForm(f => ({ ...f, levels: [...f.levels, newLevel] }));
    };

    const updateLevel = (idx, field, value) => {
      const newLevels = [...form.levels];
      newLevels[idx] = { ...newLevels[idx], [field]: value };
      setForm(f => ({ ...f, levels: newLevels }));
    };

    const removeLevel = (idx) => {
      setForm(f => ({ ...f, levels: f.levels.filter((_, i) => i !== idx) }));
    };

    const initTeams = () => {
      const teams = {};
      for (let i = 0; i < form.teamCount; i++) {
        const tc = TEAM_COLORS[i];
        teams[`team${i + 1}`] = { name: tc.name, color: tc.color, bg: tc.bg, leader: '', members: [] };
      }
      setForm(f => ({ ...f, teams }));
    };

    useEffect(() => {
      if (step === 3) initTeams();
    }, [step, form.teamCount]);

    const createParty = async () => {
      setLoading(true);
      const code = generateCode();
      const aCode = generateCode();
      
      const partyData = {
        ...form,
        code,
        adminCode: aCode,
        status: 'waiting',
        participants: {},
        linkedPairs: [],
        createdAt: new Date().toISOString()
      };
      
      await set(ref(database, `parties/${code}`), partyData);
      setPartyCode(code);
      setAdminCode(aCode);
      setIsAdmin(true);
      setView('lobby');
    };

    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="max-w-lg mx-auto">
          <button onClick={() => step > 1 ? setStep(step - 1) : setView('home')} className="mb-6 flex items-center gap-1 text-gray-500 hover:text-black transition">
            <Icon name="back" className="w-5 h-5" />
            뒤로
          </button>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-black' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="animate-in">
              <h2 className="text-2xl font-semibold mb-6">파티 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">파티 이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="예: 당근 클라이밍 크루 1월 파티"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">장소</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    placeholder="예: 신촌담장"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">날짜</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.venue}
                className="w-full mt-8 py-4 bg-black text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <h2 className="text-2xl font-semibold mb-6">난이도 설정</h2>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`p-4 text-left rounded-lg border transition ${form.presetKey === key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs opacity-60 mt-1">{preset.levels.length}단계</div>
                  </button>
                ))}
                <button
                  onClick={() => handlePresetSelect('custom')}
                  className={`p-4 text-left rounded-lg border transition ${form.presetKey === 'custom' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                >
                  <div className="font-medium">커스텀</div>
                  <div className="text-xs opacity-60 mt-1">직접 설정</div>
                </button>
              </div>

              {form.presetKey && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">난이도 목록</span>
                    <button onClick={addCustomLevel} className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                      <Icon name="plus" className="w-4 h-4" />
                      추가
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {form.levels.map((level, idx) => (
                      <div key={level.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: level.color, borderColor: level.color === '#f5f5f5' ? '#ddd' : level.color }} />
                        <input
                          type="text"
                          value={level.name}
                          onChange={e => updateLevel(idx, 'name', e.target.value)}
                          placeholder="난이도 이름"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                        />
                        <input
                          type="number"
                          value={level.baseScore}
                          onChange={e => updateLevel(idx, 'baseScore', parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded text-sm text-center"
                        />
                        <span className="text-xs text-gray-400">점</span>
                        <button onClick={() => removeLevel(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <Icon name="close" className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {form.levels.length === 0 && (
                    <p className="text-center text-gray-400 py-4 text-sm">난이도를 추가해주세요</p>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={form.levels.length < 2}
                className="w-full py-4 bg-black text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <h2 className="text-2xl font-semibold mb-6">게임 설정</h2>
              
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm text-gray-500 mb-3">팀 수</label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        onClick={() => {
                          setForm(f => ({ ...f, teamCount: n }));
                          setTimeout(initTeams, 0);
                        }}
                        className={`flex-1 py-3 rounded-lg border transition ${form.teamCount === n ? 'border-black bg-black text-white' : 'border-gray-200'}`}
                      >
                        {n}팀
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm text-gray-500 mb-3">최대 집계 문제 수</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={form.settings.maxProblems}
                      onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, maxProblems: parseInt(e.target.value) } }))}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-medium">{form.settings.maxProblems}개</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm text-gray-500 mb-3">점수 배율</label>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>도전 (+1단계)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={form.settings.multipliers.challenge}
                          onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, multipliers: { ...f.settings.multipliers, challenge: parseFloat(e.target.value) || 1 } } }))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                        />
                        <span className="text-gray-400">배</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>적정 (본인 레벨)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={form.settings.multipliers.normal}
                          onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, multipliers: { ...f.settings.multipliers, normal: parseFloat(e.target.value) || 1 } } }))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                        />
                        <span className="text-gray-400">배</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>기본 (-1단계)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={form.settings.multipliers.easy}
                          onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, multipliers: { ...f.settings.multipliers, easy: parseFloat(e.target.value) || 1 } } }))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                        />
                        <span className="text-gray-400">배</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={createParty}
                disabled={loading}
                className="w-full mt-8 py-4 bg-black text-white font-medium rounded-lg disabled:bg-gray-300"
              >
                {loading ? '생성 중...' : '파티 생성'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== 파티 참여 =====
  const JoinView = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const joinParty = async () => {
      const upperCode = code.toUpperCase();
      setLoading(true);
      setError('');
      
      const snapshot = await get(ref(database, `parties/${upperCode}`));
      if (snapshot.exists()) {
        setPartyCode(upperCode);
        setView('lobby');
      } else {
        setError('파티를 찾을 수 없습니다');
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-[#fafafa] p-6">
        <div className="max-w-md mx-auto">
          <button onClick={() => setView('home')} className="mb-6 flex items-center gap-1 text-gray-500 hover:text-black transition">
            <Icon name="back" className="w-5 h-5" />
            뒤로
          </button>

          <h2 className="text-2xl font-semibold mb-8">파티 참여</h2>

          <div className="animate-in">
            <label className="block text-sm text-gray-500 mb-2">파티 코드</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="6자리 코드 입력"
              maxLength={6}
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg text-center text-2xl font-display tracking-widest uppercase"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={joinParty}
              disabled={code.length !== 6 || loading}
              className="w-full mt-6 py-4 bg-black text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '확인 중...' : '참여하기'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 로비 =====
  const LobbyView = () => {
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [pwInput, setPwInput] = useState('');
    const [pwError, setPwError] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', level: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    if (!party) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;

    const handleAdminLogin = () => {
      if (pwInput === party.adminCode) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setPwError(false);
      } else {
        setPwError(true);
      }
      setPwInput('');
    };

    const addParticipant = async () => {
      if (!newMember.name || !newMember.level) return;
      const newParticipants = {
        ...party.participants,
        [newMember.name]: { level: newMember.level, team: null, isLeader: false, scores: [], approved: isAdmin }
      };
      await saveParty({ ...party, participants: newParticipants });
      setNewMember({ name: '', level: '' });
      setShowAddForm(false);
    };

    const removeParticipant = async (name) => {
      const { [name]: _, ...rest } = party.participants;
      await saveParty({ ...party, participants: rest });
    };

    const toggleLeader = async (name) => {
      const p = party.participants[name];
      const newParticipants = {
        ...party.participants,
        [name]: { ...p, isLeader: !p.isLeader }
      };
      await saveParty({ ...party, participants: newParticipants });
    };

    const approveParticipant = async (name) => {
      const newParticipants = {
        ...party.participants,
        [name]: { ...party.participants[name], approved: true }
      };
      await saveParty({ ...party, participants: newParticipants });
    };

    const startGame = () => {
      setView('teams');
    };

    const goToGame = () => {
      setView('game');
    };

    const participants = Object.entries(party.participants || {});
    const approved = participants.filter(([_, p]) => p.approved);
    const pending = participants.filter(([_, p]) => !p.approved);

    return (
      <div className="min-h-screen bg-[#fafafa]">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => { setPartyCode(''); setParty(null); setIsAdmin(false); setView('home'); }} className="text-gray-500">
              <Icon name="back" className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="font-semibold">{party.name}</h1>
              <p className="text-xs text-gray-500">{party.venue}</p>
            </div>
            <button onClick={() => setShowAdminLogin(true)} className={`p-2 rounded-lg ${isAdmin ? 'bg-black text-white' : 'text-gray-400'}`}>
              <Icon name="settings" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          {/* 파티 코드 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-2">파티 코드</p>
            <p className="text-4xl font-display font-bold tracking-widest">{partyCode}</p>
            {isAdmin && (
              <p className="text-xs text-gray-400 mt-4">관리자 코드: {party.adminCode}</p>
            )}
          </div>

          {/* 상태에 따른 버튼 */}
          {party.status === 'waiting' && isAdmin && (
            <button
              onClick={startGame}
              disabled={approved.length < 2}
              className="w-full py-4 bg-black text-white font-medium rounded-lg mb-6 disabled:bg-gray-300"
            >
              팀 배정하기 ({approved.length}명)
            </button>
          )}

          {party.status === 'playing' && (
            <button onClick={goToGame} className="w-full py-4 bg-black text-white font-medium rounded-lg mb-6">
              게임 참여하기
            </button>
          )}

          {/* 참가자 추가 */}
          {party.status === 'waiting' && (
            <div className="mb-6">
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-black transition flex items-center justify-center gap-2">
                  <Icon name="plus" className="w-5 h-5" />
                  참가자 {isAdmin ? '등록' : '신청'}
                </button>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 animate-in">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))}
                      placeholder="이름"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <select
                      value={newMember.level}
                      onChange={e => setNewMember(m => ({ ...m, level: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="">난이도</option>
                      {party.levels.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-gray-500">
                      취소
                    </button>
                    <button onClick={addParticipant} disabled={!newMember.name || !newMember.level} className="flex-1 py-2 bg-black text-white rounded-lg disabled:bg-gray-300">
                      {isAdmin ? '등록' : '신청'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 승인 대기 (관리자만) */}
          {isAdmin && pending.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">승인 대기 ({pending.length})</h3>
              <div className="space-y-2">
                {pending.map(([name, p]) => (
                  <div key={name} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: party.levels.find(l => l.id === p.level)?.color + '20', color: party.levels.find(l => l.id === p.level)?.color }}>
                        {party.levels.find(l => l.id === p.level)?.name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveParticipant(name)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Icon name="check" className="w-5 h-5" />
                      </button>
                      <button onClick={() => removeParticipant(name)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 참가자 목록 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">참가자 ({approved.length})</h3>
            {approved.length === 0 ? (
              <p className="text-center text-gray-400 py-8">아직 참가자가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {approved.map(([name, p]) => (
                  <div key={name} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.isLeader && <span className="text-yellow-500">★</span>}
                      <span className="font-medium">{name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: party.levels.find(l => l.id === p.level)?.color + '20', color: party.levels.find(l => l.id === p.level)?.color }}>
                        {party.levels.find(l => l.id === p.level)?.name}
                      </span>
                    </div>
                    {isAdmin && party.status === 'waiting' && (
                      <div className="flex gap-1">
                        <button onClick={() => toggleLeader(name)} className={`p-1 rounded ${p.isLeader ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}>
                          ★
                        </button>
                        <button onClick={() => removeParticipant(name)} className="p-1 text-gray-400 hover:text-red-500">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 관리자 로그인 모달 */}
        {showAdminLogin && !isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowAdminLogin(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">관리자 인증</h3>
              <input
                type="password"
                value={pwInput}
                onChange={e => setPwInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                placeholder="관리자 코드"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-3"
                autoFocus
              />
              {pwError && <p className="text-red-500 text-sm mb-3">코드가 올바르지 않습니다</p>}
              <div className="flex gap-2">
                <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-3 text-gray-500">취소</button>
                <button onClick={handleAdminLogin} className="flex-1 py-3 bg-black text-white rounded-lg">확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== 팀 배정 =====
  const TeamsView = () => {
    const [teams, setTeams] = useState({});
    const [unassigned, setUnassigned] = useState([]);
    const [linked, setLinked] = useState([]);
    const [selectedForLink, setSelectedForLink] = useState([]);
    const [dragItem, setDragItem] = useState(null);

    useEffect(() => {
      if (!party) return;
      const t = {};
      Object.keys(party.teams).forEach(k => {
        const leader = Object.entries(party.participants || {}).find(([_, p]) => p.isLeader && !Object.values(t).flat().includes(_))?.[0];
        t[k] = { ...party.teams[k], members: leader ? [leader] : [] };
      });
      const assigned = Object.values(t).flatMap(team => team.members);
      const un = Object.keys(party.participants || {}).filter(n => party.participants[n].approved && !assigned.includes(n));
      setTeams(t);
      setUnassigned(un);
      setLinked(party.linkedPairs || []);
    }, [party]);

    const handleDragStart = (name) => setDragItem(name);
    const handleDragEnd = () => setDragItem(null);

    const handleDrop = (targetTeam) => {
      if (!dragItem) return;
      
      // 연결된 짝 찾기
      const linkedPair = linked.find(pair => pair.includes(dragItem));
      const itemsToMove = linkedPair || [dragItem];
      
      const newTeams = { ...teams };
      const newUnassigned = unassigned.filter(n => !itemsToMove.includes(n));
      
      Object.keys(newTeams).forEach(k => {
        newTeams[k] = { ...newTeams[k], members: newTeams[k].members.filter(n => !itemsToMove.includes(n)) };
      });
      
      if (targetTeam) {
        newTeams[targetTeam] = { ...newTeams[targetTeam], members: [...newTeams[targetTeam].members, ...itemsToMove] };
      } else {
        newUnassigned.push(...itemsToMove);
      }
      
      setTeams(newTeams);
      setUnassigned(newUnassigned);
      setDragItem(null);
    };

    const toggleLink = (name) => {
      if (selectedForLink.includes(name)) {
        setSelectedForLink(selectedForLink.filter(n => n !== name));
      } else if (selectedForLink.length < 2) {
        const newSelected = [...selectedForLink, name];
        if (newSelected.length === 2) {
          const existingPair = linked.find(p => p.includes(newSelected[0]) || p.includes(newSelected[1]));
          if (existingPair) {
            setLinked(linked.filter(p => p !== existingPair));
          } else {
            setLinked([...linked, newSelected]);
          }
          setSelectedForLink([]);
        } else {
          setSelectedForLink(newSelected);
        }
      }
    };

    const isLinked = (name) => linked.some(p => p.includes(name));
    const getLinkedPartner = (name) => {
      const pair = linked.find(p => p.includes(name));
      return pair?.find(n => n !== name);
    };

    const autoAssign = () => {
      const newTeams = { ...teams };
      const teamKeys = Object.keys(newTeams);
      let pool = [...unassigned];
      
      // 연결된 짝부터 배정
      linked.forEach(pair => {
        const inPool = pair.filter(n => pool.includes(n));
        if (inPool.length === 2) {
          const minTeam = teamKeys.reduce((a, b) => newTeams[a].members.length <= newTeams[b].members.length ? a : b);
          newTeams[minTeam].members.push(...inPool);
          pool = pool.filter(n => !inPool.includes(n));
        }
      });
      
      // 나머지 랜덤 배정
      shuffle(pool).forEach(name => {
        const minTeam = teamKeys.reduce((a, b) => newTeams[a].members.length <= newTeams[b].members.length ? a : b);
        newTeams[minTeam].members.push(name);
      });
      
      setTeams(newTeams);
      setUnassigned([]);
    };

    const confirmTeams = async () => {
      const newParticipants = { ...party.participants };
      Object.entries(teams).forEach(([teamKey, team]) => {
        team.members.forEach(name => {
          if (newParticipants[name]) {
            newParticipants[name] = { ...newParticipants[name], team: teamKey };
          }
        });
      });
      
      await saveParty({
        ...party,
        teams,
        participants: newParticipants,
        linkedPairs: linked,
        status: 'playing'
      });
      setView('game');
    };

    if (!party) return null;

    const MemberCard = ({ name, inTeam = false }) => {
      const p = party.participants[name];
      const level = party.levels.find(l => l.id === p?.level);
      const partner = getLinkedPartner(name);
      
      return (
        <div
          draggable
          onDragStart={() => handleDragStart(name)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-move transition ${dragItem === name ? 'opacity-50 scale-105' : ''} ${selectedForLink.includes(name) ? 'ring-2 ring-black' : ''} ${isLinked(name) ? 'border-purple-400' : 'border-gray-200'}`}
        >
          {p?.isLeader && <span className="text-yellow-500 text-sm">★</span>}
          <span className="font-medium text-sm">{name}</span>
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: level?.color }} />
          {partner && <span className="text-xs text-purple-500">↔ {partner}</span>}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setView('lobby')} className="text-gray-500">
              <Icon name="back" className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">팀 배정</h1>
            <div className="w-5" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* 미배정 */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(null)}
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 min-h-[80px]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">미배정 ({unassigned.length})</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedForLink([])}
                  className={`text-xs px-3 py-1 rounded-full border transition ${selectedForLink.length > 0 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500'}`}
                >
                  <Icon name="link" className="w-3 h-3 inline mr-1" />
                  {selectedForLink.length > 0 ? `${selectedForLink.length}/2 선택됨` : '같은 팀 묶기'}
                </button>
                <button onClick={autoAssign} className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-black hover:text-black">
                  자동 배정
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {unassigned.map(name => (
                <div key={name} onClick={() => toggleLink(name)}>
                  <MemberCard name={name} />
                </div>
              ))}
              {unassigned.length === 0 && (
                <p className="text-gray-400 text-sm w-full text-center py-2">모든 참가자가 배정되었습니다</p>
              )}
            </div>
          </div>

          {/* 팀 영역 */}
          <div className={`grid gap-4 ${Object.keys(teams).length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {Object.entries(teams).map(([key, team]) => (
              <div
                key={key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(key)}
                className="bg-white border-2 rounded-xl p-4 min-h-[200px] transition"
                style={{ borderColor: team.color + '60' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="font-semibold">{team.name}</span>
                  <span className="text-sm text-gray-400">({team.members.length}명)</span>
                </div>
                <div className="space-y-2">
                  {team.members.map(name => (
                    <MemberCard key={name} name={name} inTeam />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 연결 표시 */}
          {linked.length > 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">
                <Icon name="link" className="w-4 h-4 inline mr-1" />
                같은 팀으로 묶인 참가자: {linked.map(pair => pair.join(' ↔ ')).join(', ')}
              </p>
            </div>
          )}

          <button
            onClick={confirmTeams}
            disabled={unassigned.length > 0}
            className="w-full mt-6 py-4 bg-black text-white font-medium rounded-lg disabled:bg-gray-300"
          >
            배정 완료
          </button>
        </div>
      </div>
    );
  };

  // ===== 게임 화면 =====
  const GameView = () => {
    if (!party) return null;

    if (!selectedUser) {
      const byLevel = {};
      party.levels.forEach(l => byLevel[l.id] = []);
      Object.entries(party.participants || {}).forEach(([name, p]) => {
        if (p.approved && p.team && byLevel[p.level]) {
          byLevel[p.level].push({ name, ...p });
        }
      });

      return (
        <div className="min-h-screen bg-[#fafafa]">
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <button onClick={() => setView('lobby')} className="text-gray-500">
                <Icon name="back" className="w-5 h-5" />
              </button>
              <h1 className="font-semibold">{party.name}</h1>
              <button onClick={() => setView('board')} className="text-gray-500">
                <Icon name="trophy" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-semibold mb-6">이름을 선택하세요</h2>
            
            {party.levels.map(level => {
              const members = byLevel[level.id] || [];
              if (members.length === 0) return null;
              
              return (
                <div key={level.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: level.color, border: level.color === '#f5f5f5' ? '1px solid #ddd' : 'none' }} />
                    <span className="text-sm font-medium text-gray-500">{level.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {members.map(m => {
                      const team = party.teams[m.team];
                      return (
                        <button
                          key={m.name}
                          onClick={() => setSelectedUser(m.name)}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border-2 transition hover:border-gray-400"
                          style={{ borderColor: team?.color + '40' }}
                        >
                          <div className="flex items-center gap-2">
                            {m.isLeader && <span className="text-yellow-500">★</span>}
                            <span className="font-medium">{m.name}</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: team?.bg, color: team?.color }}>
                            {team?.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 점수 입력 화면
    const user = party.participants[selectedUser];
    const team = party.teams[user.team];
    const level = party.levels.find(l => l.id === user.level);
    const levelIdx = party.levels.findIndex(l => l.id === user.level);
    
    const availableLevels = party.levels.filter((l, idx) => Math.abs(idx - levelIdx) <= (party.settings?.range || 1));
    
    const scores = user.scores || [];
    const { total, counted, uncounted } = getTopScores(scores, party.settings?.maxProblems || 10);

    const addScore = async (problemLevel) => {
      const score = calculateScore(user.level, problemLevel, party.levels, party.settings);
      if (score === 0) return;
      
      const newScores = [...scores, { level: problemLevel, score, time: new Date().toISOString() }];
      const newParticipants = {
        ...party.participants,
        [selectedUser]: { ...user, scores: newScores }
      };
      await saveParty({ ...party, participants: newParticipants });
    };

    const removeScore = async (idx) => {
      const newScores = scores.filter((_, i) => i !== idx);
      const newParticipants = {
        ...party.participants,
        [selectedUser]: { ...user, scores: newScores }
      };
      await saveParty({ ...party, participants: newParticipants });
    };

    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => setSelectedUser(null)} className="text-gray-500">
              <Icon name="back" className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">{selectedUser}</h1>
            <button onClick={() => setView('board')} className="text-gray-500">
              <Icon name="trophy" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          {/* 유저 정보 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6" style={{ borderLeftWidth: '4px', borderLeftColor: team?.color }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {user.isLeader && <span className="text-yellow-500">★</span>}
                  <h2 className="text-2xl font-semibold">{selectedUser}</h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: level?.color }} />
                    {level?.name}
                  </span>
                  <span style={{ color: team?.color }}>{team?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-display font-bold">{total}</div>
                <div className="text-sm text-gray-400">{counted.length}/{party.settings?.maxProblems || 10}</div>
              </div>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${(counted.length / (party.settings?.maxProblems || 10)) * 100}%`, backgroundColor: team?.color }}
              />
            </div>
          </div>

          {/* 문제 추가 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="font-medium mb-4">완등 추가</h3>
            <div className="grid grid-cols-3 gap-2">
              {availableLevels.map(l => {
                const lIdx = party.levels.findIndex(x => x.id === l.id);
                const diff = levelIdx - lIdx;
                const label = diff > 0 ? '도전' : diff === 0 ? '적정' : '기본';
                const score = calculateScore(user.level, l.id, party.levels, party.settings);
                
                return (
                  <button
                    key={l.id}
                    onClick={() => addScore(l.id)}
                    className="p-4 rounded-lg text-center transition active:scale-95 border-2"
                    style={{ 
                      backgroundColor: l.color + '15',
                      borderColor: l.color + '40',
                      color: l.color === '#f5f5f5' ? '#333' : l.color
                    }}
                  >
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs opacity-70">{label}</div>
                    <div className="text-lg font-bold mt-1">+{score}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 완등 기록 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-medium mb-4">완등 기록 ({scores.length})</h3>
            {scores.length === 0 ? (
              <p className="text-center text-gray-400 py-6">아직 기록이 없습니다</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scores.map((s, idx) => {
                  const sLevel = party.levels.find(l => l.id === s.level);
                  const isUncounted = uncounted.includes(s);
                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isUncounted ? 'bg-gray-50 opacity-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sLevel?.color }} />
                        <span className="font-medium">{sLevel?.name}</span>
                        <span className="font-semibold">+{s.score}</span>
                        {isUncounted && <span className="text-xs text-gray-400">(미집계)</span>}
                      </div>
                      <button onClick={() => removeScore(idx)} className="text-gray-400 hover:text-red-500 p-1">
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== 현황판 =====
  const BoardView = () => {
    if (!party) return null;

    const teamScores = {};
    Object.keys(party.teams).forEach(k => teamScores[k] = 0);

    const ranking = Object.entries(party.participants || {})
      .filter(([_, p]) => p.approved && p.team)
      .map(([name, p]) => {
        const { total } = getTopScores(p.scores || [], party.settings?.maxProblems || 10);
        if (p.team) teamScores[p.team] += total;
        return { name, ...p, total, count: (p.scores || []).length };
      })
      .sort((a, b) => b.total - a.total);

    const maxTeamScore = Math.max(...Object.values(teamScores), 1);

    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => selectedUser ? setView('game') : setView('lobby')} className="text-gray-500">
              <Icon name="back" className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">현황판</h1>
            <div className="w-5" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          {/* 팀 점수 */}
          <div className={`grid gap-4 mb-6 ${Object.keys(party.teams).length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {Object.entries(party.teams).map(([key, team]) => {
              const score = teamScores[key];
              const isLeading = score === Math.max(...Object.values(teamScores)) && score > 0;
              return (
                <div
                  key={key}
                  className={`rounded-xl p-6 text-center transition ${isLeading ? 'ring-2' : ''}`}
                  style={{ 
                    backgroundColor: isLeading ? team.color : team.bg,
                    color: isLeading ? 'white' : team.color,
                    ringColor: team.color
                  }}
                >
                  <div className="font-medium mb-2">{team.name}</div>
                  <div className="text-4xl font-display font-bold">{score}</div>
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: isLeading ? 'rgba(255,255,255,0.3)' : team.color + '20' }}>
                    <div className="h-full rounded-full" style={{ width: `${(score / maxTeamScore) * 100}%`, backgroundColor: isLeading ? 'white' : team.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 개인 순위 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-medium mb-4">개인 순위</h3>
            <div className="space-y-2">
              {ranking.map((p, idx) => {
                const team = party.teams[p.team];
                const level = party.levels.find(l => l.id === p.level);
                return (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: team?.bg }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {p.isLeader && <span className="text-yellow-500 text-sm">★</span>}
                        <span className="font-medium">{p.name}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level?.color }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{p.total}</div>
                      <div className="text-xs text-gray-400">{p.count}개</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 라우팅
  return (
    <>
      {view === 'home' && <HomeView />}
      {view === 'create' && <CreateView />}
      {view === 'join' && <JoinView />}
      {view === 'lobby' && <LobbyView />}
      {view === 'teams' && <TeamsView />}
      {view === 'game' && <GameView />}
      {view === 'board' && <BoardView />}
    </>
  );
}
