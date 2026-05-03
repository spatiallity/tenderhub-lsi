import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Users, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';
import Modal, { ModalBody } from './Modal';

/**
 * GlobalSearch Component - Cmd+K / Ctrl+K search modal
 * Searches across tenders, RUP, experts, and status
 */
const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { tenders, rupList, experts, setSelectedTenderId, setSelectedRupId, setSelectedExpertId } = useAppContext();
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  // Search logic
  const searchResults = React.useMemo(() => {
    const results = [];
    if (!query.trim()) {
      // Default results: top 10 recent tenders
      (tenders || []).slice(0, 10).forEach(tender => {
        results.push({
          type: 'tender',
          id: tender.id,
          title: tender.nama,
          subtitle: tender.instansi,
          icon: Search,
          score: 1,
          data: tender,
        });
      });
      return results;
    }
    
    const q = query.toLowerCase();
    
    // Search tenders
    (tenders || []).forEach(tender => {
      const matchScore = 
        (tender.nama?.toLowerCase().includes(q) ? 10 : 0) +
        (tender.instansi?.toLowerCase().includes(q) ? 5 : 0) +
        (tender.lokasi_pekerjaan?.toLowerCase().includes(q) ? 3 : 0) +
        ((tender.matched || []).some(kw => kw.toLowerCase().includes(q)) ? 8 : 0);
      
      if (matchScore > 0) {
        results.push({
          type: 'tender',
          id: tender.id,
          title: tender.nama,
          subtitle: tender.instansi,
          icon: Search,
          score: matchScore,
          data: tender,
        });
      }
    });
    
    // Search RUP
    (rupList || []).forEach(rup => {
      const matchScore = 
        (rup.nama_paket?.toLowerCase().includes(q) ? 10 : 0) +
        (rup.nama_satker?.toLowerCase().includes(q) ? 5 : 0) +
        (rup.lokasi?.toLowerCase().includes(q) ? 3 : 0);
      
      if (matchScore > 0) {
        results.push({
          type: 'rup',
          id: rup.id,
          title: rup.nama_paket,
          subtitle: rup.nama_satker,
          icon: FileText,
          score: matchScore,
          data: rup,
        });
      }
    });
    
    // Search experts
    (experts || []).forEach(expert => {
      const matchScore = 
        (expert.nama?.toLowerCase().includes(q) ? 10 : 0) +
        (expert.instansi?.toLowerCase().includes(q) ? 5 : 0) +
        ((expert.keahlian || []).some(k => k.toLowerCase().includes(q)) ? 8 : 0) +
        ((expert.portofolio || []).some(p => p.toLowerCase().includes(q)) ? 5 : 0);
      
      if (matchScore > 0) {
        results.push({
          type: 'expert',
          id: expert.id,
          title: expert.nama,
          subtitle: expert.instansi || (expert.keahlian || []).join(', '),
          icon: Users,
          score: matchScore,
          data: expert,
        });
      }
    });
    
    // Sort by score and limit to 10 results. Order: RUP > Tender > Expert when scores are equal.
    return results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const typeOrder = { rup: 3, tender: 2, expert: 1 };
      return (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
    }).slice(0, 10);
  }, [query, tenders, rupList, experts]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(searchResults[selectedIndex]);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults]);
  
  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);
  
  const handleSelect = (result) => {
    if (result.type === 'tender') {
      setSelectedTenderId(result.id);
      navigate('/tender');
    } else if (result.type === 'rup') {
      setSelectedRupId(result.id);
      navigate('/rup');
    } else if (result.type === 'expert') {
      setSelectedExpertId(result.id);
      navigate('/experts');
    }
    onClose();
  };
  
  const getTypeLabel = (type) => {
    const labels = {
      tender: 'Tender',
      rup: 'RUP',
      expert: 'Tenaga Ahli',
    };
    return labels[type] || type;
  };
  
  const getTypeBadgeColor = (type) => {
    const colors = {
      tender: 'bg-blue-100 text-blue-700',
      rup: 'bg-green-100 text-green-700',
      expert: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      closeOnBackdrop={true}
      closeOnEsc={true}
      showCloseButton={false}
      className="!mt-20"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tender, RUP, atau tenaga ahli..."
            className="w-full pl-10 pr-10 py-3 text-sm border-0 focus:outline-none focus:ring-0"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={searchResults[selectedIndex] ? `result-${selectedIndex}` : undefined}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Results */}
      <ModalBody className="!p-0 max-h-[400px]">
        {searchResults.length === 0 ? (
          <div className="p-8 text-center">
            <Search size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Tidak ada hasil</p>
            <p className="text-xs text-slate-600">
              Coba kata kunci lain atau periksa ejaan
            </p>
          </div>
        ) : (
          <div 
            id="search-results" 
            role="listbox"
            aria-label="Search results"
          >
            {searchResults.map((result, index) => {
              const Icon = result.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  id={`result-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-4 p-4 text-left transition-colors border-b border-slate-100 last:border-0 ${
                    isSelected 
                      ? 'bg-blue-50' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-slate-600'} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getTypeBadgeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                      {result.title}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  
                  <ArrowRight size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        )}
      </ModalBody>
      
      {/* Footer with keyboard hints */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-slate-300 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-slate-300 rounded">↓</kbd>
              <span>navigasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-slate-300 rounded">Enter</kbd>
              <span>pilih</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 font-semibold bg-white border border-slate-300 rounded">Esc</kbd>
              <span>tutup</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GlobalSearch;
