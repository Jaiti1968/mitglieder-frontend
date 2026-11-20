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
            field.onChange(event.target.value);
          }}
          onBlur={(event) => {
            const normalizedValue = normalizeGermanDateInput(
              event.target.value,
            );

            if (normalizedValue !== event.target.value) {
              field.onChange(normalizedValue);
            }

            field.onBlur();
          }}
          name={field.name}
          ref={field.ref}
        />
      )}
    />
  );
}
