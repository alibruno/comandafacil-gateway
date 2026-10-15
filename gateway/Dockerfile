FROM eclipse-temurin:25-jdk

WORKDIR /app
COPY . .
RUN ./mvnw -q -DskipTests package

EXPOSE 8080
CMD ["java", "-jar", "target/gateway-0.0.1-SNAPSHOT.jar"]
