import { useCallback, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Home from './pages/Home.jsx'
import Documents from './pages/Documents.jsx'
import KnowledgeBase from './pages/KnowledgeBase.jsx'
import Runs from './pages/Runs.jsx'
import RunDetail from './pages/RunDetail.jsx'
import Models from './pages/Models.jsx'
import Sovereignty from './pages/Sovereignty.jsx'
import Profile from './pages/Profile.jsx'
import NewAnalysis from './pages/NewAnalysis.jsx'
import { PAGE_TITLES } from './navigation.js'

function pageTitle(activePage) {
  return PAGE_TITLES[activePage] ?? 'Home'
}

function sidebarActiveId(activePage) {
  if (activePage === 'run-detail') return 'runs'
  if (activePage === 'profile') return null
  if (activePage === 'new-analysis') return 'home'
  return activePage
}

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [selectedRunId, setSelectedRunId] = useState('run-safety')
  const [homeDraft, setHomeDraft] = useState(null)

  const handleNavigate = useCallback((page, extras) => {
    if (extras?.runId) {
      setSelectedRunId(extras.runId)
    }
    if (extras?.homeDraft) {
      setHomeDraft(extras.homeDraft)
    }
    setActivePage(page)
  }, [])

  const clearHomeDraft = useCallback(() => {
    setHomeDraft(null)
  }, [])

  const isWorkspace = activePage === 'home'

  return (
    <div className="min-h-screen bg-app text-ink">
      <Sidebar
        activeId={sidebarActiveId(activePage)}
        onNavigate={handleNavigate}
      />

      <div className="flex h-screen min-w-0 flex-col pl-[264px]">
        <TopBar title={pageTitle(activePage)} onNavigate={handleNavigate} />

        <main
          className={`flex flex-1 flex-col px-4 py-5 md:px-6 lg:px-8 ${
            isWorkspace ? 'min-h-0 overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <div
            className={
              activePage === 'home'
                ? 'flex min-h-0 flex-1 flex-col'
                : 'hidden'
            }
            hidden={activePage !== 'home'}
          >
            <Home
              onNavigate={handleNavigate}
              draft={homeDraft}
              onDraftConsumed={clearHomeDraft}
            />
          </div>

          {activePage === 'documents' ? (
            <Documents onNavigate={handleNavigate} />
          ) : activePage === 'knowledge-base' ? (
            <KnowledgeBase />
          ) : activePage === 'runs' ? (
            <Runs onNavigate={handleNavigate} />
          ) : activePage === 'run-detail' ? (
            <RunDetail runId={selectedRunId} onNavigate={handleNavigate} />
          ) : activePage === 'models' ? (
            <Models />
          ) : activePage === 'sovereignty' ? (
            <Sovereignty />
          ) : activePage === 'profile' ? (
            <Profile />
          ) : activePage === 'new-analysis' ? (
            <NewAnalysis />
          ) : activePage === 'home' ? null : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted">This page is not available.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
