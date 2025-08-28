import { Link, useLocation } from "wouter";
import { LocalModeToggle } from "../LocalModeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { ChevronDown, Menu, Users, FileText, Coffee, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/icon.png" 
                alt="SITAB Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <h1 className="ml-3 text-xl font-bold text-gray-900">SITAB</h1>
              <span className="ml-2 text-sm text-gray-500">Gestion de Cantine</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Tableau de bord - lien direct */}
            <Link
              href="/"
              className={`px-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                location === "/"
                  ? "text-primary-600 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
              data-testid="nav-dashboard"
            >
              Tableau de bord
            </Link>

            {/* Menu déroulant pour les autres pages */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  data-testid="nav-menu-trigger"
                >
                  <Menu className="w-4 h-4" />
                  Menu
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/consumers">
                  <DropdownMenuItem 
                    className={`cursor-pointer ${
                      location === "/consumers" ? "bg-accent" : ""
                    }`}
                    data-testid="nav-consumers"
                  >
                    <Users className="w-4 h-4" />
                    Consommateurs
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <Link href="/fiches">
                  <DropdownMenuItem 
                    className={`cursor-pointer ${
                      location === "/fiches" ? "bg-accent" : ""
                    }`}
                    data-testid="nav-fiches"
                  >
                    <FileText className="w-4 h-4" />
                    Fiches journalières
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/consumptions">
                  <DropdownMenuItem 
                    className={`cursor-pointer ${
                      location === "/consumptions" ? "bg-accent" : ""
                    }`}
                    data-testid="nav-consumptions"
                  >
                    <Coffee className="w-4 h-4" />
                    Consommations
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <Link href="/reports">
                  <DropdownMenuItem 
                    className={`cursor-pointer ${
                      location === "/reports" ? "bg-accent" : ""
                    }`}
                    data-testid="nav-reports"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Rapports
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4">
            <LocalModeToggle />
            <span className="text-sm text-gray-600">SITAB - Accès Direct</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
