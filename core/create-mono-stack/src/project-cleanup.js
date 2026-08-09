import { join } from "node:path";

async function cleanDestination(destination, existed, dependencies) {
  const errors = [];
  if (!existed) {
    try {
      await dependencies.rm(destination, { force: true, recursive: true });
    } catch (error) {
      errors.push(error);
    }
    return errors;
  }

  let entries;
  try {
    entries = await dependencies.readdir(destination);
  } catch (error) {
    return [error];
  }
  for (const entry of entries) {
    try {
      await dependencies.rm(join(destination, entry), {
        force: true,
        recursive: true
      });
    } catch (error) {
      errors.push(error);
    }
  }
  return errors;
}

export async function cleanupFailedProject(
  { destination, destinationExisted, setupError, temporaryRoot },
  dependencies
) {
  const errors = [setupError];
  errors.push(
    ...(await cleanDestination(destination, destinationExisted, dependencies))
  );
  try {
    await dependencies.rm(temporaryRoot, { force: true, recursive: true });
  } catch (error) {
    errors.push(error);
  }

  if (errors.length > 1) {
    throw new AggregateError(
      errors,
      `Project setup failed: ${setupError instanceof Error ? setupError.message : String(setupError)}. Cleanup also failed.`,
      { cause: setupError }
    );
  }
  throw setupError;
}
