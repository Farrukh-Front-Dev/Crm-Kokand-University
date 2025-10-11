import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService, Vacancy } from '@/services/vacancyService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Briefcase, Edit, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const vacancySchema = z.object({
  title: z.string().min(1, 'Sarlavha majburiy').max(200),
  description: z.string().min(1, 'Tavsif majburiy'),
  location: z.string().min(1, 'Joylashuv majburiy'),
  image: z.string().min(1, 'Rasm URL majburiy'),
  experience: z.string().min(1, 'Tajriba majburiy'),
  requirement: z.string().min(1, 'Talablar majburiy'),
});


type VacancyFormData = z.infer<typeof vacancySchema>;

export default function Vacancies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vacancies = [], isLoading } = useQuery({
    queryKey: ['vacancies'],
    queryFn: () => vacancyService.getVacancies(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VacancyFormData>({
    resolver: zodResolver(vacancySchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: VacancyFormData) => vacancyService.createVacancy(data as Omit<Vacancy, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      toast({ title: 'Muvaffaqiyatli', description: 'Vakansiya muvaffaqiyatli yaratildi' });
      setIsDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({ title: 'Xato', description: 'Vakansiya yaratishda xatolik yuz berdi', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VacancyFormData> }) =>
      vacancyService.updateVacancy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      toast({ title: 'Muvaffaqiyatli', description: 'Vakansiya muvaffaqiyatli yangilandi' });
      setIsDialogOpen(false);
      setEditingVacancy(null);
      reset();
    },
    onError: () => {
      toast({ title: 'Xato', description: 'Vakansiya yangilashda xatolik yuz berdi', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vacancyService.deleteVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      toast({ title: 'Muvaffaqiyatli', description: 'Vakansiya muvaffaqiyatli o\'chirildi' });
    },
    onError: () => {
      toast({ title: 'Xato', description: 'Vakansiya o\'chirishda xatolik yuz berdi', variant: 'destructive' });
    },
  });

  const onSubmit = (data: VacancyFormData) => {
    if (editingVacancy?.id) {
      updateMutation.mutate({ id: editingVacancy.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    reset(vacancy);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Ushbu vakansiyani o\'chirishga ishonchingiz komilmi?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredVacancies = vacancies.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vakansiyalar</h1>
            <p className="text-muted-foreground">Ish o'rinlarini boshqarish</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingVacancy(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Vakansiya qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVacancy ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya yaratish'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Sarlavha</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Joylashuv</Label>
                  <Input id="location" {...register('location')} />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
                <div>
                  <Label htmlFor="experience">Tajriba</Label>
                  <Input id="experience" {...register('experience')} placeholder="masalan, 2-3 yil" />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                </div>
                <div>
                  <Label htmlFor="image">Rasm URL (ixtiyoriy)</Label>
                  <Input id="image" {...register('image')} placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea id="description" {...register('description')} rows={4} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
                <div>
                  <Label htmlFor="requirement">Talablar</Label>
                  <Textarea id="requirement" {...register('requirement')} rows={4} />
                  {errors.requirement && <p className="text-sm text-destructive">{errors.requirement.message}</p>}
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingVacancy ? 'Yangilash' : 'Yaratish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Vakansiyalarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVacancies.map((vacancy) => (
              <Card key={vacancy.id} className="hover:shadow-lg transition-shadow">
                {vacancy.image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    {/* <img
                      src={vacancy.image}
                      alt={vacancy.title}
                      className="h-full w-full object-cover"
                    /> */}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-1">{vacancy.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {vacancy.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {vacancy.experience}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                    {vacancy.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(vacancy)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => vacancy.id && handleDelete(vacancy.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVacancies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Vakansiyalar topilmadi</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
