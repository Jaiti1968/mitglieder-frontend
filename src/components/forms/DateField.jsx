import { Controller } from "react-hook-form";
import { normalizeGermanDateInput } from "../../utils/forms/dateHelpers";
import FormField from "./FormField";

export default function DateField({ name, control, label, error, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormField
          {...props}
          label={label}
          type="text"
          placeholder="TT.MM.JJJJ"
          error={error}
          value={field.value ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const normalizedValue = normalizeGermanDateInput(value);

            field.onChange(normalizedValue);
          }}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      )}
    />
  );
}
