
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (term: string) => void;
  options: Option[];
  loading?: boolean;
  disabled?: boolean;
}

const SearchableSelect = ({
  placeholder,
  value,
  onValueChange,
  onSearch,
  options,
  loading = false,
  disabled = false
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option label
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setSelectedLabel(selectedOption?.label || '');
  }, [value, options]);

  // Memoizar onSearch para evitar recriação desnecessária
  const debouncedSearch = useCallback(
    (term: string) => {
      if (term.trim() && onSearch) {
        onSearch(term);
      }
    },
    [onSearch]
  );

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        debouncedSearch(searchTerm);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onValueChange(option.value);
    setSelectedLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onValueChange('');
    setSelectedLabel('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className={cn(
            "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
          placeholder={selectedLabel || placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {selectedLabel && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center p-3">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Buscando...</span>
            </div>
          )}

          {!loading && searchTerm && options.length === 0 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              Nenhum resultado encontrado
            </div>
          )}

          {!loading && !searchTerm && (
            <div className="p-3 text-sm text-gray-500 text-center">
              Digite para buscar...
            </div>
          )}

          {!loading && options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
