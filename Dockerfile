# Dockerfile for Spring Boot
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy your jar file (replace with your actual jar name)
COPY target/01blog.jar app.jar

# Expose high port (rootless Docker cannot bind <1024)
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
