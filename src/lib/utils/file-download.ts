import JSZip from 'jszip'

interface ClientDocument {
  name: string
  uploadedAt: string
  size: string
  url?: string
}

interface QuestionAnswer {
  question: string
  answer: string
}

interface ClientData {
  clientName: string
  clientEmail?: string | null
  caseName: string
  createdAt?: string | null
  completedAt?: string | null
  signatureTimestamp?: string | null
  signedName?: string
  documents: ClientDocument[]
  questionnaire: QuestionAnswer[]
}

/**
 * Generate a complete client file (expediente) as a ZIP file
 */
export async function generateExpedienteZip(data: ClientData): Promise<Blob> {
  const zip = new JSZip()

  // 1. Create info.txt with client information
  const infoContent = `
EXPEDIENTE DEL CLIENTE
======================

Nombre: ${data.clientName}
Email: ${data.clientEmail || 'N/A'}
Caso: ${data.caseName}
Fecha de creación: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-MX') : 'N/A'}
Fecha de completado: ${data.completedAt ? new Date(data.completedAt).toLocaleDateString('es-MX') : 'Pendiente'}

${data.signatureTimestamp ? `
FIRMA DIGITAL
=============
Firmado el: ${new Date(data.signatureTimestamp).toLocaleString('es-MX')}
Nombre firmado: ${data.signedName || 'N/A'}
` : ''}

CUESTIONARIO
============
${data.questionnaire.length > 0 
  ? data.questionnaire.map((qa, i) => `
${i + 1}. ${qa.question}
   Respuesta: ${qa.answer}
`).join('\n')
  : 'No hay respuestas de cuestionario'
}

DOCUMENTOS ADJUNTOS
===================
${data.documents.length > 0
  ? data.documents.map((doc, i) => `${i + 1}. ${doc.name} (${doc.uploadedAt})`).join('\n')
  : 'No hay documentos adjuntos'
}
`.trim()

  zip.file('00_INFORMACION_CLIENTE.txt', infoContent)

  // 2. Download and add documents to ZIP
  if (data.documents.length > 0) {
    const docsFolder = zip.folder('documentos')
    
    for (let i = 0; i < data.documents.length; i++) {
      const doc = data.documents[i]
      if (!doc.url) continue

      try {
        const response = await fetch(doc.url)
        const blob = await response.blob()
        
        // Get file extension from URL
        const extension = doc.url.split('.').pop()?.split('?')[0] || 'bin'
        const fileName = `${String(i + 1).padStart(2, '0')}_${doc.name.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        
        docsFolder?.file(fileName, blob)
      } catch (error) {
        console.error(`Error downloading document ${doc.name}:`, error)
      }
    }
  }

  // 3. Create questionnaire.txt if there are answers
  if (data.questionnaire.length > 0) {
    const questionnaireContent = data.questionnaire.map((qa, i) => `
PREGUNTA ${i + 1}:
${qa.question}

RESPUESTA:
${qa.answer}

${'='.repeat(80)}
`).join('\n')

    zip.file('cuestionario_respuestas.txt', questionnaireContent)
  }

  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Download a file from URL directly
 * Fetches the file first to ensure it downloads instead of opening in a new tab
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // Fetch the file as a blob
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch file')
    
    const blob = await response.blob()
    
    // Use downloadBlob to trigger the download
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Error downloading file:', error)
    // Fallback: try direct download (may open in new tab)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Trigger browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
