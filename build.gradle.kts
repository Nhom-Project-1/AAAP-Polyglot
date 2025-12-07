plugins {
    id("java")
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // https://mvnrepository.com/artifact/org.testng/testng
    testImplementation("org.testng:testng:7.11.0")
    // https://mvnrepository.com/artifact/org.seleniumhq.selenium/selenium-java
    implementation("org.seleniumhq.selenium:selenium-java:4.35.0")
    // https://mvnrepository.com/artifact/io.github.bonigarcia/webdrivermanager
    implementation("io.github.bonigarcia:webdrivermanager:6.2.0")
    // Logging (fix warning SLF4J, hiển thị log ra console)
    implementation("org.slf4j:slf4j-simple:2.0.13")
    // Apache POI
    implementation("org.apache.poi:poi:5.2.5")
    implementation("org.apache.poi:poi-ooxml:5.2.5")
    testImplementation("com.sun.mail:javax.mail:1.6.2")
}

tasks.test {
    useTestNG()
    testLogging {
        events("passed", "skipped", "failed")
    }
}