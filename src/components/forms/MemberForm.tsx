"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import {
  memberFormSchema,
  MEMBER_ROLES,
  type MemberFormValues,
} from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CURRENT_YEAR = 2026;

const EMPTY: MemberFormValues = {
  username: "",
  displayName: "",
  email: "",
  photoURL: null,
  role: "member",
  team: null,
  cohortYear: CURRENT_YEAR,
  batchYear: CURRENT_YEAR + 2,
  branch: "",
  bio: "",
  skills: [],
  socials: {},
  isPublic: true,
};

export function MemberForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save member",
}: {
  defaultValues?: Partial<MemberFormValues>;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const [skillDraft, setSkillDraft] = React.useState("");
  const skills = form.watch("skills");

  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    if (!skills.includes(value)) {
      form.setValue("skills", [...skills, value], { shouldValidate: true });
    }
    setSkillDraft("");
  }

  function removeSkill(skill: string) {
    form.setValue(
      "skills",
      skills.filter((s) => s !== skill),
      { shouldValidate: true },
    );
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8"
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Aisha Rahman" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="aisha"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>Public at /m/username</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@vjit.ac.in" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {MEMBER_ROLES.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tech, Design, Content..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank for general member
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input placeholder="CSE" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cohortYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cohort year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="batchYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="One or two lines. Max 280 characters."
                  {...field}
                />
              </FormControl>
              <FormDescription>{field.value.length}/280</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                TODO(Jashwanth): swap for a Firebase Storage upload flow.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel htmlFor="skill-input">Skills</FormLabel>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              value={skillDraft}
              placeholder="React, AWS, Python..."
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="hover:text-danger rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </FormItem>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Socials</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["github", "linkedin", "twitter", "website"] as const).map(
              (key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`socials.${key}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{key}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ),
            )}
          </div>
        </fieldset>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-sm border p-4">
              <div className="space-y-0.5">
                <FormLabel>Public profile</FormLabel>
                <FormDescription>
                  When on, /m/username is visible to everyone.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className={cn("flex gap-3")}>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
