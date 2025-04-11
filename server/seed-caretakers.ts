import { db } from './db';
import { users, caretakerProfiles } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

// Define caretaker data types
interface CaretakerSeed {
  username: string;
  password: string;
  email: string;
  fullName: string;
  gender: 'male' | 'female' | 'non-binary';
  age: number;
  role: 'caretaker';
  bio: string;
  pricePerDay: number;
  yearsExperience: number;
  location: string;
  serviceAreas: string[];
  specializations: string[];
  isCertified: boolean;
  isBackgroundChecked: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

// Seed data for 20 diverse caretakers
const caretakerSeedData: CaretakerSeed[] = [
  {
    username: "emma_wilson",
    password: "password123",
    email: "emma.wilson@example.com",
    fullName: "Emma Wilson",
    gender: "female",
    age: 32,
    role: "caretaker",
    bio: "Certified nurse with specialized training in dementia care. Compassionate and patient with 8 years of experience working with elderly patients.",
    pricePerDay: 180,
    yearsExperience: 8,
    location: "Boston, MA",
    serviceAreas: ["Boston", "Cambridge", "Somerville"],
    specializations: ["Alzheimer's care", "Medication management", "Memory care"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/22.jpg"
  },
  {
    username: "james_miller",
    password: "password123",
    email: "james.miller@example.com",
    fullName: "James Miller",
    gender: "male",
    age: 45,
    role: "caretaker",
    bio: "Former hospital administrator with a focus on elderly care. Known for creating structured routines that help dementia patients feel secure and oriented.",
    pricePerDay: 210,
    yearsExperience: 15,
    location: "Chicago, IL",
    serviceAreas: ["Chicago", "Evanston", "Oak Park"],
    specializations: ["Dementia care", "Parkinson's assistance", "Daily living assistance"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    username: "sophia_rodriguez",
    password: "password123",
    email: "sophia.rodriguez@example.com",
    fullName: "Sophia Rodriguez",
    gender: "female",
    age: 28,
    role: "caretaker",
    bio: "Trained in occupational therapy with a focus on cognitive stimulation for dementia patients. Bilingual in English and Spanish.",
    pricePerDay: 165,
    yearsExperience: 5,
    location: "Miami, FL",
    serviceAreas: ["Miami", "Coral Gables", "Miami Beach"],
    specializations: ["Cognitive therapy", "Bilingual care", "Memory exercises"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    username: "david_chen",
    password: "password123",
    email: "david.chen@example.com",
    fullName: "David Chen",
    gender: "male",
    age: 37,
    role: "caretaker",
    bio: "Nurse practitioner with specialized dementia training. Expert in managing behavioral symptoms and reducing agitation through environmental adjustments.",
    pricePerDay: 195,
    yearsExperience: 10,
    location: "San Francisco, CA",
    serviceAreas: ["San Francisco", "Oakland", "Berkeley"],
    specializations: ["Behavioral management", "Medication supervision", "Fall prevention"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    username: "olivia_thompson",
    password: "password123",
    email: "olivia.thompson@example.com",
    fullName: "Olivia Thompson",
    gender: "female",
    age: 41,
    role: "caretaker",
    bio: "Social worker with extensive background in dementia care. Focuses on maintaining dignity and quality of life while incorporating family in the care plan.",
    pricePerDay: 175,
    yearsExperience: 12,
    location: "Seattle, WA",
    serviceAreas: ["Seattle", "Bellevue", "Tacoma"],
    specializations: ["Family coordination", "Social engagement", "Emotional support"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/35.jpg"
  },
  {
    username: "michael_patel",
    password: "password123",
    email: "michael.patel@example.com",
    fullName: "Michael Patel",
    gender: "male",
    age: 34,
    role: "caretaker",
    bio: "Physical therapist with additional certification in dementia care. Specializes in maintaining mobility and preventing physical decline in dementia patients.",
    pricePerDay: 190,
    yearsExperience: 9,
    location: "Austin, TX",
    serviceAreas: ["Austin", "Round Rock", "Cedar Park"],
    specializations: ["Physical therapy", "Mobility assistance", "Exercise programs"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/58.jpg"
  },
  {
    username: "amelia_garcia",
    password: "password123",
    email: "amelia.garcia@example.com",
    fullName: "Amelia Garcia",
    gender: "female",
    age: 30,
    role: "caretaker",
    bio: "Nutritionist with dementia care training. Expert in developing meal plans that address cognitive needs while accommodating eating difficulties common in dementia.",
    pricePerDay: 155,
    yearsExperience: 6,
    location: "Denver, CO",
    serviceAreas: ["Denver", "Boulder", "Aurora"],
    specializations: ["Nutrition planning", "Hydration monitoring", "Feeding assistance"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/42.jpg"
  },
  {
    username: "william_jackson",
    password: "password123",
    email: "william.jackson@example.com",
    fullName: "William Jackson",
    gender: "male",
    age: 50,
    role: "caretaker",
    bio: "Former geriatric nurse with 20 years of experience. Specializes in late-stage dementia care and palliative approaches for maximum comfort.",
    pricePerDay: 225,
    yearsExperience: 20,
    location: "Philadelphia, PA",
    serviceAreas: ["Philadelphia", "Camden", "King of Prussia"],
    specializations: ["Late-stage care", "Palliative care", "Pain management"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/64.jpg"
  },
  {
    username: "isabella_wong",
    password: "password123",
    email: "isabella.wong@example.com",
    fullName: "Isabella Wong",
    gender: "female",
    age: 36,
    role: "caretaker",
    bio: "Art therapist with dementia care certification. Uses creative expression to improve communication and emotional well-being in patients with cognitive decline.",
    pricePerDay: 170,
    yearsExperience: 8,
    location: "Portland, OR",
    serviceAreas: ["Portland", "Beaverton", "Gresham"],
    specializations: ["Art therapy", "Creative stimulation", "Non-verbal communication"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/50.jpg"
  },
  {
    username: "benjamin_smith",
    password: "password123",
    email: "benjamin.smith@example.com",
    fullName: "Benjamin Smith",
    gender: "male",
    age: 42,
    role: "caretaker",
    bio: "Licensed practical nurse with dementia specialization. Skilled in managing complex medical needs alongside cognitive care requirements.",
    pricePerDay: 185,
    yearsExperience: 14,
    location: "Minneapolis, MN",
    serviceAreas: ["Minneapolis", "St. Paul", "Bloomington"],
    specializations: ["Medical care coordination", "Wound care", "Diabetes management"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/76.jpg"
  },
  {
    username: "charlotte_brown",
    password: "password123",
    email: "charlotte.brown@example.com",
    fullName: "Charlotte Brown",
    gender: "female",
    age: 44,
    role: "caretaker",
    bio: "Former music therapist with specialized training in dementia care. Uses music to trigger memories and improve mood in patients with cognitive impairment.",
    pricePerDay: 160,
    yearsExperience: 11,
    location: "Nashville, TN",
    serviceAreas: ["Nashville", "Franklin", "Brentwood"],
    specializations: ["Music therapy", "Memory stimulation", "Emotional regulation"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/60.jpg"
  },
  {
    username: "ethan_nguyen",
    password: "password123",
    email: "ethan.nguyen@example.com",
    fullName: "Ethan Nguyen",
    gender: "male",
    age: 39,
    role: "caretaker",
    bio: "Psychiatric nurse with dementia care expertise. Specializes in managing challenging behaviors and sundowning symptoms with non-pharmaceutical approaches.",
    pricePerDay: 200,
    yearsExperience: 12,
    location: "San Diego, CA",
    serviceAreas: ["San Diego", "La Jolla", "Chula Vista"],
    specializations: ["Behavioral intervention", "Anxiety management", "Sleep improvement"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/85.jpg"
  },
  {
    username: "ava_martinez",
    password: "password123",
    email: "ava.martinez@example.com",
    fullName: "Ava Martinez",
    gender: "female",
    age: 33,
    role: "caretaker",
    bio: "Bilingual speech therapist with dementia care training. Helps patients maintain communication abilities and swallowing function as long as possible.",
    pricePerDay: 175,
    yearsExperience: 7,
    location: "Phoenix, AZ",
    serviceAreas: ["Phoenix", "Scottsdale", "Tempe"],
    specializations: ["Speech therapy", "Swallowing assistance", "Communication aids"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/74.jpg"
  },
  {
    username: "noah_williams",
    password: "password123",
    email: "noah.williams@example.com",
    fullName: "Noah Williams",
    gender: "male",
    age: 48,
    role: "caretaker",
    bio: "Former senior living director with extensive dementia care experience. Expert in creating safe environments and establishing predictable routines.",
    pricePerDay: 215,
    yearsExperience: 18,
    location: "Atlanta, GA",
    serviceAreas: ["Atlanta", "Decatur", "Marietta"],
    specializations: ["Environmental safety", "Routine development", "Wandering prevention"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/92.jpg"
  },
  {
    username: "zoe_clarke",
    password: "password123",
    email: "zoe.clarke@example.com",
    fullName: "Zoe Clarke",
    gender: "female",
    age: 31,
    role: "caretaker",
    bio: "Recreation therapist with dementia care certification. Specializes in meaningful activities that maintain skills and provide purpose to those with cognitive decline.",
    pricePerDay: 155,
    yearsExperience: 6,
    location: "New Orleans, LA",
    serviceAreas: ["New Orleans", "Metairie", "Kenner"],
    specializations: ["Activity planning", "Cognitive stimulation", "Social engagement"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/89.jpg"
  },
  {
    username: "lucas_kim",
    password: "password123",
    email: "lucas.kim@example.com",
    fullName: "Lucas Kim",
    gender: "male",
    age: 35,
    role: "caretaker",
    bio: "Occupational therapist with dementia care specialization. Helps patients maintain independence in daily activities through adaptive techniques and equipment.",
    pricePerDay: 180,
    yearsExperience: 9,
    location: "Salt Lake City, UT",
    serviceAreas: ["Salt Lake City", "West Valley City", "Provo"],
    specializations: ["ADL assistance", "Home modification", "Adaptive equipment"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/34.jpg"
  },
  {
    username: "mia_johnson",
    password: "password123",
    email: "mia.johnson@example.com",
    fullName: "Mia Johnson",
    gender: "female",
    age: 29,
    role: "caretaker",
    bio: "Psychology graduate with specialized training in dementia care. Focuses on emotional well-being and depression prevention in dementia patients.",
    pricePerDay: 150,
    yearsExperience: 4,
    location: "Charlotte, NC",
    serviceAreas: ["Charlotte", "Concord", "Gastonia"],
    specializations: ["Emotional support", "Depression prevention", "Social interaction"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    username: "henry_davis",
    password: "password123",
    email: "henry.davis@example.com",
    fullName: "Henry Davis",
    gender: "male",
    age: 52,
    role: "caretaker",
    bio: "Retired nurse with 25 years of geriatric experience. Specializes in complex cases combining dementia with other chronic health conditions.",
    pricePerDay: 230,
    yearsExperience: 25,
    location: "Detroit, MI",
    serviceAreas: ["Detroit", "Dearborn", "Ann Arbor"],
    specializations: ["Complex care coordination", "Multi-condition management", "Hospital-to-home transition"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/18.jpg"
  },
  {
    username: "lily_wilson",
    password: "password123",
    email: "lily.wilson@example.com",
    fullName: "Lily Wilson",
    gender: "female",
    age: 38,
    role: "caretaker",
    bio: "Hospice nurse with specialized dementia training. Provides compassionate end-of-life care for dementia patients with a focus on comfort and dignity.",
    pricePerDay: 200,
    yearsExperience: 11,
    location: "Las Vegas, NV",
    serviceAreas: ["Las Vegas", "Henderson", "North Las Vegas"],
    specializations: ["End-of-life care", "Pain management", "Family support"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/women/9.jpg"
  },
  {
    username: "alexander_robinson",
    password: "password123",
    email: "alexander.robinson@example.com",
    fullName: "Alexander Robinson",
    gender: "male",
    age: 40,
    role: "caretaker",
    bio: "Former chef with dementia care certification. Specializes in nutrition and meal preparation that addresses the unique dietary needs and challenges of dementia patients.",
    pricePerDay: 170,
    yearsExperience: 7,
    location: "Pittsburgh, PA",
    serviceAreas: ["Pittsburgh", "Monroeville", "Mt. Lebanon"],
    specializations: ["Meal preparation", "Nutrition planning", "Sensory stimulation through food"],
    isCertified: true,
    isBackgroundChecked: true,
    isAvailable: true,
    imageUrl: "https://randomuser.me/api/portraits/men/21.jpg"
  }
];

// Function to seed caretakers
async function seedCaretakers() {
  console.log('Starting caretaker seeding...');

  for (const caretakerData of caretakerSeedData) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, caretakerData.username));
      
      if (existingUser.length > 0) {
        console.log(`User ${caretakerData.username} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await hashPassword(caretakerData.password);

      // Insert user
      const [user] = await db.insert(users).values({
        username: caretakerData.username,
        password: hashedPassword,
        email: caretakerData.email,
        fullName: caretakerData.fullName,
        role: caretakerData.role,
      }).returning();

      // Insert caretaker profile
      await db.insert(caretakerProfiles).values({
        userId: user.id,
        bio: caretakerData.bio,
        pricePerDay: caretakerData.pricePerDay,
        yearsExperience: caretakerData.yearsExperience,
        location: caretakerData.location,
        serviceAreas: caretakerData.serviceAreas,
        specializations: caretakerData.specializations,
        isCertified: caretakerData.isCertified,
        isBackgroundChecked: caretakerData.isBackgroundChecked,
        isAvailable: caretakerData.isAvailable,
        gender: caretakerData.gender,
        age: caretakerData.age,
        imageUrl: caretakerData.imageUrl,
        rating: 4 + Math.random(), // Generate a random rating between 4-5
        reviewCount: Math.floor(Math.random() * 30) + 5, // Generate between 5-35 reviews
      });

      console.log(`Created caretaker: ${caretakerData.fullName}`);
    } catch (error) {
      console.error(`Error creating caretaker ${caretakerData.fullName}:`, error);
    }
  }

  console.log('Caretaker seeding completed!');
}

// Run the seed function when this script is executed directly
if (require.main === module) {
  seedCaretakers()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedCaretakers };