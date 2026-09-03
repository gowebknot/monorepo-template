import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const swaggerPath = "api/docs";

export function getSwaggerUrl(port: number): string {
  return `http://localhost:${port}/${swaggerPath}`;
}

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Monorepo Template API")
    .setDescription(
      "Production API documentation. Shared request and response contracts are owned by @monorepo-template/entities."
    )
    .setVersion("1.0")
    .setExternalDoc(
      "Better Auth API documentation",
      "https://www.better-auth.com/docs"
    )
    .addTag("Health", "Server readiness and liveness operations.")
    .addTag(
      "Authentication",
      "Better Auth owns the concrete authentication endpoint contracts."
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: "Monorepo Template API Docs"
  });
}
