import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              CareConnect
            </h3>
            <p className="text-neutral-400 mb-4">
              Specialized care and support for dementia patients and their families.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary-500">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-500">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/find-caretakers" className="text-neutral-400 hover:text-white">
                  Find Caretakers
                </Link>
              </li>
              <li>
                <Link href="/medications" className="text-neutral-400 hover:text-white">
                  Medication Reminders
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="text-neutral-400 hover:text-white">
                  Task Management
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  Dementia Care Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  Caretaker Certification
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  Support Groups
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-neutral-400">
                <Mail className="mr-2 h-4 w-4" />
                support@careconnect.com
              </li>
              <li className="flex items-center text-neutral-400">
                <Phone className="mr-2 h-4 w-4" />
                (800) 123-4567
              </li>
              <li className="flex items-center text-neutral-400">
                <MapPin className="mr-2 h-4 w-4" />
                123 Care Street, Boston, MA 02108
              </li>
            </ul>
            <div className="mt-4">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} CareConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
