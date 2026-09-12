import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { PAGE_TITLES } from './navigation.js'

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-slate-500">{title} will be available in a later stage.</p>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[#0b0d11] text-slate-200">
      <Sidebar activeId={activePage} onNavigate={setActivePage} />

      <div className="flex min-h-screen flex-col pl-[264px]">
        <TopBar title={PAGE_TITLES[activePage] ?? 'Dashboard'} />

        <main className="flex flex-1 flex-col px-6 py-6">
          {activePage === 'dashboard' ? (
            <Dashboard onNavigate={setActivePage} />
          ) : (
            <PlaceholderPage title={PAGE_TITLES[activePage]} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
