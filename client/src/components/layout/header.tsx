import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Users, 
  Pill, 
  CheckSquare, 
  ChevronDown, 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  Heart 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const isPatient = user.role === "patient";
  
  // Navigate based on role
  const dashboardPath = isPatient ? "/patient/dashboard" : "/caretaker/dashboard";
  
  const navigation = [
    { name: "Home", href: dashboardPath, icon: Home },
    ...(isPatient 
      ? [
          { name: "Find Caretakers", href: "/find-caretakers", icon: Users },
          { name: "Medications", href: "/medications", icon: Pill },
          { name: "Tasks", href: "/tasks", icon: CheckSquare },
        ] 
      : [
          { name: "My Patients", href: "/caretaker/patients", icon: Users },
          { name: "Patient Medications", href: "/caretaker/medications", icon: Pill },
          { name: "Patient Tasks", href: "/caretaker/tasks", icon: CheckSquare },
        ]
    ),
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={dashboardPath} className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary-600" />
          <span className="text-xl sm:text-2xl font-bold text-primary-600">MemHeav</span>
        </Link>
        
        {/* Mobile menu button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <Link href={dashboardPath} className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="h-6 w-6 text-primary-600" />
                  <span className="text-xl font-bold text-primary-600">MemHeav</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </nav>
              
              <div className="border-t mt-4 pt-4">
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-3 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`font-medium flex items-center ${
                location === item.href 
                  ? "text-primary-600" 
                  : "text-neutral-700 hover:text-primary-600"
              }`}
            >
              <item.icon className="mr-1 h-4 w-4" />
              {item.name}
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 rounded-full px-3 py-2 bg-neutral-100 border-none"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.fullName.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

export default Header;
