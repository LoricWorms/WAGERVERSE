import { useState } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Team } from "@/integrations/superbase/types";

interface EditTeamFormProps {
  team: Team;
  onSave: () => void;
  onCancel: () => void;
}

export function EditTeamForm({ team, onSave, onCancel }: EditTeamFormProps) {
  const [editingTeam, setEditingTeam] = useState<Team>(team);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("teams")
      .update(editingTeam)
      .eq("id", editingTeam.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour de l'équipe");
      console.error(error);
    } else {
      toast.success("Équipe mise à jour avec succès !");
      onSave();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${editingTeam.tag}_${Date.now()}.${fileExt}`;
    const filePath = `team-logos/${fileName}`;

    const { error } = await supabase.storage
      .from("team-logos")
      .upload(filePath, file);

    if (error) {
      toast.error("Erreur lors de l'upload du logo");
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        setEditingTeam({ ...editingTeam, logo_url: publicUrlData.publicUrl });
        toast.success("Logo uploadé avec succès");
      }
    }
  };

  return (
    <Card className="mt-4 border-border">
      <CardHeader>
        <CardTitle>Modifier l'équipe: {editingTeam.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Nom"
              value={editingTeam.name}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, name: e.target.value })
              }
              required
            />
            <Input
              placeholder="Tag"
              value={editingTeam.tag}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, tag: e.target.value })
              }
              required
            />
            <Input
              type="number"
              placeholder="Année de fondation"
              value={editingTeam.founded_year}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, founded_year: parseInt(e.target.value) })
              }
              required
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
