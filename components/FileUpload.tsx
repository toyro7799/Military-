import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : 'border-blue-400 hover:border-blue-600 hover:bg-blue-50 bg-white'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-blue-100 p-4 rounded-full">
          {disabled ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Upload className="w-8 h-8 text-blue-600" />}
        </div>
        <div className="text-gray-700">
          <p className="text-lg font-semibold">انقر لرفع صورة أو اسحبها هنا</p>
          <p className="text-sm text-gray-500 mt-1">يدعم JPG, PNG (صور جداول واضحة)</p>
        </div>
      </div>
    </div>
  );
};