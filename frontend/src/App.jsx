import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewAnalysis from './pages/NewAnalysis.jsx'
import AgentRun from './pages/AgentRun.jsx'
import AnalysisResult from './pages/AnalysisResult.jsx'
import AgentChat from './pages/AgentChat.jsx'
import Profile from './pages/Profile.jsx'
import { PAGE_TITLES } from './navigation.js'

function pageTitle(activePage) {
  if (activePage === 'agent-runs') return 'Agent Run'
  if (activePage === 'analysis-result') return 'Analysis Results'
  if (activePage === 'agent-chat') return 'Ask the Agent'
  if (activePage === 'profile') return 'Profile'
  return PAGE_TITLES[activePage] ?? 'Dashboard'
}

function sidebarActiveId(activePage) {
  if (activePage === 'analysis-result') return 'agent-runs'
  if (activePage === 'profile') return null
  return activePage
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted">{title} will be available in a later stage.</p>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-app text-ink">
      <Sidebar
        activeId={sidebarActiveId(activePage)}
        onNavigate={setActivePage}
      />

      <div className="flex h-screen flex-col pl-[264px]">
        <TopBar title={pageTitle(activePage)} onNavigate={setActivePage} />

        <main
          className={`flex flex-1 flex-col px-6 py-6 ${
            activePage === 'agent-chat' ? 'min-h-0 overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          {activePage === 'dashboard' ? (
            <Dashboard onNavigate={setActivePage} />
          ) : activePage === 'new-analysis' ? (
            <NewAnalysis />
          ) : activePage === 'agent-runs' ? (
            <AgentRun onNavigate={setActivePage} />
          ) : activePage === 'analysis-result' ? (
            <AnalysisResult onNavigate={setActivePage} />
          ) : activePage === 'agent-chat' ? (
            <AgentChat />
          ) : activePage === 'profile' ? (
            <Profile />
          ) : (
            <PlaceholderPage title={PAGE_TITLES[activePage]} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
