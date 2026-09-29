import { useState } from "react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NewsletterModalProps {
  open: boolean;
  onClose: () => void;
}

const NewsletterModal = ({ open, onClose }: NewsletterModalProps) => {
  const [email, setEmail] = useState("");
  const { status, error, subscribe } = useSubscribe();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await subscribe(email)) setEmail("");
  };

  const message =
    status === "success" ? "Subscribed! Thank you." : status === "exists" ? "You're already subscribed!" : "";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background p-10 max-w-sm w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-lg font-bold uppercase tracking-tight text-foreground mb-2">
          Newsletter
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Get an email whenever new components and landing pages are added.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full text-xs uppercase tracking-widest"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterModal;
