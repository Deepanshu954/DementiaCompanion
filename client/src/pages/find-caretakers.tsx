import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchFilters } from "@/components/caretakers/search-filters";
import { CaretakerCard } from "@/components/caretakers/caretaker-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react";
import { mockCaretakers, filterCaretakers, rankCaretakers, getTopRecommendations } from "@/lib/mockCaretakerData";

export default function FindCaretakers() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // For development: use mock data instead of API
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCaretakers, setFilteredCaretakers] = useState(mockCaretakers);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  
  // Apply filters and set top matches when filters change
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Filter and rank caretakers based on preferences
      let filtered = filterCaretakers(mockCaretakers, filters);
      const ranked = rankCaretakers(filtered, filters);
      
      // If we've specifically requested live location, make sure they appear in top matches
      let topMatchCriteria = {...filters};
      if (filters.providesLiveLocation) {
        topMatchCriteria.providesLiveLocation = true;
      }
      
      // Get top 3 recommendations if there are enough filtered caretakers
      const recommendations = getTopRecommendations(mockCaretakers, topMatchCriteria, 3)
        .map(caretaker => ({
          ...caretaker,
          isTopMatch: true // Mark these as top matches
        }));
      
      setFilteredCaretakers(ranked);
      setTopMatches(recommendations);
      setIsLoading(false);
    }, 500);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Sort caretakers
  const sortedCaretakers = [...filteredCaretakers].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.pricePerDay - b.pricePerDay;
      case "price_high":
        return b.pricePerDay - a.pricePerDay;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "live_location":
        // Sort by live location availability first, then by rating
        if (a.providesLiveLocation && !b.providesLiveLocation) return -1;
        if (!a.providesLiveLocation && b.providesLiveLocation) return 1;
        return (b.rating || 0) - (a.rating || 0); // If both have same live location status, sort by rating
      default:
        // Default to sorting by match score (highest first)
        return ((b as any).matchScore || 0) - ((a as any).matchScore || 0);
    }
  });

  // Paginate caretakers
  const paginatedCaretakers = sortedCaretakers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedCaretakers.length / itemsPerPage);

  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end of page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if there's a gap
    if (startPage > 2) {
      pageNumbers.push('ellipsis1');
    }
    
    // Add pages in the middle
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if there's a gap
    if (endPage < totalPages - 1 && totalPages > 1) {
      pageNumbers.push('ellipsis2');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-neutral-800">Find a Caretaker</h1>
      
      {/* Search and Filters */}
      <SearchFilters onFilterChange={handleFilterChange} />
      
      {/* Top Matches Section - Only show when we have preferences and top matches */}
      {!isLoading && topMatches.length > 0 && Object.keys(filters).some(key => filters[key]) && (
        <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
          <div className="flex items-center mb-4">
            <ThumbsUp className="h-5 w-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-bold text-primary-800">Top Matches For You</h2>
          </div>
          <p className="text-primary-700 mb-4">
            Based on your preferences, we found these caretakers who might be a perfect fit:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topMatches.map((caretaker) => (
              <CaretakerCard key={`top-${caretaker.id}`} caretaker={caretaker} />
            ))}
          </div>
        </div>
      )}
      
      {/* Results */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-neutral-800">
            {isLoading ? "Searching..." : `${filteredCaretakers.length} Caretakers Found`}
          </h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <label htmlFor="sort" className="mr-2 text-neutral-700">Sort by:</label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger id="sort" className="w-[180px]">
                <SelectValue placeholder="Most Relevant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="live_location">Live Location Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Caretaker Cards */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-neutral-600">Searching for caretakers...</p>
          </div>
        ) : paginatedCaretakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCaretakers.map((caretaker) => (
              <CaretakerCard key={caretaker.id} caretaker={caretaker} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No caretakers found</h3>
            <p className="text-neutral-600 mb-4">Try adjusting your filters or search criteria</p>
            <Button 
              variant="outline" 
              onClick={() => handleFilterChange({})}
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {getPageNumbers().map((page, index) => {
                if (page === 'ellipsis1' || page === 'ellipsis2') {
                  return <span key={page} className="px-2 text-neutral-600">...</span>;
                }
                
                return (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page as number)}
                    className="h-10 w-10"
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
