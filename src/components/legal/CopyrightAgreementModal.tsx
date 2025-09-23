// Copyright Agreement modal component

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Copyright } from 'lucide-react';
import CopyrightAgreementContent from './content/CopyrightAgreementContent';

interface CopyrightAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CopyrightAgreementModal: React.FC<CopyrightAgreementModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-slate-900 border-slate-800 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Copyright className="w-5 h-5" />
            Copyright Agreement
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Intellectual property rights and content usage agreement
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <CopyrightAgreementContent />
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t border-slate-700 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopyrightAgreementModal;