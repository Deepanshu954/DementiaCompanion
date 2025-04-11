import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Phone } from "lucide-react";
import { Link } from "wouter";

interface CaretakerWithProfileProps {
  id: number;
  userId: number;
  user: {
    fullName: string;
    email: string;
  };
  bio: string;
  pricePerDay: number;
  yearsExperience: number;
  location: string;
  specializations: string[];
  isCertified: boolean;
  isBackgroundChecked: boolean;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
}

export function CaretakerProfile({ 
  caretaker, 
  showActions = true 
}: { 
  caretaker: CaretakerWithProfileProps; 
  showActions?: boolean;
}) {
  const contactInfo = [
    { icon: "✉️", label: "Email", value: caretaker.user.email },
    { icon: "📱", label: "Phone", value: caretaker.phoneNumber || "Not provided" },
    { icon: "📍", label: "Location", value: caretaker.location },
    { icon: "💼", label: "Experience", value: `${caretaker.yearsExperience} years` },
    { icon: "💰", label: "Rate", value: `$${caretaker.pricePerDay}/day` }
  ];
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
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 half-star" />);
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-neutral-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-4 border-2 border-primary-100 rounded-lg">
      <Avatar className="w-32 h-32 border-4 border-primary-100">
        <AvatarImage src={caretaker.imageUrl} alt={caretaker.user.fullName} />
        <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
          {getInitials(caretaker.user.fullName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-xl font-bold text-neutral-800">{caretaker.user.fullName}</h3>
        <p className="text-neutral-600 mb-2">
          Professional caretaker with {caretaker.yearsExperience} years experience
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
          {caretaker.specializations.map((specialization, index) => (
            <Badge key={index} variant="outline" className="bg-primary-50 text-primary-600 border-primary-100">
              {specialization}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-center md:justify-start">
          {renderStars(caretaker.rating || 0)}
          <span className="ml-2 font-medium">{caretaker.rating?.toFixed(1) || "New"}</span>
          {caretaker.reviewCount ? (
            <span className="text-neutral-600 ml-1">({caretaker.reviewCount} reviews)</span>
          ) : null}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactInfo.map((info, index) => (
          <div key={index} className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <span className="text-xl mr-2">{info.icon}</span>
            <div>
              <div className="text-sm text-neutral-500">{info.label}</div>
              <div className="font-medium">{info.value}</div>
            </div>
          </div>
        ))}
      </div>

      {showActions && (
        <div className="flex flex-col gap-3 mt-6">
          <Button className="flex items-center justify-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
        </div>
      )}
    </div>
  );
}

export default CaretakerProfile;
