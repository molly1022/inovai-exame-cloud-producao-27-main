
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { compressFile } from '@/utils/fileCompression';

interface SimpleImageUploadProps {
  images?: File[];
  onImagesChange?: (images: File[]) => void;
  onUpload?: (urls: string[], names: string[]) => void;
  initialImages?: string[];
  initialNames?: string[];
  maxImages?: number;
  label?: string;
  disabled?: boolean;
}

const SimpleImageUpload = ({ 
  images = [],
  onImagesChange,
  onUpload,
  initialImages = [],
  initialNames = [],
  maxImages = 5, 
  label = "Imagens",
  disabled = false 
}: SimpleImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState<File[]>(images);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    const remainingSlots = maxImages - currentImages.length;
    const filesToProcess = imageFiles.slice(0, remainingSlots);
    
    setIsUploading(true);
    
    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          const { compressedFile } = await compressFile(file, {
            type: 'exam',
            quality: 0.9
          });
          return compressedFile;
        })
      );
      
      const newImages = [...currentImages, ...compressedFiles];
      setCurrentImages(newImages);

      if (onImagesChange) {
        onImagesChange(newImages);
      }

      if (onUpload) {
        const urls = newImages.map(file => URL.createObjectURL(file));
        const names = newImages.map(file => file.name);
        onUpload(urls, names);
      }
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      const newImages = [...currentImages, ...filesToProcess];
      setCurrentImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    setCurrentImages(newImages);
    
    if (onImagesChange) {
      onImagesChange(newImages);
    }

    if (onUpload) {
      const urls = newImages.map(file => URL.createObjectURL(file));
      const names = newImages.map(file => file.name);
      onUpload(urls, names);
    }
  };

  const displayImages = currentImages.length > 0 ? currentImages : [];

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <div className="mt-2">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="simple-images-upload"
            disabled={disabled || isUploading || currentImages.length >= maxImages}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('simple-images-upload')?.click()}
            className="w-full h-20 border-dashed border-2 hover:bg-gray-50"
            disabled={disabled || isUploading || currentImages.length >= maxImages}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                {currentImages.length >= maxImages ? 
                  `Limite máximo (${maxImages}) atingido` :
                  `Adicionar Imagens (${currentImages.length}/${maxImages})`
                }
              </>
            )}
          </Button>
        </div>
      </div>

      {displayImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {displayImages.map((image, index) => (
            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={URL.createObjectURL(image)}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {initialImages.length > 0 && currentImages.length === 0 && (
        <div className="grid grid-cols-3 gap-2">
          {initialImages.map((url, index) => (
            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={url}
                alt={`Imagem inicial ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                {initialNames[index] || `Imagem ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleImageUpload;
