"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: no backend yet — wire this up to an API route / email service.
    toast.success("Thanks! We'll get back to you soon.");
    event.currentTarget.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-background p-6 sm:p-8"
    >
      <h2 className="text-xl">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We usually reply within one working day.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            placeholder="How can we help?"
            className="min-h-32"
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full">
        Send message
      </Button>
    </form>
  );
}
