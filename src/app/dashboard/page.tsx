import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-6">
      <Card className="text-center">
          <CardHeader>
              <CardTitle>Página de Dashboard</CardTitle>
              <CardDescription>Esta página foi desativada no modo de protótipo.</CardDescription>
          </CardHeader>
      </Card>
    </div>
  );
}
