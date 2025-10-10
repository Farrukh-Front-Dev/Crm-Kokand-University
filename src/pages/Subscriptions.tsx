import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, Subscription } from '@/services/subscriptionService';
import { vacancyService } from '@/services/vacancyService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, Filter, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const subscriptionSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  age: z.number().min(18, 'Age must be at least 18').max(100),
  gender: z.string().min(1, 'Gender is required'),
  resume_file: z.string().min(1, 'Resume file is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  yonalish: z.string().min(1, 'Direction is required'),
  vacansy_id: z.number().min(1, 'Vacancy is required'),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function Subscriptions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterVacancy, setFilterVacancy] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions(),
  });

  const { data: vacancies = [] } = useQuery({
    queryKey: ['vacancies'],
    queryFn: () => vacancyService.getVacancies(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: SubscriptionFormData) => subscriptionService.createSubscription(data as Omit<Subscription, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Success', description: 'Application submitted successfully' });
      setIsDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit application', variant: 'destructive' });
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    createMutation.mutate(data);
  };

  const filteredSubscriptions = filterVacancy === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.vacansy_id === parseInt(filterVacancy));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">Manage candidate applications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" {...register('age', { valueAsNumber: true })} />
                    {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="yonalish">Direction/Specialty</Label>
                  <Input id="yonalish" {...register('yonalish')} />
                  {errors.yonalish && <p className="text-sm text-destructive">{errors.yonalish.message}</p>}
                </div>
                <div>
                  <Label htmlFor="vacansy_id">Vacancy</Label>
                  <Select onValueChange={(value) => setValue('vacansy_id', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vacancy" />
                    </SelectTrigger>
                    <SelectContent>
                      {vacancies.map((v) => (
                        <SelectItem key={v.id} value={v.id!.toString()}>
                          {v.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vacansy_id && <p className="text-sm text-destructive">{errors.vacansy_id.message}</p>}
                </div>
                <div>
                  <Label htmlFor="resume_file">Resume File URL</Label>
                  <Input id="resume_file" {...register('resume_file')} placeholder="https://..." />
                  {errors.resume_file && <p className="text-sm text-destructive">{errors.resume_file.message}</p>}
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterVacancy} onValueChange={setFilterVacancy}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by vacancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vacancies</SelectItem>
                {vacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id!.toString()}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredSubscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Vacancy</TableHead>
                    <TableHead>Resume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => {
                    const vacancy = vacancies.find(v => v.id === sub.vacansy_id);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.fullName}</TableCell>
                        <TableCell>{sub.age}</TableCell>
                        <TableCell className="capitalize">{sub.gender}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {sub.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {sub.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{sub.yonalish}</TableCell>
                        <TableCell>{vacancy?.title || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(sub.resume_file, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {filteredSubscriptions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
