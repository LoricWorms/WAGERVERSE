import { useState } from "react";
// import { supabase } from "@/integrations/superbase/client"; // Removed direct supabase import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Replaced by FormLabel
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FOUNDATION_YEAR_MIN,
  TEAM_NAME_MIN_LENGTH,
  TEAM_TAG_MAX_LENGTH,
  TEAM_TAG_MIN_LENGTH,
} from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createTeam } from "@/services/teamService"; // Import the service function
import { supabase } from "@/integrations/superbase/client"; // Keep for storage for now, will move later

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

const createTeamSchema = z.object({
  name: z.string().min(TEAM_NAME_MIN_LENGTH, `Le nom de l'équipe doit contenir au moins ${TEAM_NAME_MIN_LENGTH} caractères.`),
  tag: z.string().min(TEAM_TAG_MIN_LENGTH, `Le tag doit contenir au moins ${TEAM_TAG_MIN_LENGTH} caractères.`).max(TEAM_TAG_MAX_LENGTH, `Le tag ne doit pas dépasser ${TEAM_TAG_MAX_LENGTH} caractères.`),
  founded_year: z.number().int().min(FOUNDATION_YEAR_MIN, `L'année de fondation doit être après ${FOUNDATION_YEAR_MIN}.`).max(new Date().getFullYear(), "L'année de fondation ne peut pas être dans le futur."),
  logo_url: z.string().url("Veuillez uploader un logo valide.").min(1, "Veuillez uploader un logo pour l'équipe."),
});

export function CreateTeamForm({ onTeamCreated }: CreateTeamFormProps) {
  const [uploading, setUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      tag: "",
      founded_year: new Date().getFullYear(),
      logo_url: "",
    },
  });

  const handleCreateTeam = async (values: z.infer<typeof createTeamSchema>) => {
    setIsCreating(true);
    try {
      await createTeam(values); // Use the service function
      toast.success("Équipe créée avec succès !");
      form.reset();
      onTeamCreated();
    } catch (error) {
      toast.error("Erreur lors de la création de l'équipe");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentTag = form.getValues("tag");
    if (!currentTag || currentTag.length < 2) {
        toast.error("Veuillez renseigner un tag valide pour l'équipe avant d'uploader un logo");
        e.target.value = ""; // Clear the file input
        return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${currentTag}_${Date.now()}.${fileExt}`;
    const filePath = `team-logos/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        form.setValue("logo_url", publicUrlData.publicUrl);
        form.trigger("logo_url"); // Manually trigger validation for logo_url
        toast.success("Logo uploadé avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de l'upload du logo");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = ""; // Clear the input after upload
    }
  };

  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Plus className="mr-2 h-5 w-5 text-primary" />
          Créer une nouvelle équipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateTeam)} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'équipe</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom de l'équipe"
                        className="bg-background border-border"
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TAG"
                        className="bg-background border-border"
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founded_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année de fondation</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Année"
                        className="bg-background border-border"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Logo de l'équipe</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading || isCreating}
                    className="bg-background border-border"
                  />
                </FormControl>
                {uploading && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</p>}
                {form.formState.errors.logo_url && (
                    <FormMessage>{form.formState.errors.logo_url.message}</FormMessage>
                )}
              </FormItem>
            </div>
            <Button type="submit" disabled={uploading || isCreating || !form.formState.isValid} className="w-full">
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
              ) : (
                "Créer l'équipe"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
