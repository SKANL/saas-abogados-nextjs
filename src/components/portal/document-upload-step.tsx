"use client"

import * as React from "react"
import { Upload, Check, X, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentUploadStepProps {
  documentsRequired: string[]
  uploadedDocs: Record<string, File>
  onUpload: (docName: string, file: File) => void
  onNext: () => void
  onBack: () => void
}

export function DocumentUploadStep({
  documentsRequired,
  uploadedDocs,
  onUpload,
  onNext,
  onBack,
}: DocumentUploadStepProps) {
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Documentos Requeridos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Por favor sube los siguientes documentos en formato PDF o imagen.
        </p>
      </div>

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
                  ? "border-green-500 bg-green-50"
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
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="button" onClick={onNext} disabled={!allUploaded}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
