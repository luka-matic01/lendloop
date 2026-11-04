"use client";

import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  name?: string;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
};

export function Select<T extends string>({
  value: valueProp,
  defaultValue,
  options,
  onChange,
  name,
  id: idProp,
  className,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps<T>) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(
    () => valueProp ?? defaultValue ?? options[0].value,
  );
  const value = isControlled ? valueProp : uncontrolledValue;

  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );

  const selected = options.find((option) => option.value === value);

  const close = useCallback(() => setOpen(false), []);

  const indexForValue = useCallback(
    (selectedValue: T) =>
      Math.max(
        0,
        options.findIndex((option) => option.value === selectedValue),
      ),
    [options],
  );

  const openListbox = useCallback(() => {
    setHighlightIndex(indexForValue(value));
    setOpen(true);
  }, [indexForValue, value]);

  const toggleListbox = useCallback(() => {
    if (open) {
      close();
      return;
    }
    openListbox();
  }, [close, open, openListbox]);

  const commit = useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const selectIndex = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) {
        return;
      }
      commit(option.value);
      setHighlightIndex(index);
      close();
    },
    [close, commit, options],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close, open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openListbox();
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setHighlightIndex(
        (current) => (current + delta + options.length) % options.length,
      );
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleListbox();
      return;
    }
    if (event.key === "Escape") {
      close();
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex(
        (current) => (current + 1) % options.length,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex(
        (current) => (current - 1 + options.length) % options.length,
      );
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectIndex(highlightIndex);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        onClick={toggleListbox}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-control border-2 border-line bg-canvas px-3 py-2 text-left text-base text-ink transition-colors",
          "hover:border-ink focus-visible:outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
          open && "border-ink",
        )}
      >
        <span className="truncate">{selected?.label ?? "Choose…"}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabelledBy}
          aria-activedescendant={`${id}-option-${highlightIndex}`}
          onKeyDown={onListKeyDown}
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-control border-2 border-ink bg-surface py-1"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightIndex;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "cursor-pointer px-3 py-2 text-base text-ink",
                  isHighlighted && "bg-canvas",
                  isSelected && "font-semibold",
                )}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectIndex(index)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
