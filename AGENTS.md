# Repository Guidelines

## Project Structure & Module Organization
Runtime code lives in `src/main/java/com/grecale/grecale_backend`. `Domain/entities` defines JPA models, `Domain/dto` carries API payloads, `repository` wraps Spring Data CRUD, `services` holds business logic, and `rest` exposes controllers.
`configuration` wires helpers such as `MenuDataInitializer`, while security and exception layers stay in their matching folders.
Resources under `src/main/resources` store profile configs, templates, static files, and the Excel seed in `data/menu-data.xlsx`.
Tests mirror the package layout in `src/test/java`. Keep build artefacts in `target/` and frontend assets in `bar-frontend/`.

## Build, Test & Development Commands
Run `./mvnw clean verify` (Windows: `mvnw.cmd clean verify`) before any push; it executes the full build and test suite.
Start the API with `./mvnw spring-boot:run -Dspring.profiles.active=dev` for the dev profile and in-memory H2 database.
Use `./mvnw test` for quicker feedback.
Regenerate OpenAPI output with `./mvnw clean springdoc-openapi:generate` and inspect `mvn-openapi-out.log`.

## Coding Style & Naming Conventions
Target Java 17, UTF-8 files, and four-space indentation (respect existing tabs in legacy classes).
Keep packages lowercase with the underscore namespace, classes in PascalCase, and suffix Spring stereotypes (`CategoryController`, `ItemService`).
Name DTOs `<Entity>NameDto`, repositories `JpaRepository` specialisations, and services with imperative verbs.
Prefer Lombok for boilerplate but add explicit constructors when Jackson needs them.
Share constants via `Enum/` or dedicated config classes rather than scattering strings.

## Testing Guidelines
Create JUnit 5 tests alongside the code under test using the `*Tests` suffix.
Reach for slice annotations (`@DataJpaTest`, `@WebMvcTest`) to keep suites fast and reserve `@SpringBootTest` for cross-layer integration.
Mock outbound calls, seed deterministic data through builders or repositories, and avoid coupling assertions to the Excel import.
A passing `./mvnw clean verify` is required before merge; cover both success and failure paths when touching services or controllers.

## Commit & Pull Request Guidelines
The shipped snapshot omits `.git`, yet the upstream history follows Conventional Commit prefixes such as `feat(menu): seed breakfast items`.
Keep subjects imperative and no more than 72 characters, note breaking changes with `!`, and reference tickets in the body.
Pull requests must summarise scope, list commands executed (include `./mvnw clean verify` output), and add screenshots or sample JSON whenever endpoints change.

## Configuration & Environment Notes
Select profiles via `-Dspring.profiles.active`. Store secrets in environment variables, leaving `application.yml`, `application-dev.yml`, and `application-openapi.yml` for non-sensitive defaults.
Updating `data/menu-data.xlsx` affects startup seeding; document schema or naming changes within the pull request.
