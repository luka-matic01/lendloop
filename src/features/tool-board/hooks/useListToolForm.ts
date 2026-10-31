"use client";

import { useMutation } from "convex/react";
import { FormEvent, useCallback, useState } from "react";

import { api } from "convex/_generated/api";

import {
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";

type UseListToolFormOptions = {
  onListed: () => void;
};

export function useListToolForm({ onListed }: UseListToolFormOptions) {
  const createTool = useMutation(api.tools.create);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategoryKey>("power_tools");
  const [condition, setCondition] = useState<ToolConditionKey>("good");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setCategory("power_tools");
    setCondition("good");
    setDescription("");
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setFormError(null);
      setSubmitting(true);
      try {
        await createTool({ name, category, condition, description });
        reset();
        onListed();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Could not add tool",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [category, condition, createTool, description, name, onListed, reset],
  );

  return {
    name,
    setName,
    category,
    setCategory,
    condition,
    setCondition,
    description,
    setDescription,
    submitting,
    formError,
    reset,
    handleSubmit,
  };
}
