import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, CheckCircle, Navigation } from "lucide-react";
import { Link } from "wouter";

import { CaretakerProfile } from "@/lib/mockCaretakerData";

interface CaretakerCardProps {
  caretaker: CaretakerProfile & {
    matchScore?: number;
    isTopMatch?: boolean;
  };
}

export function CaretakerCard({ caretaker }: CaretakerCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Generate stars for rating
  const renderStars = (rating: number = 0) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 half-star" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-neutral-300" />);
      }
    }
    
    return stars;
  };

  return (
    <Card className={`h-full hover:border-primary-500 hover:border-2 transition-all 
      ${caretaker.isTopMatch ? 'border-2 border-primary-500 shadow-lg' : ''}`}>
      {caretaker.isTopMatch && (
        <div className="absolute -top-2 -right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold transform rotate-12 shadow-md z-10">
          Top Match!
        </div>
      )}
      {caretaker.providesLiveLocation && (
        <div className="absolute -top-2 -left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md z-10 flex items-center">
          <Navigation className="h-3 w-3 mr-1 animate-pulse" />
          24/7 Tracking
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Avatar className={`h-16 w-16 border-2 ${caretaker.isTopMatch ? 'border-primary-500' : 'border-primary-100'}`}>
              <AvatarImage src={caretaker.imageUrl} alt={caretaker.user.fullName} />
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {getInitials(caretaker.user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-neutral-800">{caretaker.user.fullName}</h3>
              <div className="flex items-center">
                {renderStars(caretaker.rating || 0)}
                <span className="ml-1 text-sm font-medium">{caretaker.rating?.toFixed(1) || "New"}</span>
                {caretaker.reviewCount ? (
                  <span className="text-neutral-600 text-sm ml-1">({caretaker.reviewCount})</span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-bold mb-1">
              ${caretaker.pricePerDay}<span className="text-sm font-normal">/day</span>
            </div>
            {caretaker.matchScore !== undefined && (
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                Match: {Math.round(caretaker.matchScore / 2)}%
              </div>
            )}
          </div>
        </div>
        
        <p className="text-neutral-600 mb-4">{caretaker.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {caretaker.specializations.map((specialization, index) => (
            <Badge key={index} variant="outline" className="bg-primary-50 text-primary-600 border-primary-100">
              {specialization}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-neutral-600 flex-wrap">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="text-sm">{caretaker.location}</span>
            {caretaker.isBackgroundChecked && (
              <>
                <span className="mx-2">•</span>
                <CheckCircle className="mr-1 h-4 w-4 text-primary-600" />
                <span className="text-sm">Background Checked</span>
              </>
            )}
            {caretaker.providesLiveLocation && (
              <>
                <span className="mx-2">•</span>
                <Navigation className="mr-1 h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-600 font-medium">Live Location</span>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/caretakers/${caretaker.userId}`}>
            <Button className="w-full" asChild>
              <a>View Profile</a>
            </Button>
          </Link>
          <Link href={`/caretakers/${caretaker.userId}/contact`}>
            <Button variant="outline" className="w-full">Contact</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
