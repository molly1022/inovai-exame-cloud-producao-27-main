
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { compressFile } from '@/utils/fileCompression';
import FileCompressionInfo from './FileCompressionInfo';

interface LaudoUploadProps {
  laudo: File | null;
  onLaudoChange: (laudo: File | null) => void;
  disabled?: boolean;
}

const LaudoUpload = ({ laudo, onLaudoChange, disabled = false }: LaudoUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    fileName: string;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aceitar PDFs e imagens
    if (!file.type.includes('pdf') && !file.type.startsWith('image/')) {
      return;
    }

    setIsCompressing(true);
    setCompressionInfo(null);
    
    try {
      const { originalFile, compressedFile, compressionRatio } = await compressFile(file, {
        type: 'document',
        quality: 0.8
      });
      
      if (compressionRatio > 5) {
        setCompressionInfo({
          originalSize: originalFile.size,
          compressedSize: compressedFile.size,
          compressionRatio,
          fileName: originalFile.name
        });
      }
      
      onLaudoChange(compressedFile);
    } catch (error) {
      console.error('Erro ao compactar laudo:', error);
      onLaudoChange(file);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeLaudo = () => {
    onLaudoChange(null);
    setCompressionInfo(null);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Laudo do Exame (PDF ou Imagem)</Label>
        <div className="mt-2">
          {!laudo ? (
            <>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="laudo-upload"
                disabled={disabled || isCompressing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('laudo-upload')?.click()}
                className="w-full"
                disabled={disabled || isCompressing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isCompressing ? 'Compactando...' : 'Selecionar Laudo'}
              </Button>
            </>
          ) : (
            <div className="border rounded-lg p-3 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm text-blue-900">
                      {getFileIcon(laudo.name)} {laudo.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      Tamanho: {(laudo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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

      {/* Informações de compactação */}
      {compressionInfo && (
        <FileCompressionInfo
          originalSize={compressionInfo.originalSize}
          compressedSize={compressionInfo.compressedSize}
          compressionRatio={compressionInfo.compressionRatio}
          fileName={compressionInfo.fileName}
          show={true}
        />
      )}
    </div>
  );
};

export default LaudoUpload;
