"use client"

import * as React from "react"
import { X, Download, FileText, Image as ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentName: string
  documentUrl: string
  onDownload: () => void
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  documentName,
  documentUrl,
  onDownload,
}: DocumentPreviewDialogProps) {
  const [isImage, setIsImage] = React.useState(false)
  const [isPdf, setIsPdf] = React.useState(false)

  React.useEffect(() => {
    if (!documentUrl) return
    
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase()
    setIsImage(['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || ''))
    setIsPdf(fileExtension === 'pdf')
  }, [documentUrl])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              {documentName}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 w-full h-full rounded-md border">
          {isImage ? (
            <div className="flex items-center justify-center p-4 min-h-100">
              <img
                src={documentUrl}
                alt={documentName}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={documentUrl}
              className="w-full h-full min-h-150"
              title={documentName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 min-h-100 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Vista previa no disponible</p>
              <p className="text-sm text-muted-foreground mb-4">
                Este tipo de archivo no se puede previsualizar en el navegador
              </p>
              <Button onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar archivo
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
