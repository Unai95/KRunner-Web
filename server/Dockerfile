FROM maven:3.9.9-eclipse-temurin-21 AS runner-build

WORKDIR /build
COPY runner/pom.xml runner/pom.xml
COPY runner/src runner/src
RUN mvn -q -f runner/pom.xml package

FROM node:20-bookworm-slim AS web-build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src src
COPY assets assets
RUN npm run build

FROM eclipse-temurin:21-jdk-jammy

# Instalar Node 20 para ejecutar el servidor Express.
# El runner necesita JDK, no solo JRE, porque usa el compilador Kotlin embebido.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Runner Kotlin compilado dentro del build de Docker.
COPY --from=runner-build /build/runner/target/kotlin-local-runner-0.1.0.jar ./kotlin-local-runner.jar

# Frontend de produccion servido por Express.
COPY --from=web-build /build/dist /dist

# Dependencias Node del servidor.
COPY server/package.json ./
RUN npm install --omit=dev

# Codigo del servidor.
COPY server/server.js server/runner.js server/validation.js ./

EXPOSE 3001
CMD ["node", "server.js"]
