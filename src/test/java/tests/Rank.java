package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;
import utils.ExcelUtils;

import java.util.List;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;


public class Rank extends BaseTest {
    BasePage base;

    private void openRankingPage() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");
        base.click(By.xpath("//span[normalize-space()='Bảng xếp hạng']"));
        Thread.sleep(1000);
    }

    @Test
    public void TC1_verifyTop10Ranking() throws Exception{
        openRankingPage();

        ExcelUtils.loadExcel("src/test/java/data/TestData.xlsx", "RankTest");
        int totalRows = 10;

        List<WebElement> rows = driver.findElements(By.cssSelector("table tbody tr"));

        for (int i = 0; i < totalRows; i++) {
            WebElement row = rows.get(i);

            String uiRank = row.findElement(By.cssSelector("td:nth-child(1)")).getText().trim();
            String uiUsername = row.findElement(By.cssSelector("td:nth-child(2)")).getText().trim();
            String uiXP = row.findElement(By.cssSelector("td:nth-child(3)")).getText().trim();

            String expectedRank = ExcelUtils.getCellData(i+1, 1);
            String expectedUsername = ExcelUtils.getCellData(i+1, 2);
            String expectedXP = ExcelUtils.getCellData(i+1, 3);

            System.out.println("UI: " + uiRank + " | " + uiUsername + " | " + uiXP);
            System.out.println("Excel: " + expectedRank + " | " + expectedUsername + " | " + expectedXP);

            assertEquals("❌ Rank không khớp", expectedRank, uiRank);
            assertEquals("❌ Username không khớp", expectedUsername, uiUsername);
            assertEquals("❌ XP không khớp", expectedXP, uiXP);
        }

        System.out.println("✅ Top 10 bảng xếp hạng hiển thị đúng với dữ liệu DB/Excel");
    }

    @Test
    public void TC02_getCurrentUserRank() throws Exception{
        openRankingPage();

        WebElement tableBody = base.waitForElementVisible(By.cssSelector("table tbody"));
        List<WebElement> rows = tableBody.findElements(By.tagName("tr"));

        String currentUsername = "phuonganh";
        boolean found = false;

        for (WebElement row : rows) {
            if (!row.isDisplayed()) continue;

            List<WebElement> cells = row.findElements(By.tagName("td"));
            if (cells.size() < 3) continue;

            String username = cells.get(1).getText().trim();
            if (username.equals(currentUsername)) {
                String rank = cells.get(0).getText().trim();
                String xp = cells.get(2).getText().trim();
                System.out.println("⭐ Người dùng: " + username + " | Hạng: " + rank + " | XP: " + xp);
                found = true;
                break;
            }
        }
        assertTrue(found, "❌ Người dùng hiện tại không xuất hiện trong bảng xếp hạng");
    }

}
