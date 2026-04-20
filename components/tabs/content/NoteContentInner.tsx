'use client';

import { useTabStore } from '@/stores/tabstore';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface NoteContentInnerProps {
  noteId: string;
  folderId?: string;
}

const NoteContentInner = ({ noteId, folderId }: NoteContentInnerProps) => {
  const updateTabTitle = useTabStore((s) => s.updateTabTitle);
  const [panelWidth, setPanelWidth] = useState(420);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  

  return (
    <div  className="">
     <h1>Note Content Inner</h1>
     <p>Note ID: {noteId}</p>
     <p>Folder ID: {folderId}</p>
    </div>
  );
};

export default NoteContentInner;