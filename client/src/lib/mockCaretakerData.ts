// Mock data for caretakers to test the search functionality
// This will be replaced by actual API data once the backend is ready

export interface CaretakerProfile {
  id: number;
  userId: number;
  user: {
    fullName: string;
    email: string;
  };
  bio: string;
  pricePerDay: number;
  location: string;
  serviceAreas: string[];
  specializations: string[];
  gender: string;
  age: number;
  yearsExperience: number;
  isCertified: boolean;
  isBackgroundChecked: boolean;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
}

export const mockCaretakers: CaretakerProfile[] = [
  {
    id: 1,
    userId: 101,
    user: {
      fullName: "Emma Wilson",
      email: "emma.wilson@example.com"
    },
    bio: "Certified nurse with specialized training in dementia care. Compassionate and patient with 8 years of experience working with elderly patients.",
    pricePerDay: 180,
    location: "Boston, MA",
    serviceAreas: ["Boston", "Cambridge", "Somerville"],
    gender: "female",
    age: 32,
    yearsExperience: 8,
    specializations: ["Alzheimer's care", "Medication management", "Memory care"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 32,
    imageUrl: "https://randomuser.me/api/portraits/women/22.jpg"
  },
  {
    id: 2,
    userId: 102,
    user: {
      fullName: "James Miller",
      email: "james.miller@example.com"
    },
    bio: "Former hospital administrator with a focus on elderly care. Known for creating structured routines that help dementia patients feel secure and oriented.",
    pricePerDay: 210,
    location: "Chicago, IL",
    serviceAreas: ["Chicago", "Evanston", "Oak Park"],
    gender: "male",
    age: 45,
    yearsExperience: 15,
    specializations: ["Dementia care", "Parkinson's assistance", "Daily living assistance"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 47,
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3,
    userId: 103,
    user: {
      fullName: "Sophia Rodriguez",
      email: "sophia.rodriguez@example.com"
    },
    bio: "Trained in occupational therapy with a focus on cognitive stimulation for dementia patients. Bilingual in English and Spanish.",
    pricePerDay: 165,
    location: "Miami, FL",
    serviceAreas: ["Miami", "Coral Gables", "Miami Beach"],
    gender: "female",
    age: 28,
    yearsExperience: 5,
    specializations: ["Cognitive therapy", "Bilingual care", "Memory exercises"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 19,
    imageUrl: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    id: 4,
    userId: 104,
    user: {
      fullName: "David Chen",
      email: "david.chen@example.com"
    },
    bio: "Nurse practitioner with specialized dementia training. Expert in managing behavioral symptoms and reducing agitation through environmental adjustments.",
    pricePerDay: 195,
    location: "San Francisco, CA",
    serviceAreas: ["San Francisco", "Oakland", "Berkeley"],
    gender: "male",
    age: 37,
    yearsExperience: 10,
    specializations: ["Behavioral management", "Medication supervision", "Fall prevention"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 28,
    imageUrl: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    id: 5,
    userId: 105,
    user: {
      fullName: "Olivia Thompson",
      email: "olivia.thompson@example.com"
    },
    bio: "Social worker with extensive background in dementia care. Focuses on maintaining dignity and quality of life while incorporating family in the care plan.",
    pricePerDay: 175,
    location: "Seattle, WA",
    serviceAreas: ["Seattle", "Bellevue", "Tacoma"],
    gender: "female",
    age: 41,
    yearsExperience: 12,
    specializations: ["Family coordination", "Social engagement", "Emotional support"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 35,
    imageUrl: "https://randomuser.me/api/portraits/women/35.jpg"
  },
  {
    id: 6,
    userId: 106,
    user: {
      fullName: "Michael Patel",
      email: "michael.patel@example.com"
    },
    bio: "Physical therapist with additional certification in dementia care. Specializes in maintaining mobility and preventing physical decline in dementia patients.",
    pricePerDay: 190,
    location: "Austin, TX",
    serviceAreas: ["Austin", "Round Rock", "Cedar Park"],
    gender: "male",
    age: 34,
    yearsExperience: 9,
    specializations: ["Physical therapy", "Mobility assistance", "Exercise programs"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 22,
    imageUrl: "https://randomuser.me/api/portraits/men/58.jpg"
  },
  {
    id: 7,
    userId: 107,
    user: {
      fullName: "Amelia Garcia",
      email: "amelia.garcia@example.com"
    },
    bio: "Nutritionist with dementia care training. Expert in developing meal plans that address cognitive needs while accommodating eating difficulties common in dementia.",
    pricePerDay: 155,
    location: "Denver, CO",
    serviceAreas: ["Denver", "Boulder", "Aurora"],
    gender: "female",
    age: 30,
    yearsExperience: 6,
    specializations: ["Nutrition planning", "Hydration monitoring", "Feeding assistance"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.5,
    reviewCount: 17,
    imageUrl: "https://randomuser.me/api/portraits/women/42.jpg"
  },
  {
    id: 8,
    userId: 108,
    user: {
      fullName: "William Jackson",
      email: "william.jackson@example.com"
    },
    bio: "Former geriatric nurse with 20 years of experience. Specializes in late-stage dementia care and palliative approaches for maximum comfort.",
    pricePerDay: 225,
    location: "Philadelphia, PA",
    serviceAreas: ["Philadelphia", "Camden", "King of Prussia"],
    gender: "male",
    age: 50,
    yearsExperience: 20,
    specializations: ["Late-stage care", "Palliative care", "Pain management"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 43,
    imageUrl: "https://randomuser.me/api/portraits/men/64.jpg"
  },
  {
    id: 9,
    userId: 109,
    user: {
      fullName: "Isabella Wong",
      email: "isabella.wong@example.com"
    },
    bio: "Art therapist with dementia care certification. Uses creative expression to improve communication and emotional well-being in patients with cognitive decline.",
    pricePerDay: 170,
    location: "Portland, OR",
    serviceAreas: ["Portland", "Beaverton", "Gresham"],
    gender: "female",
    age: 36,
    yearsExperience: 8,
    specializations: ["Art therapy", "Creative stimulation", "Non-verbal communication"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 25,
    imageUrl: "https://randomuser.me/api/portraits/women/50.jpg"
  },
  {
    id: 10,
    userId: 110,
    user: {
      fullName: "Benjamin Smith",
      email: "benjamin.smith@example.com"
    },
    bio: "Licensed practical nurse with dementia specialization. Skilled in managing complex medical needs alongside cognitive care requirements.",
    pricePerDay: 185,
    location: "Minneapolis, MN",
    serviceAreas: ["Minneapolis", "St. Paul", "Bloomington"],
    gender: "male",
    age: 42,
    yearsExperience: 14,
    specializations: ["Medical care coordination", "Wound care", "Diabetes management"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 31,
    imageUrl: "https://randomuser.me/api/portraits/men/76.jpg"
  },
  {
    id: 11,
    userId: 111,
    user: {
      fullName: "Charlotte Brown",
      email: "charlotte.brown@example.com"
    },
    bio: "Former music therapist with specialized training in dementia care. Uses music to trigger memories and improve mood in patients with cognitive impairment.",
    pricePerDay: 160,
    location: "Nashville, TN",
    serviceAreas: ["Nashville", "Franklin", "Brentwood"],
    gender: "female",
    age: 44,
    yearsExperience: 11,
    specializations: ["Music therapy", "Memory stimulation", "Emotional regulation"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 29,
    imageUrl: "https://randomuser.me/api/portraits/women/60.jpg"
  },
  {
    id: 12,
    userId: 112,
    user: {
      fullName: "Ethan Nguyen",
      email: "ethan.nguyen@example.com"
    },
    bio: "Psychiatric nurse with dementia care expertise. Specializes in managing challenging behaviors and sundowning symptoms with non-pharmaceutical approaches.",
    pricePerDay: 200,
    location: "San Diego, CA",
    serviceAreas: ["San Diego", "La Jolla", "Chula Vista"],
    gender: "male",
    age: 39,
    yearsExperience: 12,
    specializations: ["Behavioral intervention", "Anxiety management", "Sleep improvement"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 34,
    imageUrl: "https://randomuser.me/api/portraits/men/85.jpg"
  }
];

// Function to filter caretakers based on search criteria
export function filterCaretakers(caretakers: CaretakerProfile[], filters: any) {
  return caretakers.filter(caretaker => {
    // Location filter
    if (filters.location && !caretaker.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Service area filter
    if (filters.serviceArea && !caretaker.serviceAreas.some((area: string) => 
      area.toLowerCase().includes(filters.serviceArea.toLowerCase()))) {
      return false;
    }
    
    // Specialization filter
    if (filters.specialization && !caretaker.specializations.some((spec: string) => 
      spec.toLowerCase().includes(filters.specialization.toLowerCase()))) {
      return false;
    }
    
    // Price range filter
    if (filters.minPrice && caretaker.pricePerDay < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && caretaker.pricePerDay > filters.maxPrice) {
      return false;
    }
    
    // Gender filter
    if (filters.gender && caretaker.gender !== filters.gender) {
      return false;
    }
    
    // Age range filter
    if (filters.minAge && caretaker.age < filters.minAge) {
      return false;
    }
    if (filters.maxAge && caretaker.age > filters.maxAge) {
      return false;
    }
    
    // Certification filter
    if (filters.isCertified && !caretaker.isCertified) {
      return false;
    }
    
    // Background check filter
    if (filters.isBackgroundChecked && !caretaker.isBackgroundChecked) {
      return false;
    }
    
    // Availability filter
    if (filters.isAvailable && !caretaker.isAvailable) {
      return false;
    }
    
    return true;
  });
}

// Function to score and rank caretakers based on preference matching
export function rankCaretakers(caretakers: CaretakerProfile[], preferences: any) {
  // Clone the array to avoid mutating the original
  const rankedCaretakers = [...caretakers];
  
  // Calculate a score for each caretaker based on how well they match preferences
  rankedCaretakers.forEach(caretaker => {
    let score = 0;
    
    // Base score from ratings
    score += (caretaker.rating || 4.0) * 10; // Maximum 50 points for a perfect 5.0 rating
    
    // Location matching gives a bonus
    if (preferences.location && caretaker.location.toLowerCase().includes(preferences.location.toLowerCase())) {
      score += 20;
    }
    
    // Service area matching
    if (preferences.serviceArea && caretaker.serviceAreas.some(area => 
      area.toLowerCase().includes(preferences.serviceArea.toLowerCase()))) {
      score += 15;
    }
    
    // Gender preference matching
    if (preferences.gender && caretaker.gender === preferences.gender) {
      score += 15;
    }
    
    // Age range matching
    if (preferences.minAge && preferences.maxAge && 
        caretaker.age >= preferences.minAge && caretaker.age <= preferences.maxAge) {
      score += 15;
    }
    
    // Price matching (lower is better if max price is set)
    if (preferences.maxPrice) {
      // The further below the max price, the higher the score
      const priceDifference = preferences.maxPrice - caretaker.pricePerDay;
      if (priceDifference > 0) {
        score += Math.min(20, priceDifference / 5); // Maximum 20 points for price
      }
    }
    
    // Specialization matching
    if (preferences.specialization && caretaker.specializations.some(spec => 
      spec.toLowerCase().includes(preferences.specialization.toLowerCase()))) {
      score += 25;
    }
    
    // Certification and background check bonuses
    if (preferences.isCertified && caretaker.isCertified) {
      score += 15;
    }
    if (preferences.isBackgroundChecked && caretaker.isBackgroundChecked) {
      score += 15;
    }
    
    // Experience bonus
    score += Math.min(20, caretaker.yearsExperience * 2); // Maximum 20 points for experience
    
    // Store the score with the caretaker object
    (caretaker as any).matchScore = score;
  });
  
  // Sort by score (highest first)
  return rankedCaretakers.sort((a, b) => (b as any).matchScore - (a as any).matchScore);
}

// Function to get top caretaker recommendations based on preferences
export function getTopRecommendations(caretakers: CaretakerProfile[], preferences: any, count: number = 3) {
  const filteredCaretakers = filterCaretakers(caretakers, preferences);
  const rankedCaretakers = rankCaretakers(filteredCaretakers, preferences);
  return rankedCaretakers.slice(0, count);
}