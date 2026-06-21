FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY eureka-server/pom.xml ./eureka-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY user-service/pom.xml ./user-service/pom.xml
COPY post-service/pom.xml ./post-service/pom.xml
COPY comment-service/pom.xml ./comment-service/pom.xml
COPY like-dislike-service/pom.xml ./like-dislike-service/pom.xml
RUN mvn dependency:go-offline -pl user-service -B 2>/dev/null || true
COPY user-service/src ./user-service/src
RUN mvn package -pl user-service -DskipTests -B

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
