package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class HomePage extends BaseTest {
    BasePage base;

    @Test
    public void testBtnStartLearning() {
        base = new BasePage(driver);

        base.click(By.xpath("//button[normalize-space()='Bắt đầu học ngay!']"));

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlContains("/login"));

        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("/login"),
                "❌ Nút 'Bắt đầu học ngay!' không điều hướng về Login! URL hiện tại: " + currentUrl);
    }

    @Test
    public void testBtnExploreMore() {
        base = new BasePage(driver);

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Khám phá thêm']")));

        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);

        wait.until(ExpectedConditions.urlContains("/login"));

        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("/login"),
                "❌ Nút 'Khám phá thêm' không điều hướng về Login! URL hiện tại: " + currentUrl);
    }

}
