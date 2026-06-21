FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY eureka-server/pom.xml ./eureka-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY user-service/pom.xml ./user-service/pom.xml
COPY post-service/pom.xml ./post-service/pom.xml
COPY comment-service/pom.xml ./comment-service/pom.xml
COPY like-dislike-service/pom.xml ./like-dislike-service/pom.xml
RUN mvn dependency:go-offline -pl comment-service -B 2>/dev/null || true
COPY comment-service/src ./comment-service/src
RUN mvn package -pl comment-service -DskipTests -B

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/comment-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
