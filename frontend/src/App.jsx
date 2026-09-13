import { useState } from 'react'
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

function App() {
  const [activePage, setActivePage] = useState('home')
  const isAnalysis = activePage === 'analysis'

  return (
    <UploadedDocumentsProvider>
      <div className="min-h-screen bg-app text-ink">
        <Sidebar
          activeId={sidebarActiveId(activePage)}
          onNavigate={setActivePage}
        />

        <div className="flex h-screen min-w-0 flex-col pl-[264px]">
          <TopBar title={pageTitle(activePage)} onNavigate={setActivePage} />

          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col px-6 ${
              isAnalysis ? 'overflow-hidden py-4' : 'overflow-y-auto py-6'
            }`}
          >
            {activePage === 'home' ? (
              <Home onNavigate={setActivePage} />
            ) : activePage === 'analysis' ? (
              <Analysis />
            ) : activePage === 'documents' ? (
              <Documents />
            ) : activePage === 'knowledge-base' ? (
              <KnowledgeBase />
            ) : activePage === 'runs' ? (
              <Runs />
            ) : activePage === 'generated-documents' ? (
              <GeneratedDocuments />
            ) : activePage === 'models' ? (
              <Models />
            ) : activePage === 'sovereignty' ? (
              <Sovereignty />
            ) : activePage === 'audit' ? (
              <Audit />
            ) : activePage === 'profile' ? (
              <Profile />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted">This page is not available.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </UploadedDocumentsProvider>
  )
}

export default App
