'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function InlineEditableText({
  value: initialValue,
  onSave,
  className,
  inputClassName,
  placeholder,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      // Error handling usually done by parent or toast
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn('h-auto py-0 px-1 min-h-[24px]', inputClassName)}
        placeholder={placeholder}
        disabled={saving}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        'cursor-text hover:bg-muted/50 rounded px-1 -ml-1 transition-colors border border-transparent hover:border-muted-foreground/20',
        className
      )}
    >
      {value || <span className="text-muted-foreground italic">{placeholder || 'Empty'}</span>}
    </div>
  );
}
