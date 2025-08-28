import { Link, useLocation } from "wouter";
import { LocalModeToggle } from "../LocalModeToggle";

export default function Navbar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Tableau de bord", href: "/", icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" },
    { name: "Consommateurs", href: "/consumers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
    { name: "Fiches journalières", href: "/fiches", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Consommations", href: "/consumptions", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Rapports", href: "/reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

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
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "text-primary-600 border-primary-600"
                      : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </Link>
              );
            })}
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
