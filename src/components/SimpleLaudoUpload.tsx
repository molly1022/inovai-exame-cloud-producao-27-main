
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { compressFile } from '@/utils/fileCompression';

interface SimpleLaudoUploadProps {
  laudo?: File | null;
  onLaudoChange?: (laudo: File | null) => void;
  onUpload?: (url: string, name: string) => void;
  initialFile?: { url: string; name: string } | null;
  disabled?: boolean;
}

const SimpleLaudoUpload = ({ 
  laudo = null, 
  onLaudoChange, 
  onUpload,
  initialFile = null,
  disabled = false 
}: SimpleLaudoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentLaudo, setCurrentLaudo] = useState<File | null>(laudo);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.startsWith('image/')) {
      return;
    }

    setIsUploading(true);
    
    try {
      const { compressedFile } = await compressFile(file, {
        type: 'document',
        quality: 0.8
      });
      
      setCurrentLaudo(compressedFile);
      
      if (onLaudoChange) {
        onLaudoChange(compressedFile);
      }

      if (onUpload) {
        const url = URL.createObjectURL(compressedFile);
        onUpload(url, compressedFile.name);
      }
    } catch (error) {
      console.error('Erro ao processar laudo:', error);
      setCurrentLaudo(file);
      
      if (onLaudoChange) {
        onLaudoChange(file);
      }

      if (onUpload) {
        const url = URL.createObjectURL(file);
        onUpload(url, file.name);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeLaudo = () => {
    setCurrentLaudo(null);
    
    if (onLaudoChange) {
      onLaudoChange(null);
    }

    if (onUpload) {
      onUpload('', '');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  const displayFile = currentLaudo || (initialFile ? { name: initialFile.name, size: 0 } : null);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Laudo do Exame</Label>
      <div>
        {!displayFile ? (
          <>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="simple-laudo-upload"
              disabled={disabled || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('simple-laudo-upload')?.click()}
              className="w-full h-20 border-dashed border-2 hover:bg-gray-50"
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Selecionar Laudo (PDF ou Imagem)
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm text-blue-900">
                    {getFileIcon(displayFile.name)} {displayFile.name}
                  </p>
                  {currentLaudo && (
                    <p className="text-xs text-blue-700">
                      {(currentLaudo.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                  {initialFile && !currentLaudo && (
                    <p className="text-xs text-blue-700">Arquivo existente</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeLaudo}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLaudoUpload;
