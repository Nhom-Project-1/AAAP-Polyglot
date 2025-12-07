package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;
import utils.ExcelUtils;

import java.util.ArrayList;
import java.util.List;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class Goal extends BaseTest {
    BasePage base;

    private void openGoalPage() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");
        base.click(By.xpath("//span[normalize-space()='Mục tiêu']"));
        Thread.sleep(1000);
    }

    @Test
    public void TC1_listGoal() throws Exception {
        openGoalPage();
        ExcelUtils.loadExcel("src/test/java/data/TestData.xlsx", "GoalTest");
        int totalRows  = ExcelUtils.getRowCount();

        List<WebElement> goals = driver.findElements(By.cssSelector(".flex.flex-col.gap-1.mb-8"));

        for (int i = 1; i < totalRows; i++) {
            String expectedGoalName = ExcelUtils.getCellData(i, 1);
            WebElement goalElement = goals.get(i - 1);
            String actualGoalName = goalElement.findElement(By.cssSelector(".text-gray-700.font-medium")).getText();
            System.out.println("🟢 UI:  "+ actualGoalName +" | Excel: "+ expectedGoalName);
            assertEquals("Tên mục tiêu không khớp", expectedGoalName, actualGoalName);
        }
    }

    @Test
    public void TC2_verifyGoalStatusBasedOnXP() throws Exception {
        openGoalPage();
//        WebElement xpElement = base.waitForElementVisible(By.cssSelector(".text-yellow-400"));
//        int currentXP = Integer.parseInt(xpElement.getText().trim());
//        System.out.println("⭐ XP hiện tại của người dùng: " + currentXP);

        By goalsLocator = By.cssSelector(".flex.flex-col.gap-1.mb-8");
        List<WebElement> goals = driver.findElements(goalsLocator);

        WebElement goal1 = goals.get(0); // 30XP, hoàn thành
        WebElement goal2 = goals.get(1); // 50XP, chưa hoàn thành

        By checkIconLocator = By.cssSelector("svg.lucide-circle-check-big");
        boolean goal1Completed = goal1.findElements(checkIconLocator).size() > 0;
        assertTrue(goal1Completed, "❌ Mục tiêu 30XP chưa hoàn thành.");

        By continueBtnLocator = By.xpath(".//span[text()='Tiếp tục học']");
        boolean goal2Continue = goal2.findElements(continueBtnLocator).size() > 0;
        assertTrue(goal2Continue, "❌ Mục tiêu 50XP không hiển thị 'Tiếp tục học'.");

        System.out.println("✅ Mục tiêu 30XP hoàn thành, 50XP hiển thị 'Tiếp tục học'");
    }

    @Test
    public void TC4_verifyXPProgressBar() throws Exception {
        openGoalPage();
//        WebElement xpElement = base.waitForElementVisible(By.cssSelector(".text-yellow-400"));
//        int currentXP = Integer.parseInt(xpElement.getText().trim());
//        System.out.println("⭐ XP hiện tại của người dùng: " + currentXP);

        int currentXP = 36;

        By goalsLocator = By.cssSelector(".flex.flex-col.gap-1.mb-8");
        java.util.List<WebElement> goals = driver.findElements(goalsLocator);

        int maxCheck = Math.min(3, goals.size());

        for (int i = 0; i < maxCheck; i++) {
            WebElement goal = goals.get(i);

            // Lấy XP mục tiêu
            String goalText = goal.findElement(By.cssSelector(".text-gray-700.font-medium")).getText();
            int targetXP = Integer.parseInt(goalText.replaceAll("[^0-9]", ""));

            // Lấy width của progress bar hiện tại
            WebElement progressBar = goal.findElement(By.cssSelector("div.bg-pink-500"));
            String widthStyle = progressBar.getAttribute("style");
            int widthPercent = Integer.parseInt(widthStyle.replaceAll("[^0-9]", ""));

            // Tính expected percent
            int expectedPercent = Math.min((currentXP * 100) / targetXP, 100);

            System.out.println("Goal: " + targetXP + "XP | Progress bar: " + widthPercent + "% | Expected: " + expectedPercent + "%");

            // Kiểm tra progress bar đúng
            assertTrue(Math.abs(widthPercent - expectedPercent) <= 2, "❌ Progress bar không đúng cho mục tiêu " + targetXP + "XP");
        }

        System.out.println("✅ Thanh tiến độ XP hiển thị đúng cho 3 mục tiêu đầu");
    }

}
