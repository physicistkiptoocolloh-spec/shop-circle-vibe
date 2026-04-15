import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Crop } from "lucide-react";
import { COUNTRIES, AVATAR_ICONS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Demo User");
  const [description, setDescription] = useState("Trusted buyer and seller on SokoMtaani.");
  const [phone, setPhone] = useState("+254700000000");
  const [selectedIcon, setSelectedIcon] = useState("User");
  const [showIconPicker, setShowIconPicker] = useState(false);

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Edit Profile</h1>
      </div>

      <div className="flex flex-col items-center px-4 mt-4">
        <div className="relative">
          <UserAvatar icon={selectedIcon} size="xl" />
          <button onClick={() => setShowIconPicker(!showIconPicker)} className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Camera className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>

        {showIconPicker && (
          <div className="mt-3 flex gap-2 flex-wrap justify-center animate-fade-in">
            {AVATAR_ICONS.map(icon => (
              <button key={icon} onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }} className={`p-2 rounded-xl border-2 ${selectedIcon === icon ? "border-primary bg-accent" : "border-border"}`}>
                <UserAvatar icon={icon} size="sm" />
              </button>
            ))}
            <button className="p-2 rounded-xl border-2 border-dashed border-border flex items-center gap-1">
              <Crop className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Upload & Crop</span>
            </button>
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

        <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Save Changes</button>
      </div>
    </div>
  );
}
