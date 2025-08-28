import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsSimple() {
  const currentDate = new Date().toISOString().split('T')[0];

  console.log("Reports component rendering...");

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">TEST - Rapports et Statistiques</h2>
        <p className="mt-2 text-gray-600">
          Version de test - {currentDate}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test de base</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Si vous voyez ce texte, React fonctionne.</p>
          <p>Date actuelle: {currentDate}</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test API</CardTitle>
        </CardHeader>
        <CardContent>
          <TestAPIData />
        </CardContent>
      </Card>
    </div>
  );
}

function TestAPIData() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/statistics"],
    queryFn: () => api.statistics.getDaily(),
    retry: false
  });

  console.log("Stats data:", stats);
  console.log("Stats loading:", statsLoading);
  console.log("Stats error:", statsError);

  if (statsLoading) return <p>Chargement...</p>;
  if (statsError) return <p className="text-red-600">Erreur: {String(statsError)}</p>;

  return (
    <div>
      <p>✅ API Statistics fonctionne</p>
      {stats && (
        <div className="mt-2">
          <p>Total consommateurs: {stats.totalConsumers}</p>
          <p>Recette: {stats.dailyRevenue} FCFA</p>
        </div>
      )}
    </div>
  );
}