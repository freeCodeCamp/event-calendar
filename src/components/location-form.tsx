import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { Button, Stack } from "@mui/material";
import { type Point, type Feature } from "@turf/helpers";

import { type Location, locationSchema } from "@/validation/schema";
import FormField from "@/components/form-field";

export function LocationForm({
    userPosition,
    onSubmit,
  }: {
    userPosition: Feature<Point>;
    onSubmit: (data: Location) => void;
  }) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Location>({
      defaultValues: {
        latitude: userPosition?.geometry.coordinates[1],
        longitude: userPosition?.geometry.coordinates[0],
      },
      resolver: typeboxResolver(locationSchema),
    });
  
    // TODO: DRY this and add-event out, they're almost identical.
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FormField
            label="Latitude: "
            type="text"
            helperText="Latitude must be between -90 and 90 inclusive"
            errors={errors}
            {...register("latitude", { required: true, valueAsNumber: true })}
          />
          <FormField
            label="Longitude: "
            type="text"
            helperText="Longitude must be between -180 and 180 inclusive"
            errors={errors}
            {...register("longitude", { required: true, valueAsNumber: true })}
          />
          <Button data-cy="submit-location" type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    );
  }
  