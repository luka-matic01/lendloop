/** Shared native `<dialog>` shell — focusable but no visible ring on the backdrop element. */
export const MODAL_DIALOG_CLASS =
  "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-ink/40 open:flex open:items-center open:justify-center open:p-page-x outline-none focus:outline-none focus-visible:outline-none";

type SyncModalDialogOptions = {
  /** Where focus should land after open. Defaults to the dialog element (avoids a focus ring on the first button). */
  initialFocus?: HTMLElement | null;
};

/**
 * Keeps React `open` in sync with `HTMLDialogElement`. After `showModal()`, moves focus
 * off the first tab stop so opening via click does not leave a button looking “selected”.
 */
export function syncModalDialogOpen(
  dialog: HTMLDialogElement | null,
  open: boolean,
  options: SyncModalDialogOptions = {},
) {
  if (!dialog) {
    return;
  }
  if (open && !dialog.open) {
    dialog.showModal();
    const target = options.initialFocus ?? dialog;
    target.focus({ preventScroll: true });
  } else if (!open && dialog.open) {
    dialog.close();
  }
}
