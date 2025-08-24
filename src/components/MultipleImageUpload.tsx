
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { compressFile } from '@/utils/fileCompression';
import FileCompressionInfo from './FileCompressionInfo';

interface MultipleImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  label: string;
  disabled?: boolean;
}

const MultipleImageUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  label,
  disabled = false 
}: MultipleImageUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfos, setCompressionInfos] = useState<any[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToProcess = imageFiles.slice(0, remainingSlots);
    
    setIsCompressing(true);
    const newCompressionInfos: any[] = [];
    
    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          const { originalFile, compressedFile, compressionRatio } = await compressFile(file, {
            type: 'exam',
            quality: 0.9
          });
          
          if (compressionRatio > 5) {
            newCompressionInfos.push({
              originalSize: originalFile.size,
              compressedSize: compressedFile.size,
              compressionRatio,
              fileName: originalFile.name
            });
          }
          
          return compressedFile;
        })
      );
      
      setCompressionInfos(prev => [...prev, ...newCompressionInfos]);
      onImagesChange([...images, ...compressedFiles]);
    } catch (error) {
      console.error('Erro ao compactar imagens:', error);
      onImagesChange([...images, ...filesToProcess]);
    } finally {
      setIsCompressing(false);
      // Limpar o input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newCompressionInfos = compressionInfos.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setCompressionInfos(newCompressionInfos);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label} ({images.length}/{maxImages})</Label>
        <div className="mt-2">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="images-upload"
            disabled={disabled || isCompressing || images.length >= maxImages}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('images-upload')?.click()}
            className="w-full"
            disabled={disabled || isCompressing || images.length >= maxImages}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isCompressing ? 'Compactando...' : 
             images.length >= maxImages ? 'Limite máximo atingido' :
             `Adicionar Imagens (${maxImages - images.length} restantes)`}
          </Button>
        </div>
      </div>

      {/* Preview das imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={URL.createObjectURL(image)}
                alt={`Imagem ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <div className="absolute top-1 right-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-1">
                <p className="text-xs text-gray-600 truncate" title={image.name}>
                  {image.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações de compactação */}
      {compressionInfos.map((info, index) => (
        <FileCompressionInfo
          key={index}
          originalSize={info.originalSize}
          compressedSize={info.compressedSize}
          compressionRatio={info.compressionRatio}
          fileName={info.fileName}
          show={true}
        />
      ))}
    </div>
  );
};

export default MultipleImageUpload;
