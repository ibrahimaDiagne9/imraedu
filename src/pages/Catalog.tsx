import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SlidersHorizontal, BookOpen, X } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import api from '../api';

const fetchCourses = async () => {
  const { data } = await api.get('/courses/');
  return data;
};

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearchQuery(searchParams.get('search') || '');
    }
  }, [searchParams]);
  
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const filteredCourses = courses.filter((c: any) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.instructor_name && c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(c.level);
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="container py-3xl">
      <div className="flex justify-between items-center mb-xl">
        <h1 className="text-h1">Catalog</h1>
        <div className="text-secondary font-medium">Showing {filteredCourses.length} free courses</div>
      </div>

      <div className="catalog-layout">
        {/* Filters Sidebar Overlay & Drawer */}
        {isMobileFiltersOpen && <div className="drawer-overlay" onClick={() => setIsMobileFiltersOpen(false)}></div>}
        <aside className={`flex-col gap-lg ${isMobileFiltersOpen ? 'open' : ''}`}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', width: '100%' }}>
            <div className="flex items-center justify-between mb-md pb-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-sm">
                <SlidersHorizontal size={18} className="text-brand" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="hide-on-desktop" 
                style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-lg">
              <h4 className="font-semibold mb-sm text-small">Subject</h4>
              <div className="flex-col gap-xs text-small">
                {['Data Science', 'Business', 'Computer Science', 'Health', 'Arts and Humanities'].map(subject => (
                  <label key={subject} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" /> <span>{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-lg">
              <h4 className="font-semibold mb-sm text-small">Level</h4>
              <div className="flex-col gap-xs text-small">
                {['Beginner', 'Intermediate', 'Advanced', 'Mixed'].map(level => (
                  <label key={level} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span style={{ fontWeight: selectedLevels.includes(level) ? 600 : 400, color: selectedLevels.includes(level) ? 'var(--brand-blue)' : 'inherit' }}>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-lg">
              <h4 className="font-semibold mb-sm text-small">Duration</h4>
              <div className="flex-col gap-xs text-small">
                {['Less than 2 hours', '1-4 weeks', '1-3 months', '3-6 months'].map(dur => (
                  <label key={dur} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" /> <span>{dur}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Mobile Apply Button */}
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="btn btn-primary w-full hide-on-desktop mt-lg"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Results Area */}
        <div>
          <div className="flex gap-md mb-xl flex-col-mobile">
            <div className="flex-grow flex items-center" style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-strong)' }}>
              <Search size={18} className="text-tertiary" />
              <input 
                type="text" 
                placeholder="Search courses, skills, or providers..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setSearchParams({ search: e.target.value }, { replace: true });
                  } else {
                    setSearchParams({}, { replace: true });
                  }
                }}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontFamily: 'inherit', fontSize: '1rem' }}
              />
            </div>
            <div className="flex gap-sm w-full-mobile">
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="btn btn-secondary flex items-center justify-center gap-sm flex-1 hide-on-desktop"
              >
                <SlidersHorizontal size={18} /> Filters {selectedLevels.length > 0 && `(${selectedLevels.length})`}
              </button>
              <button className="btn btn-secondary flex items-center justify-center gap-sm flex-1">
                <Filter size={18} /> Sort by: Popularity
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-3xl text-tertiary">Loading courses...</div>
          ) : isError ? (
            <div className="text-center py-3xl text-accent-red">Error loading courses. Please make sure the backend is running.</div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-3 gap-lg">
              {filteredCourses.map((course: any) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="flex-col items-center justify-center py-3xl text-center">
              <BookOpen size={48} className="text-tertiary mb-md" />
              <h3 className="text-h3 mb-sm">No courses found</h3>
              <p className="text-secondary">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
