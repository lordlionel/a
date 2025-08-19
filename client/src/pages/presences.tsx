import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, Save, CheckSquare } from "lucide-react";

export default function Presences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const currentDate = new Date().toISOString().split('T')[0];

  const { data: consumersWithPresence = [], isLoading } = useQuery({
    queryKey: ["/api/presences", currentDate],
    queryFn: () => api.presences.getByDate(currentDate),
  });

  const markPresenceMutation = useMutation({
    mutationFn: api.presences.mark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presences", currentDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics", currentDate] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la présence",
        variant: "destructive",
      });
    },
  });

  const handleTogglePresence = (consumerId: string, isPresent: boolean) => {
    markPresenceMutation.mutate({
      consumerId,
      date: currentDate,
      isPresent,
    });
  };

  const handleToggleAll = () => {
    const allPresent = filteredConsumers.every(c => c.isPresent);
    filteredConsumers.forEach(consumer => {
      if (consumer.isPresent !== !allPresent) {
        handleTogglePresence(consumer.id, !allPresent);
      }
    });
  };

  const handleSaveAll = () => {
    toast({
      title: "Succès",
      description: "Toutes les présences ont été sauvegardées",
    });
  };

  const filteredConsumers = consumersWithPresence.filter(consumer =>
    consumer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (consumer.department && consumer.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const presentCount = filteredConsumers.filter(c => c.isPresent).length;
  const totalCount = filteredConsumers.length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Gestion des Présences - {new Date().toLocaleDateString('fr-FR')}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600" data-testid="presence-count">
                {presentCount} / {totalCount} présents
              </span>
              <Button 
                onClick={handleSaveAll}
                className="bg-primary-500 hover:bg-primary-600"
                data-testid="button-save-all"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder tout
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter */}
          <div className="mb-6 flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher un consommateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button 
              variant="outline"
              onClick={handleToggleAll}
              data-testid="button-toggle-all"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tout marquer
            </Button>
          </div>

          {/* Presence Grid */}
          {filteredConsumers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun consommateur trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConsumers.map((consumer) => (
                <div 
                  key={consumer.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`presence-item-${consumer.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {getInitials(consumer.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{consumer.name}</p>
                      {consumer.department && (
                        <p className="text-xs text-gray-500">{consumer.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox
                      checked={consumer.isPresent || false}
                      onCheckedChange={(checked) => 
                        handleTogglePresence(consumer.id, checked as boolean)
                      }
                      className="h-5 w-5"
                      data-testid={`checkbox-presence-${consumer.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
