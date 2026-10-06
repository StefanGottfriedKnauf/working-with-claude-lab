# ops-dashboard

Marlowe & Finch ops wall-screen: Spring Boot 3 / Java 17 REST API (Spring JDBC, Flyway, no JPA) plus a plain-JS page.

- Run: `SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run` (in-memory H2) then open http://localhost:8080
- Test: `./mvnw test` (Java, no DB needed) and `npm test` (Jest + jsdom). Both must stay green.
- Backend: `src/main/java/com/marlowefinch/ops/`, read-only JSON under `/api`; migrations in `src/main/resources/db/`.
- Frontend: `src/main/resources/static/` (`index.html`, `app.js`, `style.css`). No framework, no build step.
- All app code lives in `initApp(document, fetchImpl)` in `app.js` so Jest can run it; keep it that way.
- Jest harness: `src/test/javascript/setup/loadApp.js`. Every new element id in `index.html` must be added to `REGISTERED_IDS`.
- Colours live in CSS variables in `style.css`, never in JavaScript.
- Tickets are in `docs/tickets/`; the ticket file wins over chat.
- pom.xml dependencies are frozen. Any change needs a CHG ticket.
