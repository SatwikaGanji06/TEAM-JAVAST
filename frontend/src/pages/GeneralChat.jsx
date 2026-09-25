import PageHeader from '../components/PageHeader.jsx'
import { useChat } from '../session/ChatContext.jsx'

const STARTERS = [
  'Explain a technical concept',
  'Help me draft a document',
  'Solve a problem step by step',
]

export default function GeneralChat() {
  const {
    messages,
    input,
    loading,
    error,
    setInput,
    sendMessage,
  } = useChat()

  async function handleSubmit(event) {
    event.preventDefault()
    await sendMessage(input)
  }

  function useStarter(prompt) {
    setInput(prompt)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
      <div className="shrink-0">
        <PageHeader
          title="General Chat"
          subtitle="Talk directly with the local AI model. Conversations remain in this browser session."
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-2 py-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-accent uppercase">
                  LOKAI · Local AI
                </p>

                <h2 className="mt-4 text-2xl font-medium tracking-tight text-ink">
                  How can I help you today?
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-secondary">
                  Ask questions, explain concepts, draft content, or work
                  through a problem with the locally running model.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => useStarter(starter)}
                      className="rounded-full border border-line bg-panel px-3.5 py-2 text-xs text-ink-secondary transition-colors hover:border-sky-300 hover:bg-white hover:text-ink"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-7 pb-6">
              {messages.map((message, index) => {
                const isUser = message.role === 'user'

                return (
                  <div
                    key={index}
                    className={`flex w-full ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex max-w-[88%] gap-3 sm:max-w-[82%] ${
                        isUser ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold tracking-[0.06em] ${
                          isUser
                            ? 'border-line bg-panel text-muted'
                            : 'border-sky-200 bg-white text-accent'
                        }`}
                      >
                        {isUser ? 'U' : 'AI'}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`mb-1 text-[9px] font-semibold tracking-[0.16em] text-muted uppercase ${
                            isUser ? 'text-right' : ''
                          }`}
                        >
                          {isUser ? 'You' : 'LOKAI'}
                        </p>

                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isUser
                              ? 'bg-slate-100 text-ink'
                              : 'border border-line bg-panel text-ink'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.content}
                          </p>
                        </div>

                        {message.sources?.length > 0 ? (
                          <div className="mt-2 pl-1">
                            <p className="text-[9px] font-semibold tracking-[0.14em] text-muted uppercase">
                              Sources
                            </p>

                            <div className="mt-1 space-y-0.5">
                              {message.sources.slice(0, 5).map(
                                (source, sourceIndex) => (
                                  <p
                                    key={sourceIndex}
                                    className="truncate text-[11px] text-ink-secondary"
                                  >
                                    {source.document ||
                                      source.file_name ||
                                      'Indexed document'}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}

              {loading ? (
                <div className="flex justify-start">
                  <div className="flex max-w-[82%] gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-[9px] font-semibold text-accent">
                      AI
                    </div>

                    <div>
                      <p className="mb-1 text-[9px] font-semibold tracking-[0.16em] text-muted uppercase">
                        LOKAI
                      </p>

                      <div className="rounded-2xl border border-line bg-panel px-4 py-3">
                        <p className="text-sm text-ink-secondary">
                          Processing locally...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="mx-auto mb-2 w-full max-w-3xl rounded-xl border border-warning/40 bg-panel px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-warning uppercase">
            Request error
          </p>

          <p className="mt-1 text-sm text-ink">
            {error}
          </p>
        </div>
      ) : null}

      <div className="shrink-0 px-2 pb-2 pt-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl rounded-2xl border border-line bg-panel px-4 py-3 shadow-sm"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
            placeholder="Message LOKAI..."
            rows={2}
            className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 text-ink outline-none placeholder:text-muted"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] font-medium tracking-[0.14em] text-muted uppercase">
              Local · On-device
            </span>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full bg-sky-500 px-5 py-2 text-[10px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Processing' : 'Send'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-[9px] text-muted">
          LOKAI runs this conversation through the local AI backend.
        </p>
      </div>
    </div>
  )
}

