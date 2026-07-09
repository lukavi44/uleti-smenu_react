import { JobPostDTO } from "../DTOs/JobPost.dto";

const toIsoDate = (value: Date | string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

export const serializeJobPostPayload = (body: JobPostDTO): Record<string, unknown> => {
  const startingDate = toIsoDate(body.startingDate);
  if (!startingDate) {
    throw new Error("Starting date is required.");
  }

  const payload: Record<string, unknown> = {
    title: body.title,
    description: body.description,
    position: body.position,
    status: body.status,
    salary: body.salary,
    startingDate,
    restaurantLocationId: body.restaurantLocationId,
  };

  const visibleUntil = toIsoDate(body.visibleUntil);
  if (visibleUntil) {
    payload.visibleUntil = visibleUntil;
  }

  return payload;
};
