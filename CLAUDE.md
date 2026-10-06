# ops-dashboard: Spring Boot 3 / Java 17 API (Spring JDBC, Flyway) plus a plain-JS page
- Run: `SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run`, then open http://localhost:8080
- Test: `./mvnw test` and `npm test`; both must stay green.
- Backend: `src/main/java/com/marlowefinch/ops/`, read-only JSON under `/api`, Flyway in `src/main/resources/db/`.
- Frontend: `src/main/resources/static/` (index.html, app.js, style.css), no framework, no build step; app code lives in `initApp()` so Jest can run it.
- Every new element id in index.html must be added to `REGISTERED_IDS` in `src/test/javascript/setup/loadApp.js`.
- Colours live in CSS variables in style.css, never in JavaScript.
- Tickets are in `docs/tickets/`; the ticket file wins over chat.
- pom.xml dependencies are frozen. Any change needs a CHG ticket.
