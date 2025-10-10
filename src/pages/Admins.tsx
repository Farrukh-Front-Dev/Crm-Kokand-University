import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, Admin } from '@/services/adminService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const adminSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().optional(),
}).refine((data) => {
  // Password is required when creating, optional when editing
  return true;
}, {
  message: "Password is required",
  path: ["password"],
});

type AdminFormData = z.infer<typeof adminSchema>;

export default function Admins() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: () => adminService.getAdmins(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: Admin) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: 'Success', description: 'Admin created successfully' });
      setIsDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create admin', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ email, data }: { email: string; data: Partial<Admin> }) =>
      adminService.updateAdmin(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: 'Success', description: 'Admin updated successfully' });
      setIsDialogOpen(false);
      setEditingAdmin(null);
      reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update admin', variant: 'destructive' });
    },
  });

  const onSubmit = (data: AdminFormData) => {
    if (editingAdmin) {
      const updateData: Partial<Admin> = { name: data.name };
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }
      updateMutation.mutate({ email: editingAdmin.email, data: updateData });
    } else {
      if (!data.password || data.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
        return;
      }
      createMutation.mutate(data as Admin);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    reset({ email: admin.email, name: admin.name, password: '' });
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-muted-foreground">Manage system administrators</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingAdmin(null);
                reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!!editingAdmin}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password">
                    {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password', { required: !editingAdmin })}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAdmin ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administrators ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.email}>
                      <TableCell className="font-medium">{admin.email}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {admins.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                No administrators found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
