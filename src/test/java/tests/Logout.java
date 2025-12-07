package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import java.time.Duration;

import static org.testng.Assert.assertTrue;

public class Logout extends BaseTest {
    BasePage base;
    WebDriverWait wait;

    private void loginAndOpenLogoutOverlay() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test1", "Test11!!");

        WebElement learningTab = base.waitForElementVisible(By.xpath("//span[normalize-space()='Học tập']"));
        assertTrue(learningTab.isDisplayed(), "Không thấy mục 'Học tập' sau khi đăng nhập!");

        // Mở popup đăng xuất
        base.click(By.xpath("//button[normalize-space()='Đăng xuất']"));

        // Đợi overlay xuất hiện
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.fixed.inset-0.bg-black\\/30")));
    }

    private void waitForOverlayToDisappear() {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(
                By.cssSelector("div.fixed.inset-0.bg-black\\/30")
        ));
    }

    private void verifyStillOnLearningPage() {
        WebElement stillLearningTab = base.waitForElementVisible(By.xpath("//span[normalize-space()='Học tập']"));
        assertTrue(stillLearningTab.isDisplayed(), "Trang 'Học tập' không hiển thị sau khi hủy đăng xuất!");
    }

    @Test
    public void TC1_logoutSuccess() throws Exception {
        loginAndOpenLogoutOverlay();

        WebElement confirmLogout = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[contains(@class, 'fixed')]//button[contains(text(),'Đăng xuất')]")
        ));
        confirmLogout.click();

        waitForOverlayToDisappear();

        WebElement dashboardTitle = base.waitForElementVisible(
                By.xpath("//h1[normalize-space()='Một từ khởi đầu - Một thế giới mở ra']")
        );
        assertTrue(dashboardTitle.isDisplayed(), "Không thấy tiêu đề trang chủ sau khi đăng xuất!");
    }

    @Test
    public void TC2_logoutFail_X() throws Exception {
        loginAndOpenLogoutOverlay();

        WebElement cancelLogoutBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class, 'absolute') and contains(@class, 'top-3') and text()='✕']")
        ));
        cancelLogoutBtn.click();

        waitForOverlayToDisappear();

        verifyStillOnLearningPage();
    }

    @Test
    public void TC3_logoutFail_Cancel() throws Exception {
        loginAndOpenLogoutOverlay();

        WebElement cancelLogoutBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Hủy']")
        ));
        cancelLogoutBtn.click();

        waitForOverlayToDisappear();

        verifyStillOnLearningPage();
    }
}
