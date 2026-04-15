import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Crop, Loader2 } from "lucide-react";
import { AVATAR_ICONS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useUploadAvatar } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [selectedIcon, setSelectedIcon] = useState(profile?.avatar_icon || "User");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        name,
        description,
        phone,
        avatar_icon: selectedIcon,
      });
      await refreshProfile();
      toast({ title: "Profile updated!" });
      navigate(-1);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAvatar.mutateAsync({ userId: user.id, file });
      await updateProfile.mutateAsync({ userId: user.id, avatar_url: url });
      await refreshProfile();
      toast({ title: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  if (!profile) return null;

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Edit Profile</h1>
      </div>

      <div className="flex flex-col items-center px-4 mt-4">
        <div className="relative">
          <UserAvatar icon={selectedIcon} avatar={profile.avatar_url} size="xl" />
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
            <Camera className="h-4 w-4 text-primary-foreground" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        <button onClick={() => setShowIconPicker(!showIconPicker)} className="text-xs text-primary mt-2">Change icon avatar</button>

        {showIconPicker && (
          <div className="mt-3 flex gap-2 flex-wrap justify-center animate-fade-in">
            {AVATAR_ICONS.map(icon => (
              <button key={icon} onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }} className={`p-2 rounded-xl border-2 ${selectedIcon === icon ? "border-primary bg-accent" : "border-border"}`}>
                <UserAvatar icon={icon} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </div>
  );
}
