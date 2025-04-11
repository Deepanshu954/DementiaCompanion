import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchFilters } from "@/components/caretakers/search-filters";
import { CaretakerCard } from "@/components/caretakers/caretaker-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FindCaretakers() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch caretakers based on filters
  const { data: caretakers = [], isLoading } = useQuery({
    queryKey: ["/api/caretakers", filters],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Sort caretakers
  const sortedCaretakers = [...caretakers].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.pricePerDay - b.pricePerDay;
      case "price_high":
        return b.pricePerDay - a.pricePerDay;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        // relevance is default sorting, keep original order
        return 0;
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
      
      {/* Results */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-neutral-800">
            {isLoading ? "Searching..." : `${sortedCaretakers.length} Caretakers Found`}
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
