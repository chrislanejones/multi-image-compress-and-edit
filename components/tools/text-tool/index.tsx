'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

interface TextToolProps {
  imageUrl: string;
  onApplyText: (textedImageUrl: string) => void;
  onCancel: () => void;
  setEditorState: (state: any) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
}

const TextTool: React.FC<TextToolProps> = ({ imageUrl, onApplyText, onCancel }) => {
  const handleApply = () => {
    onApplyText(imageUrl);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Text Tool</h2>
        <div className="flex gap-2">
          <Button onClick={handleApply} size="sm">
            <Check className="h-4 w-4 mr-2" />
            Apply
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        <Image
          src={imageUrl}
          alt="Text preview"
          width={800}
          height={600}
          className="max-w-full max-h-full object-contain rounded shadow-lg"
        />
      </div>
    </div>
  );
};

export default TextTool;
