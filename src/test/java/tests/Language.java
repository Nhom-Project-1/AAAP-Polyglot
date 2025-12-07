package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.AssertJUnit;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class Language extends BaseTest {
    BasePage base;
    WebDriverWait wait;

    private void login() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");
    }

    public void logout() {
        base.click(By.xpath("//button[normalize-space()='Đăng xuất']"));

        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.fixed.inset-0.bg-black\\/30")));

        base.click(By.xpath("//div[contains(@class, 'fixed')]//button[contains(text(),'Đăng xuất')]"));
    }

    public void selectLanguage(String lang) {
        WebElement langButton = base.waitForElementVisible(
                By.xpath("//button[.//p[normalize-space()='" + lang + "']]")
        );
        langButton.click();
    }

    public void verifyChooseLanguageReminder() {
        WebElement reminderMsg = base.waitForElementVisible(
                By.xpath("//h1[contains(normalize-space(.),'Chọn một ngôn ngữ bạn muốn học')]")
        );
        assertTrue(reminderMsg.isDisplayed(), "❌ Không hiển thị thông báo yêu cầu chọn ngôn ngữ!");
    }

//    @Test
//    public void TC1_UserNotSelectLanguage() throws Exception {
//        login();
//        verifyChooseLanguageReminder();
//
//        base.click(By.xpath("//span[normalize-space()='Tài khoản']"));
//        base.waitForElementVisible(
//                By.xpath("//h1[normalize-space()='Thông tin người dùng']")
//        );
//
//        base.click(By.xpath("//span[normalize-space()='Học tập']"));
//
//        verifyChooseLanguageReminder();
//    }

    @Test
    public void TC04_LanguagePersistAfterLogin() throws Exception {
        login();

        String language = "Tiếng Trung";

        WebElement reopenFlagBtn = base.waitForElementVisible(
                By.xpath("//div[contains(@class,'rounded-lg') and .//img[contains(@src,'flag-icons')]]")
        );
        reopenFlagBtn.click();

        selectLanguage(language);

        base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Đã chọn " + language + "')]")
        );
        base.waitForElementInvisible(
                By.xpath("//*[contains(text(),'Đã chọn " + language + "')]")
        );
        Thread.sleep(2000);
        logout();

        login();
        WebElement currentFlag = base.waitForElementVisible(
                By.xpath("//div[contains(@class,'rounded-lg') and .//img[contains(@src,'flag-icons')]]")
        );
        assertTrue(currentFlag.isDisplayed(), "❌ Giao diện không hiển thị đúng ngôn ngữ đã chọn sau khi đăng nhập lại!");

        WebElement unitDiv = base.waitForElementVisible(
                By.cssSelector("div.bg-pink-400.text-white.rounded-lg.shadow-md")
        );
        String unitTitle = unitDiv.findElement(By.xpath(".//h2[1]")).getText();
        String unitSubtitle = unitDiv.findElement(By.xpath(".//h2[2]")).getText();

        assertEquals("Unit 1", unitTitle);
        assertEquals("Bắt đầu với Tiếng Trung cơ bản", unitSubtitle);
    }

    @Test
    public void TC05_LanguageSelection() throws Exception {
        login();

        String language = "Tiếng Anh";

        WebElement reopenFlagBtn = base.waitForElementVisible(
                By.xpath("//div[contains(@class,'rounded-lg') and .//img[contains(@src,'flag-icons')]]")
        );
        reopenFlagBtn.click();

        WebElement reminderMsg = base.waitForElementVisible(
                By.xpath("//h1[contains(normalize-space(.),'Chọn một ngôn ngữ bạn muốn học')]")
        );
        assertTrue(reminderMsg.isDisplayed(), "❌ Không hiển thị thông báo yêu cầu chọn ngôn ngữ!");

        selectLanguage(language);

        base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Đã chọn " + language + "')]")
        );
        base.waitForElementInvisible(
                By.xpath("//*[contains(text(),'Đã chọn " + language + "')]")
        );

        WebElement currentFlag = base.waitForElementVisible(
                By.xpath("//div[contains(@class,'rounded-lg') and .//img[contains(@src,'flag-icons')]]")
        );
        assertTrue(currentFlag.isDisplayed(), "❌ Giao diện không hiển thị đúng ngôn ngữ đã chọn sau khi đăng nhập lại!");
    }
}
