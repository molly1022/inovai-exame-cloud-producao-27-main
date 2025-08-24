
// Utilitário para compactação de imagens
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Utilitário para compactação de PDFs (simplificado)
export const compressPDF = async (file: File): Promise<File> => {
  // Para PDFs, vamos apenas verificar o tamanho
  // Se for muito grande, sugerimos redução de qualidade
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size <= maxSize) {
    return file;
  }
  
  // Por enquanto, retorna o arquivo original
  // Em uma implementação mais avançada, usaríamos uma biblioteca como pdf-lib
  return file;
};

// Função principal de compactação baseada no tipo de arquivo
export const compressFile = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    type?: 'profile' | 'document' | 'exam';
  } = {}
): Promise<{ originalFile: File; compressedFile: File; compressionRatio: number }> => {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8, type = 'document' } = options;
  
  // Configurações específicas por tipo
  const configs = {
    profile: { maxWidth: 400, maxHeight: 400, quality: 0.9 },
    document: { maxWidth: 1920, maxHeight: 1920, quality: 0.8 },
    exam: { maxWidth: 2048, maxHeight: 2048, quality: 0.9 } // Manter alta qualidade para exames
  };
  
  const config = configs[type];
  
  let compressedFile = file;
  
  // Verificar se é imagem
  if (file.type.startsWith('image/')) {
    compressedFile = await compressImage(
      file,
      config.maxWidth,
      config.maxHeight,
      config.quality
    );
  } else if (file.type === 'application/pdf') {
    compressedFile = await compressPDF(file);
  }
  
  const compressionRatio = file.size > 0 ? (1 - compressedFile.size / file.size) * 100 : 0;
  
  return {
    originalFile: file,
    compressedFile,
    compressionRatio
  };
};

// Utilitário para formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
