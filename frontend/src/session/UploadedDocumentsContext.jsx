import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UploadedDocumentsContext = createContext(null)

export function UploadedDocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([])
  const [lastIngest, setLastIngest] = useState(null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])

  const addUploadedDocument = useCallback((result) => {
    if (!result || typeof result.document_id !== 'number') return

    setDocuments((current) => {
      const next = current.filter((document) => document.document_id !== result.document_id)
      return [
        {
          document_id: result.document_id,
          file_name: result.file_name,
          chunks_created: result.chunks_created,
          status: result.status,
        },
        ...next,
      ]
    })
  }, [])

  const toggleDocumentSelection = useCallback((docId) => {
    setSelectedDocumentIds((current) => {
      if (current.includes(docId)) {
        return current.filter((id) => id !== docId)
      }
      return [...current, docId]
    })
  }, [])

  const recordIngest = useCallback((result) => {
    if (!result) return
    setLastIngest(result)
  }, [])

  const value = useMemo(
    () => ({
      documents,
      addUploadedDocument,
      lastIngest,
      recordIngest,
      selectedDocumentIds,
      toggleDocumentSelection,
    }),
    [documents, addUploadedDocument, lastIngest, recordIngest, selectedDocumentIds, toggleDocumentSelection],
  )

  return (
    <UploadedDocumentsContext.Provider value={value}>
      {children}
    </UploadedDocumentsContext.Provider>
  )
}

export function useUploadedDocuments() {
  const value = useContext(UploadedDocumentsContext)
  if (!value) {
    throw new Error('useUploadedDocuments must be used within UploadedDocumentsProvider')
  }
  return value
}
