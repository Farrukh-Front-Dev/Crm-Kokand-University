"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService, Subscription } from "@/services/subscriptionService";
import { vacancyService } from "@/services/vacancyService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ✅ Validation schema
const subscriptionSchema = z.object({
  fullName: z.string().min(1, "Ism majburiy").max(100),
  age: z.string().min(1, "Yosh majburiy"),
  gender: z.string().min(1, "Jins majburiy"),
  resume_file: z.string().min(1, "Rezyume fayli majburiy"),
  phone: z.string().min(1, "Telefon majburiy"),
  email: z.string().email("Noto‘g‘ri email"),
  major: z.string().min(1, "Mutaxassislik majburiy"),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

// ✅ Helper for resume URL
const getResumeUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) {
    const url = new URL(path);
    const fileName = url.pathname.split("/").pop();
    return `https://univer-xrec.onrender.com/files/${fileName}`;
  }
  return `https://univer-xrec.onrender.com/files/${path.replace(/^files\//, "")}`;
};

export default function Subscriptions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: subscriptionService.getSubscriptions,
  });

  const { data: vacancies = [] } = useQuery({
    queryKey: ["vacancies"],
    queryFn: vacancyService.getVacancies,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      major: "",
      resume_file: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SubscriptionFormData) =>
      subscriptionService.createSubscription(data as Omit<Subscription, "id">),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({ title: "✅ Muvaffaqiyatli", description: "Ariza yuborildi" });
      setIsDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({
        title: "❌ Xato",
        description: "Ariza yuborishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionFormData) => createMutation.mutate(data);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arizalar</h1>
            <p className="text-muted-foreground">Nomzodlar arizalarini boshqarish</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Ariza qo‘shish</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yangi ariza</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField id="fullName" label="To‘liq ism" register={register} errors={errors} />
                  <FormField id="age" label="Yosh" register={register} errors={errors} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jins</Label>
                    <Select onValueChange={(v) => setValue("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Erkak</SelectItem>
                        <SelectItem value="female">Ayol</SelectItem>
                        <SelectItem value="other">Boshqa</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                  </div>
                  <FormField id="phone" label="Telefon" register={register} errors={errors} />
                </div>

                <FormField id="email" label="Email" register={register} errors={errors} />
                <FormField id="major" label="Mutaxassislik" register={register} errors={errors} placeholder="masalan, Frontend Dasturchi" />
                <FormField id="resume_file" label="Rezyume URL" register={register} errors={errors} placeholder="https://..." />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Arizalar ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Yuklanmoqda...</div>
            ) : subscriptions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ism</TableHead>
                    <TableHead>Yosh</TableHead>
                    <TableHead>Jins</TableHead>
                    <TableHead>Aloqa</TableHead>
                    <TableHead>Mutaxassislik</TableHead>
                    <TableHead>Rezyume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.fullName}</TableCell>
                      <TableCell>{sub.age}</TableCell>
                      <TableCell className="capitalize">{sub.gender}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" /> {sub.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" /> {sub.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{sub.major}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const url = getResumeUrl(sub.resume_file);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `${sub.fullName}_resume.pdf`;
                            link.target = "_blank";
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Hech qanday ariza topilmadi
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ✅ Reusable form field component
function FormField({ id, label, register, errors, placeholder }: any) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...register(id)} placeholder={placeholder} />
      {errors[id] && <p className="text-sm text-destructive">{errors[id]?.message}</p>}
    </div>
  );
}
