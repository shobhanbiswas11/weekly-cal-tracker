import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

export function ClearChatButton() {
  const [open, setOpen] = useState(false);

  const handleClearChat = () => {
    // TODO: Implement actual chat clearing logic here
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            className="text-muted-foreground hover:text-foreground"
            size="icon-lg"
          />
        }
      >
        <Trash2Icon className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear conversation?</DialogTitle>
          <DialogDescription>
            This will only clear the conversation. Your changes are saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" onClick={handleClearChat}>
            Clear all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
