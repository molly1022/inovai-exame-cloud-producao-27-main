
import { Info, FileImage, Minimize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize } from "@/utils/fileCompression";

interface FileCompressionInfoProps {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
  show: boolean;
}

const FileCompressionInfo = ({
  originalSize,
  compressedSize,
  compressionRatio,
  fileName,
  show
}: FileCompressionInfoProps) => {
  if (!show || compressionRatio <= 0) return null;

  return (
    <Card className="mt-3 border-green-200 bg-green-50">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="p-1.5 bg-green-100 rounded-full">
            <Minimize2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <FileImage className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Arquivo compactado com sucesso!
              </span>
            </div>
            
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Arquivo:</span>
                <span className="font-medium truncate max-w-[200px]">{fileName}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamanho original:</span>
                <span className="font-medium">{formatFileSize(originalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamanho compactado:</span>
                <span className="font-medium">{formatFileSize(compressedSize)}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-1">
                <span>Economia:</span>
                <span className="font-bold text-green-800">
                  {compressionRatio.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <Info className="h-3 w-3" />
              <span>O arquivo foi otimizado para economia de espaço mantendo a qualidade.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCompressionInfo;
