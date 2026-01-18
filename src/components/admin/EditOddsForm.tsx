import { useState, useEffect } from "react";
import { supabase } from "@/integrations/superbase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Match } from "@/integrations/superbase/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { ODDS_MIN_VALUE } from "@/lib/constants";


// Define a Zod schema for the odds fields dynamically
const createOddsSchema = (match: Match) => {
  const schema: { [key: string]: z.ZodTypeAny } = {};
  if (match.team1) {
    schema[`odds_team1`] = z.number().min(ODDS_MIN_VALUE, `La cote doit être supérieure à ${ODDS_MIN_VALUE.toFixed(2)}.`);
  }
  if (match.team2) {
    schema[`odds_team2`] = z.number().min(ODDS_MIN_VALUE, `La cote doit être supérieure à ${ODDS_MIN_VALUE.toFixed(2)}.`);
  }
  return z.object(schema);
};

interface EditOddsFormProps {
  match: Match;
  onSave: () => void;
  onCancel: () => void;
}

export function EditOddsForm({ match, onSave, onCancel }: EditOddsFormProps) {
  const [initialOdds, setInitialOdds] = useState<{ [key: string]: number }>({});
  const [isLoadingOdds, setIsLoadingOdds] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof createOddsSchema>>>(
    {
    resolver: async (data, context, options) => {
      // Create the schema dynamically based on the match prop
      const schema = createOddsSchema(match);
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: {}, // Will be populated in useEffect
  });

  useEffect(() => {
    const fetchOdds = async () => {
      setIsLoadingOdds(true);
      const { data, error } = await supabase
        .from("match_odds")
        .select("team_id, odds")
        .eq("match_id", match.id);

      if (error) {
        toast.error("Erreur lors de la récupération des cotes");
        console.error(error);
      } else {
        const currentOdds: { [key: string]: number } = {};
        data?.forEach(odd => {
          if (match.team1 && odd.team_id === match.team1.id) {
            currentOdds['odds_team1'] = odd.odds;
          } else if (match.team2 && odd.team_id === match.team2.id) {
            currentOdds['odds_team2'] = odd.odds;
          }
        });
        setInitialOdds(currentOdds);
        form.reset(currentOdds);
      }
      setIsLoadingOdds(false);
    };

    if (match.id) {
      fetchOdds();
    }
  }, [match.id, form, match.team1, match.team2]);

  const handleSave = async (values: z.infer<ReturnType<typeof createOddsSchema>>) => {
    setIsSaving(true);
    try {
      const updates = [];
      if (match.team1 && values.odds_team1 !== undefined) {
        updates.push(
          supabase
            .from("match_odds")
            .update({ odds: values.odds_team1 })
            .eq("match_id", match.id)
            .eq("team_id", match.team1.id)
        );
      }
      if (match.team2 && values.odds_team2 !== undefined) {
        updates.push(
          supabase
            .from("match_odds")
            .update({ odds: values.odds_team2 })
            .eq("match_id", match.id)
            .eq("team_id", match.team2.id)
        );
      }

      const results = await Promise.all(updates);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        throw new Error("Une ou plusieurs cotes n'ont pas pu être mises à jour.");
      }

      toast.success("Cotes mises à jour avec succès !");
      onSave();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la mise à jour des cotes: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingOdds) {
    return (
      <Card className="mt-4 border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">Chargement des cotes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">
          Modifier les cotes pour {match.team1?.name} vs {match.team2?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {match.team1 && (
                <FormField
                  control={form.control}
                  name="odds_team1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cote {match.team1!.name}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-background border-border"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {match.team2 && (
                <FormField
                  control={form.control}
                  name="odds_team2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cote {match.team2!.name}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-background border-border"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="flex space-x-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                ) : (
                  "Enregistrer les cotes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
