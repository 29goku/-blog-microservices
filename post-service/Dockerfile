FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY post-service/pom.xml ./post-service/pom.xml
RUN mvn dependency:go-offline -pl post-service -B 2>/dev/null || true
COPY post-service/src ./post-service/src
RUN mvn package -pl post-service -DskipTests -B

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/post-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
