import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import { PAGE_TITLES } from './navigation.js'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[#0b0d11] text-slate-200">
      <Sidebar activeId={activePage} onNavigate={setActivePage} />

      <div className="flex min-h-screen flex-col pl-[264px]">
        <TopBar title={PAGE_TITLES[activePage] ?? 'Dashboard'} />

        <main className="flex flex-1 items-center justify-center px-8 py-10">
          <div className="max-w-xl text-center">
            <h2 className="text-xl font-medium tracking-tight text-slate-100">
              Welcome to Sovereign AI Workbench
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Local AI infrastructure ready.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
