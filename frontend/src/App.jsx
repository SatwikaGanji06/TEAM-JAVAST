import { useCallback, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Home from './pages/Home.jsx'
import Analysis from './pages/Analysis.jsx'
import Documents from './pages/Documents.jsx'
import KnowledgeBase from './pages/KnowledgeBase.jsx'
import Runs from './pages/Runs.jsx'
import GeneratedDocuments from './pages/GeneratedDocuments.jsx'
import Models from './pages/Models.jsx'
import Sovereignty from './pages/Sovereignty.jsx'
import Audit from './pages/Audit.jsx'
import Profile from './pages/Profile.jsx'
import { PAGE_TITLES } from './navigation.js'
import { UploadedDocumentsProvider } from './session/UploadedDocumentsContext.jsx'

function pageTitle(activePage) {
  return PAGE_TITLES[activePage] ?? 'Home'
}

function sidebarActiveId(activePage) {
  if (activePage === 'profile') return null
  return activePage
}

function renderWorkspacePage(activePage, onNavigate) {
  switch (activePage) {
    case 'analysis':
      return null
    case 'home':
      return <Home onNavigate={onNavigate} />
    case 'documents':
      return <Documents />
    case 'knowledge-base':
      return <KnowledgeBase />
    case 'runs':
      return <Runs />
    case 'generated-documents':
      return <GeneratedDocuments />
    case 'models':
      return <Models />
    case 'sovereignty':
      return <Sovereignty />
    case 'audit':
      return <Audit />
    case 'profile':
      return <Profile />
    default:
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted">This page is not available.</p>
        </div>
      )
  }
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const isAnalysis = activePage === 'analysis'

  const handleNavigate = useCallback((pageId) => {
    if (typeof pageId !== 'string') return
    if (!(pageId in PAGE_TITLES)) return
    setActivePage(pageId)
  }, [])

  return (
    <UploadedDocumentsProvider>
      <div className="min-h-screen bg-app text-ink">
        <Sidebar
          activeId={sidebarActiveId(activePage)}
          onNavigate={handleNavigate}
        />

        <div className="flex h-screen min-w-0 flex-col pl-[264px]">
          <TopBar title={pageTitle(activePage)} onNavigate={handleNavigate} />

          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col px-6 ${
              isAnalysis ? 'overflow-hidden py-4' : 'overflow-y-auto py-6'
            }`}
          >
            <div
              className={
                isAnalysis
                  ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  : 'hidden'
              }
              aria-hidden={!isAnalysis}
              {...(isAnalysis ? {} : { inert: true })}
            >
              <Analysis isActive={isAnalysis} />
            </div>

            {isAnalysis ? null : renderWorkspacePage(activePage, handleNavigate)}
          </main>
        </div>
      </div>
    </UploadedDocumentsProvider>
  )
}

export default App
