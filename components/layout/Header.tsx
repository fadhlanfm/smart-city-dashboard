"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/types';
import { signOut } from 'next-auth/react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch logic
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          let serverResults = data.data || [];
          
          try {
            const localStr = localStorage.getItem('mock_new_assets');
            const deletedStr = localStorage.getItem('mock_deleted_assets');
            const localAssets = localStr ? JSON.parse(localStr) : [];
            const deletedAssets = deletedStr ? JSON.parse(deletedStr) : [];
            
            const q = debouncedQuery.toLowerCase();
            const localMatches = localAssets.filter((a: any) => 
              (a.name?.toLowerCase().includes(q) || a.districtName?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q))
              && !deletedAssets.includes(a.id)
            ).map((a: any) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              status: a.status,
              district: a.districtName || 'Unknown'
            }));
            
            serverResults = [...localMatches, ...serverResults]
              .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
              .filter(v => !deletedAssets.includes(v.id));
          } catch(e) {}

          setResults(serverResults);
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/map?assetId=${result.id}`);
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex-1 flex items-center gap-4">
        <h2 className="text-lg font-semibold tracking-tight hidden md:block">
          Smart City Ops
        </h2>
        
        {/* Search Component */}
        <div className="relative w-full max-w-md ml-4">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="relative" id="tour-search">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets by name, address, ID..."
                  className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length > 0) setIsOpen(true);
                    else setIsOpen(false);
                  }}
                  onFocus={() => {
                    if (query.length > 0) setIsOpen(true);
                  }}
                />
                {isLoading && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
              <div className="max-h-[300px] overflow-y-auto p-1">
                {query.length > 0 && query.length < 3 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Please type at least 3 characters to search...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  results.map((r) => (
                    <div 
                      key={r.id} 
                      className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelect(r)}
                    >
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.district} • {r.type}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.dispatchEvent(new Event('start-tour'))}
          className="font-semibold"
        >
          Tutorial
        </Button>
        <Button variant="outline" size="sm" onClick={() => signOut()} className="font-semibold">
          Logout
        </Button>
      </div>
    </header>
  );
}
