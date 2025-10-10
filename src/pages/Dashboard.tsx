import { useQuery } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';
import { subscriptionService } from '@/services/subscriptionService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { data: vacancies = [] } = useQuery({
    queryKey: ['vacancies'],
    queryFn: () => vacancyService.getVacancies(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions(),
  });

  const stats = [
    {
      title: 'Total Vacancies',
      value: vacancies.length,
      icon: Briefcase,
      trend: '+12%',
    },
    {
      title: 'Total Subscriptions',
      value: subscriptions.length,
      icon: Users,
      trend: '+23%',
    },
    {
      title: 'Active Positions',
      value: vacancies.length,
      icon: TrendingUp,
      trend: '+8%',
    },
    {
      title: 'This Month',
      value: subscriptions.filter(s => {
        const date = new Date(s.created_at || '');
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: Calendar,
      trend: '+18%',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your recruitment system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-success">
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vacancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vacancies.slice(0, 5).map((vacancy) => (
                  <div key={vacancy.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{vacancy.title}</p>
                      <p className="text-sm text-muted-foreground">{vacancy.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {vacancy.experience}
                    </span>
                  </div>
                ))}
                {vacancies.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No vacancies yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{sub.fullName}</p>
                      <p className="text-sm text-muted-foreground">{sub.yonalish}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {sub.age} years
                    </span>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No applications yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
