import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, DollarSign, Brain, User, Calendar, Map } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

// Define the filter schema
const filterSchema = z.object({
  location: z.string().optional(),
  priceRange: z.string().optional(),
  specialization: z.string().optional(),
  gender: z.string().optional(),
  ageRange: z.string().optional(),
  serviceArea: z.string().optional(),
  isCertified: z.boolean().optional(),
  isBackgroundChecked: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  providesLiveLocation: z.boolean().optional()
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      location: "",
      priceRange: "any",
      specialization: "any",
      gender: "any",
      ageRange: "any",
      serviceArea: "",
      isCertified: false,
      isBackgroundChecked: false,
      isAvailable: false,
      providesLiveLocation: false
    }
  });
  
  const onSubmit = (data: FilterFormValues) => {
    setSubmitting(true);
    
    // Parse price range to min and max values
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    
    if (data.priceRange && data.priceRange !== "any") {
      const [min, max] = data.priceRange.split("-");
      minPrice = min ? parseInt(min) : undefined;
      maxPrice = max && max !== "+" ? parseInt(max) : undefined;
    }
    
    // Parse age range to min and max values
    let minAge: number | undefined;
    let maxAge: number | undefined;
    
    if (data.ageRange && data.ageRange !== "any") {
      const [min, max] = data.ageRange.split("-");
      minAge = min ? parseInt(min) : undefined;
      maxAge = max && max !== "+" ? parseInt(max) : undefined;
    }
    
    // Create filter object
    const filters = {
      location: data.location || undefined,
      specialization: data.specialization !== "any" ? data.specialization : undefined,
      serviceArea: data.serviceArea || undefined,
      gender: data.gender !== "any" ? data.gender : undefined,
      minPrice,
      maxPrice,
      minAge,
      maxAge,
      isCertified: data.isCertified,
      isBackgroundChecked: data.isBackgroundChecked,
      isAvailable: data.isAvailable,
      providesLiveLocation: data.providesLiveLocation
    };
    
    onFilterChange(filters);
    setSubmitting(false);
  };
  
  // Submit when checkboxes change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('is')) {
        form.handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFilterChange]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="location" className="block text-neutral-700 font-medium mb-2">
                      Location
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Input 
                          id="location" 
                          placeholder="Enter your city or zip code"
                          className="pl-10 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="priceRange" className="block text-neutral-700 font-medium mb-2">
                      Price Range (per day)
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="priceRange" className="pl-10 h-12">
                            <SelectValue placeholder="Any price range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any price range</SelectItem>
                            <SelectItem value="50-100">$50 - $100</SelectItem>
                            <SelectItem value="100-150">$100 - $150</SelectItem>
                            <SelectItem value="150-200">$150 - $200</SelectItem>
                            <SelectItem value="200-+">$200+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="specialization" className="block text-neutral-700 font-medium mb-2">
                      Specialization
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Brain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="specialization" className="pl-10 h-12">
                            <SelectValue placeholder="Any specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any specialization</SelectItem>
                            <SelectItem value="Dementia Care">Dementia Care</SelectItem>
                            <SelectItem value="Alzheimer's Care">Alzheimer's Care</SelectItem>
                            <SelectItem value="Elderly Care">Elderly Care</SelectItem>
                            <SelectItem value="Medical Assistance">Medical Assistance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="gender" className="block text-neutral-700 font-medium mb-2">
                      Caretaker Gender Preference
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="gender" className="pl-10 h-12">
                            <SelectValue placeholder="Any gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any gender</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="ageRange" className="block text-neutral-700 font-medium mb-2">
                      Caretaker Age Range
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger id="ageRange" className="pl-10 h-12">
                            <SelectValue placeholder="Any age range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any age range</SelectItem>
                            <SelectItem value="20-30">20-30 years</SelectItem>
                            <SelectItem value="30-40">30-40 years</SelectItem>
                            <SelectItem value="40-50">40-50 years</SelectItem>
                            <SelectItem value="50-+">50+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serviceArea"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="serviceArea" className="block text-neutral-700 font-medium mb-2">
                      Service Area
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                        <Input 
                          id="serviceArea" 
                          placeholder="Enter specific neighborhood or area"
                          className="pl-10 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="isCertified"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="isCertified"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded data-[state=checked]:bg-primary-600"
                      />
                    </FormControl>
                    <Label htmlFor="isCertified" className="text-neutral-700">
                      Certified Caregivers Only
                    </Label>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isBackgroundChecked"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="isBackgroundChecked"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded data-[state=checked]:bg-primary-600"
                      />
                    </FormControl>
                    <Label htmlFor="isBackgroundChecked" className="text-neutral-700">
                      Background Checked
                    </Label>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="isAvailable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded data-[state=checked]:bg-primary-600"
                      />
                    </FormControl>
                    <Label htmlFor="isAvailable" className="text-neutral-700">
                      Available Now
                    </Label>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="providesLiveLocation"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="providesLiveLocation"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded data-[state=checked]:bg-primary-600"
                      />
                    </FormControl>
                    <Label htmlFor="providesLiveLocation" className="text-neutral-700">
                      24/7 Live Location Tracking
                    </Label>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={submitting}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Caretakers
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
