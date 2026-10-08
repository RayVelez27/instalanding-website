import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import ContactForm from "@/components/ContactForm";

/**
 * "Contact Ray" as a dialog, opened from the About page and the feed's WORK
 * WITH ME tile. The form itself is ContactForm, shared with /contact. Radix
 * unmounts the content on close, so each opening starts with a fresh form.
 */
const ContactModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="contact-overlay" />
      <Dialog.Content className="contact-dialog" aria-describedby={undefined}>
        <Dialog.Close className="contact-close" aria-label="Close">
          <X size={16} />
        </Dialog.Close>
        <Dialog.Title className="contact-title">Contact Ray</Dialog.Title>
        <p className="contact-hint">Projects, collaborations, or a component you want built.</p>
        <ContactForm onDone={onClose} doneLabel="CLOSE" />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default ContactModal;
