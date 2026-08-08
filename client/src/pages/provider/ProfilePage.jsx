import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, Briefcase, MapPin, Settings,
  Camera, Loader2, Save, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import EmptyState from '../../components/common/EmptyState';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from '../../services/provider.service';
import { getCategories } from '../../services/category.service';
import { getInitials } from '../../utils/helpers';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS, DAY_OPTIONS, INDIAN_STATES } from '../../constants';

const personalSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

const professionalSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  experience: z.coerce.number().min(0, 'Experience must be 0 or more'),
  skills: z.string().optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  certifications: z.string().optional(),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
});

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ['provider', 'profile'],
    queryFn: getProfile,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const profile = profileData?.data || {};
  const categories = categoriesData?.data || [];
  const isApproved = profile.applicationStatus === 'approved';
  const completion = profile.profileCompletion ?? 0;

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      toast.success('Profile updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const photoMutation = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      toast.success('Photo updated');
    },
    onError: () => toast.error('Failed to upload photo'),
  });

  const personalForm = useForm({
    resolver: zodResolver(personalSchema),
    values: {
      firstName: profile.user?.firstName || '',
      lastName: profile.user?.lastName || '',
      phone: profile.user?.phone || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      bio: profile.bio || '',
    },
  });

  const professionalForm = useForm({
    resolver: zodResolver(professionalSchema),
    values: {
      categoryId: profile.categories?.[0]?._id || profile.categories?.[0] || '',
      experience: profile.experience?.years ?? 0,
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      hourlyRate: profile.pricing?.hourlyRate ?? 0,
      certifications: Array.isArray(profile.certificates)
        ? profile.certificates.map((cert) => cert?.name).filter(Boolean).join(', ')
        : '',
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    values: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      pincode: profile.address?.pincode || '',
    },
  });

  const [selectedDays, setSelectedDays] = useState(profile.workingHours?.days || []);
  const [startTime, setStartTime] = useState(profile.workingHours?.start || '09:00');
  const [endTime, setEndTime] = useState(profile.workingHours?.end || '18:00');
  const [selectedLanguages, setSelectedLanguages] = useState(
    Array.isArray(profile.languages)
      ? profile.languages.map((lang) =>
          typeof lang === "object" ? lang.value : lang
        )
      : []
  );

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    photoMutation.mutate(formData);
  };

  const onPersonalSubmit = (data) => {
    updateMutation.mutate({
      bio: data.bio,
      gender: data.gender || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      languages: selectedLanguages,
    });
  };

  const onProfessionalSubmit = (data) => {
    const certificates = data.certifications
      ? data.certifications
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      categories: data.categoryId ? [data.categoryId] : [],
      experience: { years: data.experience },
      skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      pricing: { hourlyRate: data.hourlyRate || 0 },
      certificates: certificates.map((name) => ({ name })),
    };
    updateMutation.mutate(payload);
  };

  const onWorkPreferencesSubmit = () => {
    updateMutation.mutate({
      workingHours: { days: selectedDays, start: startTime, end: endTime },
    });
  };

  const onAddressSubmit = (data) => {
    updateMutation.mutate({ address: data });
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };
  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load profile"
        description="Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profilePhoto?.url} />
              <AvatarFallback className="text-xl">
                {getInitials(profile.user?.firstName, profile.user?.lastName)}
              </AvatarFallback>
            </Avatar>
            {!isApproved && (
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">
              {profile.user?.firstName} {profile.user?.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.user?.email}</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profile</span>
                  <span className="font-medium">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
              </div>
              <Badge variant={isApproved ? 'default' : 'secondary'}>
                {isApproved ? 'Approved' : profile.applicationStatus || 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {isApproved && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your profile is approved. Editing is restricted to prevent changes without re-verification.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" /> Personal
          </TabsTrigger>
          <TabsTrigger value="professional" className="gap-2">
            <Briefcase className="h-4 w-4 hidden sm:block" /> Professional
          </TabsTrigger>
          <TabsTrigger value="work" className="gap-2">
            <Settings className="h-4 w-4 hidden sm:block" /> Work
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2">
            <MapPin className="h-4 w-4 hidden sm:block" /> Address
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" disabled={isApproved} {...personalForm.register('firstName')} />
                    {personalForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{personalForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" disabled={isApproved} {...personalForm.register('lastName')} />
                    {personalForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{personalForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" disabled={isApproved} {...personalForm.register('phone')} />
                    {personalForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{personalForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={personalForm.watch('gender')}
                      onValueChange={(v) => personalForm.setValue('gender', v)}
                      disabled={isApproved}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" disabled={isApproved} {...personalForm.register('dateOfBirth')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={4} placeholder="Tell us about yourself..." disabled={isApproved} {...personalForm.register('bio')} />
                  {personalForm.formState.errors.bio && (
                    <p className="text-sm text-destructive">{personalForm.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <Badge
                        key={lang.value}
                        variant={
                          selectedLanguages.includes(lang.value) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => !isApproved && toggleLanguage(lang.value)}
                      >
                        {lang.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!isApproved && (
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>Your service category and experience</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={professionalForm.handleSubmit(onProfessionalSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select
                    value={professionalForm.watch('categoryId')}
                    onValueChange={(v) => professionalForm.setValue('categoryId', v)}
                    disabled={isApproved}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {professionalForm.formState.errors.categoryId && (
                    <p className="text-sm text-destructive">{professionalForm.formState.errors.categoryId.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" disabled={isApproved} {...professionalForm.register('experience')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (INR)</Label>
                    <Input id="hourlyRate" type="number" disabled={isApproved} {...professionalForm.register('hourlyRate')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" placeholder="e.g. Plumbing, Pipe Fitting, Leak Repair" disabled={isApproved} {...professionalForm.register('skills')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input id="certifications" placeholder="e.g. ITI Certified, NSDC Certified" disabled={isApproved} {...professionalForm.register('certifications')} />
                </div>

                {!isApproved && (
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Preferences */}
        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>Work Preferences</CardTitle>
              <CardDescription>Set your availability and work schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => (
                    <Badge
                      key={day.value}
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => !isApproved && toggleDay(day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isApproved}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isApproved}
                  />
                </div>
              </div>

              {!isApproved && (
                <Button onClick={onWorkPreferencesSubmit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Preferences
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Your service area address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea id="street" rows={2} disabled={isApproved} {...addressForm.register('street')} />
                  {addressForm.formState.errors.street && (
                    <p className="text-sm text-destructive">{addressForm.formState.errors.street.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" disabled={isApproved} {...addressForm.register('city')} />
                    {addressForm.formState.errors.city && (
                      <p className="text-sm text-destructive">{addressForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={addressForm.watch('state')}
                      onValueChange={(v) => addressForm.setValue('state', v)}
                      disabled={isApproved}
                    >
                      <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addressForm.formState.errors.state && (
                      <p className="text-sm text-destructive">{addressForm.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" disabled={isApproved} {...addressForm.register('pincode')} />
                  {addressForm.formState.errors.pincode && (
                    <p className="text-sm text-destructive">{addressForm.formState.errors.pincode.message}</p>
                  )}
                </div>

                {!isApproved && (
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Address
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
