import { useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

export function CreateTeamForm({ onTeamCreated }: CreateTeamFormProps) {
  const [teamForm, setTeamForm] = useState({
    name: "",
    tag: "",
    founded_year: new Date().getFullYear(),
    logo_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.logo_url) {
      toast.error("Veuillez uploader un logo pour l'équipe");
      return;
    }

    const { error } = await supabase.from("teams").insert([teamForm]);

    if (error) {
      toast.error("Erreur lors de la création de l'équipe");
      console.error(error);
    } else {
      toast.success("Équipe créée avec succès !");
      setTeamForm({
        name: "",
        tag: "",
        founded_year: new Date().getFullYear(),
        logo_url: "",
      });
      onTeamCreated();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (teamForm.tag === "") {
        toast.error("Veuillez renseigner un tag pour l'équipe avant d'uploader un logo");
        e.target.value = "";
        return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${teamForm.tag}_${Date.now()}.${fileExt}`;
    const filePath = `team-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("team-logos")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload du logo");
      console.error(uploadError);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        setTeamForm({ ...teamForm, logo_url: publicUrlData.publicUrl });
        toast.success("Logo uploadé avec succès");
      }
    }
    setUploading(false);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Créer une nouvelle équipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'équipe</Label>
              <Input
                id="name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={teamForm.tag}
                onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value })}
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year">Année de fondation</Label>
              <Input
                id="founded_year"
                type="number"
                value={teamForm.founded_year}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, founded_year: parseInt(e.target.value) })
                }
                required
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de l'équipe</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="bg-muted border-border"
              />
            </div>
          </div>
          <Button type="submit" disabled={uploading} className="bg-primary hover:bg-primary/90">
            {uploading ? "Uploading..." : "Créer l'équipe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
