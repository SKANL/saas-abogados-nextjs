"use client"

import * as React from "react"
import { Upload, Check, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DocumentUploadStepProps {
  clientId: string
  linkId: string
  documentsRequired: string[]
  uploadedDocs: Record<string, File>
  onUpload: (docName: string, file: File) => void
  onNext: () => void
  onBack: () => void
}

export function DocumentUploadStep({
  clientId,
  linkId,
  documentsRequired,
  uploadedDocs,
  onUpload,
  onNext,
  onBack,
}: DocumentUploadStepProps) {
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const allUploaded = documentsRequired.every((doc) => uploadedDocs[doc])

  const handleFileChange = (docName: string, files: FileList | null) => {
    if (files && files[0]) {
      onUpload(docName, files[0])
    }
  }

  const handleDrop = (docName: string, e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files[0]) {
      onUpload(docName, files[0])
    }
  }

  const handleSubmit = async () => {
    if (!allUploaded) {
      toast.error("Por favor sube todos los documentos requeridos")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const totalDocs = documentsRequired.length
      let uploadedCount = 0

      for (const docName of documentsRequired) {
        const file = uploadedDocs[docName]
        if (!file) continue

        const formData = new FormData()
        formData.append('clientId', clientId)
        formData.append('linkId', linkId)
        formData.append('documentType', docName)
        formData.append('file', file)

        const response = await fetch('/api/portal/upload-document', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error al subir ${docName}`)
        }

        uploadedCount++
        setUploadProgress((uploadedCount / totalDocs) * 100)
      }

      toast.success("Todos los documentos se subieron correctamente")
      onNext()
    } catch (error) {
      console.error("Error uploading documents:", error)
      toast.error("Error al subir documentos. Intenta de nuevo.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Documentos Requeridos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Por favor sube los siguientes documentos en formato PDF o imagen.
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subiendo documentos...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <div className="space-y-4">
        {documentsRequired.map((docName) => {
          const isUploaded = !!uploadedDocs[docName]
          const file = uploadedDocs[docName]

          return (
            <div
              key={docName}
              className={cn(
                "relative rounded-lg border-2 border-dashed p-4 transition-colors",
                isUploaded
                  ? "border-green-500 bg-green-50 dark:bg-green-950/10"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(docName, e)}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                ref={(el) => { fileInputRefs.current[docName] = el }}
                onChange={(e) => handleFileChange(docName, e.target.files)}
              />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isUploaded ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{docName}</p>
                    {isUploaded && file && (
                      <p className="text-sm text-muted-foreground">
                        {file.name} ({(file.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant={isUploaded ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => fileInputRefs.current[docName]?.click()}
                  disabled={isUploading}
                >
                  {isUploaded ? (
                    "Cambiar"
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isUploading}
        >
          Atrás
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!allUploaded || isUploading}
          className="min-w-32"
        >
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continuar
        </Button>
      </div>
    </div>
  )
}
