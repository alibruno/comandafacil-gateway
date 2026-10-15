FROM eclipse-temurin:25-jdk

WORKDIR /app
COPY . .
RUN ./mvnw -q -DskipTests package

EXPOSE 8081
CMD ["java", "-jar", "target/restaurantes-0.0.1-SNAPSHOT.jar"]
