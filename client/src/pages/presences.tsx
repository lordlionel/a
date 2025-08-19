import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, FileText, DollarSign } from "lucide-react";
import type { Consumer, InsertConsumption } from "@shared/schema";

interface ConsumerSelection {
  consumer: Consumer;
  isSelected: boolean;
  amount: number;
}

export default function DailySheets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [consumerSelections, setConsumerSelections] = useState<ConsumerSelection[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: consumers = [], isLoading } = useQuery({
    queryKey: ["/api/consommateurs"],
    queryFn: () => api.consumers.getAll(),
  });

  // Initialize consumer selections when consumers data changes
  useState(() => {
    if (consumers.length > 0 && consumerSelections.length === 0) {
      setConsumerSelections(
        consumers.map(consumer => ({
          consumer,
          isSelected: false,
          amount: 0,
        }))
      );
    }
  });

  // Update consumer selections when consumers change
  if (consumers.length > 0 && consumerSelections.length !== consumers.length) {
    setConsumerSelections(
      consumers.map(consumer => {
        const existing = consumerSelections.find(cs => cs.consumer.id === consumer.id);
        return existing || {
          consumer,
          isSelected: false,
          amount: 0,
        };
      })
    );
  }

  const handleConsumerToggle = (consumerId: string, isSelected: boolean) => {
    setConsumerSelections(prev =>
      prev.map(cs =>
        cs.consumer.id === consumerId
          ? { ...cs, isSelected, amount: isSelected ? cs.amount || 700 : 0 }
          : cs
      )
    );
  };

  const handleAmountChange = (consumerId: string, amount: number) => {
    setConsumerSelections(prev =>
      prev.map(cs =>
        cs.consumer.id === consumerId
          ? { ...cs, amount }
          : cs
      )
    );
  };

  const handleValidateSheet = async () => {
    const selectedConsumers = consumerSelections.filter(cs => cs.isSelected && cs.amount > 0);
    
    if (selectedConsumers.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un consommateur avec un montant",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Create all consumptions for the selected date
      for (const selection of selectedConsumers) {
        const consumption: InsertConsumption = {
          consumerId: selection.consumer.id,
          amount: selection.amount,
          date: selectedDate,
        };
        
        await api.consumptions.create(consumption);
      }

      // Reset selections
      setConsumerSelections(prev =>
        prev.map(cs => ({
          ...cs,
          isSelected: false,
          amount: 0,
        }))
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/consommations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });

      toast({
        title: "Succès",
        description: `${selectedConsumers.length} consommations enregistrées pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation de la fiche journalière",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await api.reports.downloadDaily(selectedDate);
      toast({
        title: "Succès",
        description: `Rapport généré pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du rapport",
        variant: "destructive",
      });
    }
  };

  const selectedCount = consumerSelections.filter(cs => cs.isSelected).length;
  const totalAmount = consumerSelections
    .filter(cs => cs.isSelected)
    .reduce((sum, cs) => sum + cs.amount, 0);

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Fiches Journalières</h2>
        <p className="mt-2 text-gray-600">
          Saisie des consommations pour une date spécifique
        </p>
      </div>

      {/* Date and Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Sélection de la date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de la fiche
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="input-date"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Consommateurs sélectionnés</p>
              <p className="text-2xl font-bold text-primary-600" data-testid="selected-count">
                {selectedCount}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Total estimé</p>
              <p className="text-2xl font-bold text-success-600" data-testid="total-amount">
                {totalAmount} FCFA
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleValidateSheet}
                disabled={selectedCount === 0 || isSaving}
                className="flex-1 bg-success-500 hover:bg-success-600"
                data-testid="button-validate"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Validation..." : "Valider"}
              </Button>
              
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                className="flex-1"
                data-testid="button-generate-report"
              >
                <FileText className="w-4 h-4 mr-2" />
                Rapport
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumers List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Consommateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consumerSelections.map((selection) => (
              <div 
                key={selection.consumer.id}
                className={`p-4 rounded-lg border transition-all ${
                  selection.isSelected 
                    ? "bg-primary-50 border-primary-200" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                data-testid={`consumer-item-${selection.consumer.id}`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selection.isSelected}
                    onCheckedChange={(checked) => 
                      handleConsumerToggle(selection.consumer.id, checked as boolean)
                    }
                    className="mt-1"
                    data-testid={`checkbox-${selection.consumer.id}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary-600">
                          {getInitials(selection.consumer.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selection.consumer.name}
                        </p>
                        {selection.consumer.department && (
                          <p className="text-xs text-gray-500 truncate">
                            {selection.consumer.department}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {selection.isSelected && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">Montant de consommation :</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAmountChange(selection.consumer.id, 700)}
                            variant={selection.amount === 700 ? "default" : "outline"}
                            className={`flex-1 ${
                              selection.amount === 700 
                                ? "bg-accent-500 hover:bg-accent-600" 
                                : "border-accent-200 text-accent-700 hover:bg-accent-50"
                            }`}
                            data-testid={`button-700-${selection.consumer.id}`}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            700F
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAmountChange(selection.consumer.id, 1000)}
                            variant={selection.amount === 1000 ? "default" : "outline"}
                            className={`flex-1 ${
                              selection.amount === 1000 
                                ? "bg-primary-500 hover:bg-primary-600" 
                                : "border-primary-200 text-primary-700 hover:bg-primary-50"
                            }`}
                            data-testid={`button-1000-${selection.consumer.id}`}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            1000F
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {consumerSelections.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des consommateurs...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}