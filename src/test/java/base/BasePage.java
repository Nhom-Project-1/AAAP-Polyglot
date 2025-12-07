package base;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    // Chờ element có trong DOM
    public WebElement waitForElementVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    // Chờ element có thể click
    public WebElement waitForElementClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    //chờ element biến mất
    public void waitForElementInvisible(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public List<WebElement> waitForElementsVisible(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    // Click tiện lợi
    public void click(By locator) {
        waitForElementClickable(locator).click();
    }

    // Gõ text
    public void type(By locator, String text) {
        WebElement element = waitForElementVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    //Login success
    public void loginSuccess(String identifier, String password) {
        click(By.xpath("//button[normalize-space()='Đăng nhập']"));
        type(By.xpath("//label[normalize-space()='Tên đăng nhập hoặc email']/following-sibling::input"), identifier);
        type(By.xpath("//label[normalize-space()='Mật khẩu']/following::input"), password);
        click(By.xpath("//button[normalize-space()='Đăng nhập']"));
    }
}
