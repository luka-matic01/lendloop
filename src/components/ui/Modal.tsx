"use client";

import { X } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "@/lib/utils";

import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { ModalTitle, type ModalTitleSize } from "./ModalTitle";
import { Panel } from "./Panel";

const dialogClass =
  "fixed inset-0 z-50 m-0 box-border h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-ink/40 open:flex open:items-center open:justify-center open:p-page-x outline-none focus:outline-none focus-visible:outline-none";

const panelWidthClass = {
  confirm: "max-w-md",
  form: "max-w-lg",
} as const;

const ModalTitleIdContext = createContext<string | null>(null);

function useModalTitleId() {
  const id = useContext(ModalTitleIdContext);
  if (!id) {
    throw new Error("Modal title components must render inside <Modal>");
  }
  return id;
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** `confirm` = narrow confirm dialogs; `form` = wider forms. */
  size?: keyof typeof panelWidthClass;
  /** When false, backdrop click and Escape do not call onClose. */
  dismissible?: boolean;
  describedBy?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/** Native `<dialog>` shell — open state, backdrop, focus, and panel width in one place. */
export function Modal({
  open,
  onClose,
  children,
  size = "form",
  dismissible = true,
  describedBy,
  initialFocusRef,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      const target = initialFocusRef?.current ?? dialog;
      target.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  function tryClose() {
    if (dismissible) {
      onClose();
    }
  }

  return (
    <ModalTitleIdContext.Provider value={titleId}>
      <dialog
        ref={dialogRef}
        tabIndex={-1}
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        className={dialogClass}
        onCancel={(event) => {
          event.preventDefault();
          tryClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            tryClose();
          }
        }}
      >
        <Panel className={cn("w-full min-w-0", panelWidthClass[size])}>
          {children}
        </Panel>
      </dialog>
    </ModalTitleIdContext.Provider>
  );
}

type ModalHeadingProps = {
  title: string;
  size?: ModalTitleSize;
  className?: string;
};

/** Title for confirm-style modals (no close icon). */
export function ModalHeading({
  title,
  size = "confirm",
  className,
}: ModalHeadingProps) {
  const titleId = useModalTitleId();
  return <ModalTitle id={titleId} title={title} size={size} className={className} />;
}

type ModalHeaderProps = {
  title: string;
  size?: ModalTitleSize;
  onClose: () => void;
  closeDisabled?: boolean;
  className?: string;
};

/** Title + close control for form modals. */
export function ModalHeader({
  title,
  size = "form",
  onClose,
  closeDisabled,
  className,
}: ModalHeaderProps) {
  const titleId = useModalTitleId();

  return (
    <div className={cn("flex min-w-0 items-start justify-between gap-3", className)}>
      <ModalTitle id={titleId} size={size} className="flex-1 pr-2" title={title} />
      <IconButton
        type="button"
        variant="ghost"
        className="shrink-0 text-ink-muted hover:text-ink"
        aria-label="Close"
        disabled={closeDisabled}
        onClick={onClose}
      >
        <X className="size-4 shrink-0" aria-hidden />
      </IconButton>
    </div>
  );
}

type ModalActionsProps = {
  className?: string;
  cancelLabel: string;
  onCancel: () => void;
  cancelDisabled?: boolean;
  primaryLabel: ReactNode;
  primaryType?: "button" | "submit";
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryTitle?: string;
};

export function ModalActions({
  className,
  cancelLabel,
  onCancel,
  cancelDisabled,
  primaryLabel,
  primaryType = "button",
  onPrimary,
  primaryDisabled,
  primaryTitle,
}: ModalActionsProps) {
  const actionClass =
    "min-w-0 px-3 text-sm whitespace-nowrap sm:px-4 sm:text-base";

  return (
    <div className={cn("grid min-w-0 grid-cols-2 gap-2", className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={cancelDisabled}
        className={actionClass}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type={primaryType}
        disabled={primaryDisabled}
        className={actionClass}
        title={primaryTitle}
        onClick={primaryType === "button" ? onPrimary : undefined}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
