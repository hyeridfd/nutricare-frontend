import { useState } from 'react'
import './settings.css'

const TABS = [
  { key: 'profile', icon: 'ti-user', label: '프로필' },
  { key: 'notifications', icon: 'ti-bell', label: '알림' },
  { key: 'organization', icon: 'ti-building', label: '기관 정보' },
  { key: 'appearance', icon: 'ti-palette', label: '외관' },
  { key: 'security', icon: 'ti-shield-lock', label: '보안' },
]

export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, inventory: true, health: true })

  return (
    <div className="st-layout fade-in">
      <div className="card st-side">
        <div className="st-side__body">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`st-tab ${tab === t.key ? 'st-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`ti ${t.icon}`} />
              <span>{t.label}</span>
              <i className="ti ti-chevron-right st-tab__arrow" />
            </button>
          ))}
        </div>
      </div>

      <div className="card st-main">
        {tab === 'profile' && (
          <>
            <div className="card__header">
              <div>
                <div className="card__title">프로필 설정</div>
                <div className="card__subtitle">개인 정보 및 계정 정보를 관리합니다</div>
              </div>
            </div>
            <div className="st-body">
              <div className="st-avatar-row">
                <div className="st-avatar-big">김</div>
                <div>
                  <button className="btn btn--secondary btn--sm"><i className="ti ti-camera" /> 사진 변경</button>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>JPG, PNG · 최대 2MB</div>
                </div>
              </div>

              <div className="st-form">
                <div className="st-field">
                  <label>이름</label>
                  <input className="input" defaultValue="김영양" />
                </div>
                <div className="st-field">
                  <label>이메일</label>
                  <input className="input" defaultValue="nutrition@nutricare.kr" />
                </div>
                <div className="st-field">
                  <label>직책</label>
                  <input className="input" defaultValue="영양사 · 관리자" />
                </div>
                <div className="st-field">
                  <label>연락처</label>
                  <input className="input" defaultValue="010-1234-5678" />
                </div>
                <div className="st-field st-field--full">
                  <label>소개</label>
                  <textarea className="input" rows={3} defaultValue="요양원 식단 및 영양 관리를 담당하고 있습니다." />
                </div>
              </div>

              <div className="st-actions">
                <button className="btn btn--ghost">취소</button>
                <button className="btn btn--primary"><i className="ti ti-check" /> 변경사항 저장</button>
              </div>
            </div>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <div className="card__header">
              <div>
                <div className="card__title">알림 설정</div>
                <div className="card__subtitle">받고 싶은 알림을 선택하세요</div>
              </div>
            </div>
            <div className="st-body">
              {[
                { k: 'email', label: '이메일 알림', desc: '주요 이벤트를 이메일로 받습니다' },
                { k: 'push', label: '푸시 알림', desc: '브라우저 푸시 알림을 받습니다' },
                { k: 'sms', label: 'SMS 알림', desc: '긴급 상황 시 문자를 받습니다' },
                { k: 'inventory', label: '재고 부족 알림', desc: '식자재 재고가 부족하면 알려드립니다' },
                { k: 'health', label: '건강 이슈 알림', desc: '입소자의 건강 이슈를 실시간으로 알려드립니다' },
              ].map(item => (
                <div key={item.k} className="st-toggle-row">
                  <div>
                    <div className="st-toggle-label">{item.label}</div>
                    <div className="st-toggle-desc">{item.desc}</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox"
                           checked={notifs[item.k as keyof typeof notifs]}
                           onChange={e => setNotifs({ ...notifs, [item.k]: e.target.checked })} />
                    <span className="switch-slider" />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'organization' && (
          <>
            <div className="card__header">
              <div>
                <div className="card__title">기관 정보</div>
                <div className="card__subtitle">요양원 기본 정보를 관리합니다</div>
              </div>
            </div>
            <div className="st-body">
              <div className="st-form">
                <div className="st-field st-field--full">
                  <label>기관명</label>
                  <input className="input" defaultValue="사랑 요양원" />
                </div>
                <div className="st-field">
                  <label>대표자</label>
                  <input className="input" defaultValue="이대표" />
                </div>
                <div className="st-field">
                  <label>사업자등록번호</label>
                  <input className="input" defaultValue="123-45-67890" />
                </div>
                <div className="st-field st-field--full">
                  <label>주소</label>
                  <input className="input" defaultValue="서울특별시 강남구 요양로 123" />
                </div>
                <div className="st-field">
                  <label>수용 인원</label>
                  <input className="input" defaultValue="50명" />
                </div>
                <div className="st-field">
                  <label>영양사 수</label>
                  <input className="input" defaultValue="2명" />
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'appearance' && (
          <>
            <div className="card__header">
              <div>
                <div className="card__title">외관 설정</div>
                <div className="card__subtitle">테마와 언어를 선택하세요</div>
              </div>
            </div>
            <div className="st-body">
              <div className="st-field">
                <label>테마</label>
                <div className="st-theme-grid">
                  {[
                    { k: 'light', label: '라이트', icon: 'ti-sun', bg: '#fafaf8' },
                    { k: 'dark', label: '다크', icon: 'ti-moon', bg: '#2a2a26' },
                    { k: 'auto', label: '시스템', icon: 'ti-device-desktop', bg: 'linear-gradient(135deg,#fafaf8 50%,#2a2a26 50%)' },
                  ].map(t => (
                    <button key={t.k} className={`st-theme-card ${t.k === 'light' ? 'st-theme-card--active' : ''}`}>
                      <div className="st-theme-preview" style={{ background: t.bg }}>
                        <i className={`ti ${t.icon}`} />
                      </div>
                      <div className="st-theme-name">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="st-field">
                <label>언어</label>
                <select className="select">
                  <option>한국어</option>
                  <option>English</option>
                  <option>日本語</option>
                </select>
              </div>
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            <div className="card__header">
              <div>
                <div className="card__title">보안 설정</div>
                <div className="card__subtitle">비밀번호 및 2단계 인증을 관리합니다</div>
              </div>
            </div>
            <div className="st-body">
              <div className="st-toggle-row">
                <div>
                  <div className="st-toggle-label">2단계 인증</div>
                  <div className="st-toggle-desc">추가 보안을 위해 2단계 인증을 활성화하세요</div>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="switch-slider" />
                </label>
              </div>
              <div className="st-toggle-row">
                <div>
                  <div className="st-toggle-label">로그인 알림</div>
                  <div className="st-toggle-desc">새로운 기기에서 로그인 시 알림을 받습니다</div>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="switch-slider" />
                </label>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                <button className="btn btn--secondary"><i className="ti ti-key" /> 비밀번호 변경</button>
                <button className="btn btn--danger"><i className="ti ti-logout" /> 모든 기기에서 로그아웃</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
