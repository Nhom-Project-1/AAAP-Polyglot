plugins {
    id("java")
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    // https://mvnrepository.com/artifact/org.testng/testng
    testImplementation("org.testng:testng:7.11.0")
    // https://mvnrepository.com/artifact/org.seleniumhq.selenium/selenium-java
    implementation("org.seleniumhq.selenium:selenium-java:4.35.0")
    // https://mvnrepository.com/artifact/io.github.bonigarcia/webdrivermanager
    implementation("io.github.bonigarcia:webdrivermanager:6.2.0")
    // Logging (fix warning SLF4J, hiển thị log ra console)
    implementation("org.slf4j:slf4j-simple:2.0.13")
    // Qase TestNG client
    testImplementation ("io.qase:qase-testng:3.1.1")
}

tasks.test {
    useJUnitPlatform()
    useTestNG()
    testLogging {
        events("passed", "skipped", "failed")
    }
}