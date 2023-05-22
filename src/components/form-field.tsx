import { Ref, forwardRef } from "react";
import { TextField } from "@mui/material";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegisterReturn,
} from "react-hook-form";

type Props<T extends FieldValues> = UseFormRegisterReturn<Path<T>> & {
  errors: FieldErrors<T>;
  label: string;
  helperText: string;
  type: "url" | "text" | "datetime-local";
  required?: boolean;
};
function FormField<FormData extends FieldValues>(
  props: Props<FormData>,
  ref: Ref<HTMLInputElement>
) {
  const { errors, label, helperText, type, required, name, ...registered } =
    props;
  return (
    <TextField
      className="event-fields"
      data-cy={`input-${name}`}
      type={type}
      label={label}
      error={!!errors[name]}
      helperText={errors[name] && helperText}
      required={required ?? true}
      name={name}
      {...registered}
      ref={ref}
    />
  );
}

export default forwardRef(FormField);
